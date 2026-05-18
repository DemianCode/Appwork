import type { SectionConfig } from '../types';
export const data: SectionConfig = {
  id: 'data', title: 'Data', group: 'logic', icon: '⊡', shape: 'list',
  intro: 'What does the app need to remember? Include user answers, profile data, saved preferences, external content.',
  fields: [
    { key: 'name', label: 'Name', type: 'text', placeholder: 'e.g. Quiz answers, User profile' },
    { key: 'source', label: 'Source', type: 'select', options: ['User input', 'Calculated', 'External API', 'System generated', 'Imported'] },
    { key: 'description', label: 'What it represents', type: 'textarea' },
    { key: 'usedIn', label: 'Used in', type: 'textarea' },
    { key: 'category', label: 'Category', type: 'text', optional: true },
    { key: 'fields', label: 'Fields', type: 'custom', widget: 'data-fields', optional: true },
  ],
};
