import type { SectionConfig } from '../types';
export const logic: SectionConfig = {
  id: 'logic', title: 'Logic', group: 'logic', icon: '◆', shape: 'object',
  intro: 'Capture how the app decides things. Six sub-tools cover rules, groups, attributes, scoring, conditions, and outcomes — pick the ones your app needs.',
  fields: [
    { key: 'overview', label: 'Logic overview', type: 'custom', widget: 'logic-overview' },
  ],
};
