import type { SectionConfig } from '../types';
export const brandColour: SectionConfig = {
  id: 'brandColour', title: 'Colour direction', group: 'context', icon: '◑', shape: 'object', parentId: 'brand',
  intro: 'The palette and how it is used.',
  details: 'The direction text captures intent ("neutral with a single warm accent"). The colour list captures the actual swatches with names and usage notes. Pick colours via the visual picker or paste HEX, HSL, or RGB.',
  fields: [
    { key: 'editor', label: 'Colour direction', type: 'custom', widget: 'brand-colour' },
  ],
};
