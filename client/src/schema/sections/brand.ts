import type { SectionConfig } from '../types';
export const brand: SectionConfig = {
  id: 'brand', title: 'Brand', group: 'context', icon: '🎨', shape: 'object',
  intro: 'How the app should look and sound. Even a few words help the engineer make consistent choices.',
  fields: [
    { key: 'toneWords', label: 'Tone words', type: 'enum-chips', options: ['formal', 'playful', 'calm', 'bold', 'warm', 'serious', 'minimal', 'expressive'], hint: 'Pick all that apply.' },
    { key: 'references', label: 'References', type: 'textarea', placeholder: 'URLs to apps/sites you like, or descriptive notes.' },
    { key: 'colourDirection', label: 'Colour direction', type: 'textarea', placeholder: 'e.g. neutral with a single warm accent', optional: true },
    { key: 'voiceNotes', label: 'Voice notes', type: 'textarea', placeholder: 'How copy should sound — friendly, terse, no jargon, etc.', optional: true },
  ],
};
