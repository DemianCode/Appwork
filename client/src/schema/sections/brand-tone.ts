import type { SectionConfig } from '../types';
export const brandTone: SectionConfig = {
  id: 'brandTone', title: 'Tone', group: 'context', icon: '◐', shape: 'object', parentId: 'brand',
  intro: 'How the app should sound.',
  details: 'Tone words are quick descriptors of the brand voice. Tone description gives room for a richer narrative. Voice notes capture rules about how copy is written (e.g. "no jargon, contractions OK").',
  fields: [
    { key: 'editor', label: 'Tone', type: 'custom', widget: 'brand-tone' },
  ],
};
