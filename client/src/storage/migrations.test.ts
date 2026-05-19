import { describe, it, expect } from 'vitest';
import { migrateBrandShape, migrateLegacy } from './migrations';
import type { Project } from '@/schema/types';

const now = new Date().toISOString();
const proj = (sections: Record<string, unknown>): Project => ({
  id: 'p', meta: { name: 'p', createdAt: now, updatedAt: now, schemaVersion: 1 }, sections,
});

describe('migrateBrandShape', () => {
  it('splits old brand object into three slots', () => {
    const p = proj({
      brand: {
        toneWords: ['playful', 'warm'],
        colourDirection: 'neutral with warm accent',
        references: 'https://linear.app',
        voiceNotes: 'friendly, no jargon',
      },
    });
    migrateBrandShape(p);
    expect(p.sections.brandTone).toEqual({
      words: ['playful', 'warm'], customWords: [], description: '', voiceNotes: 'friendly, no jargon',
    });
    expect(p.sections.brandColour).toEqual({ direction: 'neutral with warm accent', colours: [] });
    expect(p.sections.brandReferences).toEqual({ notes: 'https://linear.app', items: [] });
    expect(p.sections.brand).toBeUndefined();
  });

  it('is a no-op when already migrated', () => {
    const p = proj({
      brandTone: { words: ['cosy'], customWords: ['cosy'], description: '', voiceNotes: '' },
    });
    migrateBrandShape(p);
    expect(p.sections.brandTone).toEqual({ words: ['cosy'], customWords: ['cosy'], description: '', voiceNotes: '' });
  });

  it('is a no-op when brand is empty', () => {
    const p = proj({ brand: {} });
    migrateBrandShape(p);
    expect(p.sections.brand).toEqual({});
    expect(p.sections.brandTone).toBeUndefined();
  });
});

describe('migrateLegacy', () => {
  it('seeds empty brand child slots, no parent', () => {
    const p = migrateLegacy({});
    expect(p.sections.brand).toBeUndefined();
    expect(p.sections.brandTone).toEqual({ words: [], customWords: [], description: '', voiceNotes: '' });
    expect(p.sections.brandColour).toEqual({ direction: '', colours: [] });
    expect(p.sections.brandReferences).toEqual({ notes: '', items: [] });
  });
});
