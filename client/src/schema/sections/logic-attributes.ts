import type { SectionConfig } from '../types';
export const logicAttributes: SectionConfig = {
  id: 'logicAttributes', title: 'Attributes', group: 'logic', icon: '·', shape: 'list',
  parentId: 'logic',
  intro: 'Typed state the app remembers per user.',
  details: "An attribute is something the app stores about each user that can change over time. Scoring rules write to attributes. Conditions read from them.\n\nExamples:\n\n• thoughtful (number) — quiz score for thoughtfulness; starts at 0.\n• hasPaid (boolean) — whether the user has subscribed.\n• onboardingStage (text) — which step they're up to (e.g. 'quiz', 'results', 'paid').\n• favouriteColour (enum) — pick from a fixed list.\n\nIf you don't have any per-user state, you don't need this section.",
  fields: [
    { key: 'name', label: 'Attribute name', type: 'text', placeholder: 'e.g. thoughtful' },
    { key: 'type', label: 'Type', type: 'select', options: ['number', 'boolean', 'text', 'enum'] },
    { key: 'defaultValue', label: 'Default value', type: 'text', placeholder: 'e.g. 0, false, ""', optional: true },
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'What does this attribute measure?', optional: true },
    { key: 'groupId', label: 'Group', type: 'ref', refSection: 'logicGroups', optional: true },
  ],
};
