import type { SectionConfig } from '../types';
export const screens: SectionConfig = {
  id: 'screens', title: 'Screens', group: 'core', icon: '▢', shape: 'list',
  intro: 'List every page or screen. Think of them like rooms in a building — what is each one for and who goes there?',
  fields: [
    { key: 'name', label: 'Screen name', type: 'text', placeholder: 'e.g. Home, Quiz, Results' },
    { key: 'category', label: 'Category', type: 'text', placeholder: 'e.g. Onboarding, Core', optional: true },
    { key: 'purpose', label: 'Purpose', type: 'textarea' },
    { key: 'seenBy', label: 'Who sees it', type: 'ref', refSection: 'roles', refMulti: true },
    { key: 'shows', label: 'What it shows', type: 'textarea' },
    {
      key: 'states', label: 'States', type: 'list', optional: true,
      hint: 'Empty / loading / error / success states the dev should design.',
      itemFields: [
        { key: 'kind', label: 'Kind', type: 'select', options: ['empty', 'loading', 'error', 'success'] },
        { key: 'description', label: 'Description', type: 'textarea' },
      ],
    },
  ],
};
