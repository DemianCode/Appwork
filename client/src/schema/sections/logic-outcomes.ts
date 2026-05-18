import type { SectionConfig } from '../types';
export const logicOutcomes: SectionConfig = {
  id: 'logicOutcomes', title: 'Outcomes', group: 'logic', icon: '·', shape: 'list',
  parentId: 'logic',
  intro: 'What happens when conditions are met.',
  details: "An outcome is the visible result of logic — show a page, send a notification, unlock a feature, change a label. It ties one or more named Conditions to an action.\n\nExamples:\n\n• When 'Is Thoughtful' is true → show Thoughtful houses with quiet-street emphasis.\n• When 'Mid quiz' AND 'Hasn't seen tip 1' → show pop-up tip explaining how the score works.\n• When 'Is Subscribed' → hide all upgrade prompts.\n\nDefine your Conditions first.",
  fields: [
    { key: 'name', label: 'Outcome name', type: 'text', placeholder: 'e.g. Show Thoughtful results' },
    { key: 'conditionIds', label: 'Conditions met', type: 'ref', refSection: 'logicConditions', refMulti: true },
    { key: 'logic', label: 'Combine conditions with', type: 'select', options: ['AND', 'OR'] },
    { key: 'action', label: 'Action — what the app shows or does', type: 'textarea' },
    { key: 'groupId', label: 'Group', type: 'ref', refSection: 'logicGroups', optional: true },
  ],
};
