import type { SectionConfig } from '../types';
export const flows: SectionConfig = {
  id: 'flows', title: 'Flows', group: 'core', icon: '⇢', shape: 'list',
  intro: 'Describe the journeys a user takes through the app. Use Decision steps for branching paths.',
  fields: [
    { key: 'name', label: 'Flow name', type: 'text', placeholder: 'e.g. First visit, Quiz completion' },
    { key: 'category', label: 'Category', type: 'text', optional: true },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'steps', label: 'Steps', type: 'custom', widget: 'flow-steps' },
    { key: 'acceptance', label: 'Done when…', type: 'textarea', optional: true, hint: 'Acceptance criteria for this flow.' },
  ],
};
