import type { SectionConfig } from '../types';
export const logicGroups: SectionConfig = {
  id: 'logicGroups', title: 'Groups', group: 'logic', icon: '·', shape: 'list',
  parentId: 'logic',
  intro: 'Colour-coded labels for organising the rest of the logic.',
  details: "Groups don't change behaviour — they're labels that show up as colour dots on attributes, scoring, conditions, and outcomes so you can see at a glance what belongs together.\n\nExamples:\n\n• 'User profiling' (blue) — attributes + scoring related to figuring out who the user is.\n• 'Quiz progression' (green) — rules that move the user through the quiz.\n• 'Recommendation logic' (orange) — outcomes that change what the app shows.\n\nIf your app's logic is small, skip this and come back later.",
  fields: [
    { key: 'name', label: 'Group name', type: 'text', placeholder: 'e.g. User profiling' },
    { key: 'color', label: 'Colour', type: 'select', options: ['#5b8def', '#3dd68c', '#fbbf24', '#f87171', '#a78bfa', '#fb923c', '#22d3ee', '#f472b6'] },
  ],
};
