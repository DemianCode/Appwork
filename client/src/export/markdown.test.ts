import { describe, it, expect } from 'vitest';
import { toMarkdown } from './markdown';
import '@/sections/register';
import './widgetExporters';
import type { Project } from '@/schema/types';

const p: Project = {
  id: 'demo',
  meta: { name: 'Demo', createdAt: '', updatedAt: '', schemaVersion: 1 },
  sections: {
    overview: { name: 'Demo', tagline: 'Demo app', problem: 'A problem' },
    roles: [{ id: 'r1', name: 'Buyer', description: 'Buys', canDo: 'browse' }],
    screens: [{ id: 's1', name: 'Home', purpose: 'Landing', seenBy: ['r1'] }],
  },
};

describe('toMarkdown', () => {
  it('includes project name and problem blockquote', () => {
    const md = toMarkdown(p);
    expect(md).toMatch(/^# Demo/);
    expect(md).toContain('> A problem');
  });

  it('renders ref values as names', () => {
    const md = toMarkdown(p);
    expect(md).toContain('Who sees it:** Buyer');
  });

  it('includes AI planning footer', () => {
    expect(toMarkdown(p)).toContain('Brief for AI planning');
  });
});
