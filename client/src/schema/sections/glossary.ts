import type { SectionConfig } from '../types';
export const glossary: SectionConfig = {
  id: 'glossary', title: 'Glossary', group: 'context', icon: '📖', shape: 'list',
  intro: 'Domain terms specific to this app, defined in plain English.',
  fields: [
    { key: 'term', label: 'Term', type: 'text', placeholder: 'e.g. Profile type' },
    { key: 'definition', label: 'Definition', type: 'textarea' },
  ],
};
