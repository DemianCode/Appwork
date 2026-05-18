import type { SectionConfig } from '../types';
export const triggers: SectionConfig = {
  id: 'triggers', title: 'Triggers', group: 'logic', icon: '⏰', shape: 'list',
  intro: 'Actions the app performs on a schedule or when an event happens (not user-initiated flows).',
  fields: [
    { key: 'name', label: 'Trigger name', type: 'text', placeholder: 'e.g. 24-hour reminder' },
    { key: 'triggerType', label: 'Type', type: 'select', options: ['time-based', 'event-based'] },
    { key: 'when', label: 'When it fires', type: 'textarea', placeholder: 'e.g. 24 hours after signup if quiz not completed' },
    { key: 'does', label: 'What it does', type: 'textarea', placeholder: 'e.g. Send email reminder with deep link to quiz' },
    { key: 'audience', label: 'Who receives', type: 'ref', refSection: 'roles', refMulti: true },
  ],
};
