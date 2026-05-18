import type { SectionConfig } from '../types';
export const logic: SectionConfig = {
  id: 'logic', title: 'Logic', group: 'logic', icon: '◆', shape: 'object',
  intro: 'Plain rules for what changes based on who the user is or what they have done. Use the Attributes tab if your app has typed state per user (quiz scores, profile flags).',
  fields: [
    { key: 'tabs', label: 'Logic', type: 'custom', widget: 'logic-tabs' },
  ],
};
