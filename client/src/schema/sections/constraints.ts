import type { SectionConfig } from '../types';
export const constraints: SectionConfig = {
  id: 'constraints', title: 'Constraints', group: 'context', icon: '📐', shape: 'object',
  intro: 'Non-functional requirements — what the app must support beyond features.',
  fields: [
    { key: 'devices', label: 'Devices', type: 'text', placeholder: 'e.g. mobile-first, also desktop' },
    { key: 'offlineBehaviour', label: 'Offline behaviour', type: 'textarea', placeholder: 'e.g. read-only when offline, queue actions' },
    { key: 'languages', label: 'Languages', type: 'text', placeholder: 'e.g. English only at launch' },
    { key: 'accessibilityLevel', label: 'Accessibility level', type: 'select', options: ['none specified', 'basic (keyboard, contrast)', 'WCAG AA', 'WCAG AAA'] },
    { key: 'performance', label: 'Performance', type: 'textarea', placeholder: 'e.g. quiz must feel instant, results within 2s', optional: true },
    { key: 'dataRetention', label: 'Data retention / privacy', type: 'textarea', placeholder: 'How long is user data kept? Can users delete it?', optional: true },
  ],
};
