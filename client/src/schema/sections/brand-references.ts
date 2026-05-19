import type { SectionConfig } from '../types';
export const brandReferences: SectionConfig = {
  id: 'brandReferences', title: 'References', group: 'context', icon: '◒', shape: 'object', parentId: 'brand',
  intro: 'Sites or apps you want to draw inspiration from.',
  details: 'Use the notes field for quick thoughts or pasted URLs. Add structured references for items worth describing.',
  fields: [
    { key: 'editor', label: 'References', type: 'custom', widget: 'brand-references' },
  ],
};
