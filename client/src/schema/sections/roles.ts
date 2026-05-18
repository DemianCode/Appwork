import type { SectionConfig } from '../types';
export const roles: SectionConfig = {
  id: 'roles', title: 'Roles', group: 'core', icon: '👥', shape: 'list',
  intro: 'List the types of people who use the app. Roles get referenced from Screens and Triggers.',
  fields: [
    { key: 'name', label: 'Role name', type: 'text', placeholder: 'e.g. Buyer, Admin, Guest' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'canDo', label: 'What they can do', type: 'textarea' },
    { key: 'cannotDo', label: "What they can't do", type: 'textarea', optional: true },
    { key: 'sampleUser', label: 'Sample user', type: 'text', placeholder: 'e.g. Jane, 28, first-home buyer', optional: true },
  ],
};
