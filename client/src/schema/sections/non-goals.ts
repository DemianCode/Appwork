import type { SectionConfig } from '../types';
export const nonGoals: SectionConfig = {
  id: 'nonGoals', title: 'Non-goals', group: 'context', icon: '✕', shape: 'list',
  intro: "What the app explicitly is NOT going to do. Helps stop scope creep.",
  fields: [
    { key: 'name', label: 'Non-goal', type: 'text', placeholder: 'e.g. Social feed, in-app chat' },
    { key: 'whyExcluded', label: 'Why not', type: 'textarea', placeholder: 'Reasoning — out of scope, defer to v2, etc.' },
  ],
};
