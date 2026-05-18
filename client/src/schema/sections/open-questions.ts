import type { SectionConfig } from '../types';
export const openQuestions: SectionConfig = {
  id: 'openQuestions', title: 'Open questions', group: 'context', icon: '❔', shape: 'list',
  intro: 'Things you have not decided yet. Park them here so they are not lost.',
  fields: [
    { key: 'question', label: 'Question', type: 'textarea' },
    { key: 'status', label: 'Status', type: 'select', options: ['open', 'answered', 'parked'] },
    { key: 'notes', label: 'Notes', type: 'textarea', optional: true },
  ],
};
