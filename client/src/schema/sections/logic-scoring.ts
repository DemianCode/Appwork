import type { SectionConfig } from '../types';
export const logicScoring: SectionConfig = {
  id: 'logicScoring', title: 'Scoring', group: 'logic', icon: '·', shape: 'list',
  parentId: 'logic',
  intro: 'What changes an attribute, and how.',
  details: "Each scoring rule says: when X happens, change attribute Y by Z. Use it to give the app a way to update what it remembers about a user.\n\nExamples:\n\n• Trigger: 'User answers Yes to quiz question 1' → increment thoughtful by 1.\n• Trigger: 'User clicks upgrade button' → set hasPaid to true.\n• Trigger: 'User completes onboarding' → set onboardingStage to \"done\".\n\nDefine your Attributes first — scoring rules reference them.",
  fields: [
    { key: 'name', label: 'Rule name', type: 'text', placeholder: 'e.g. Quiz Yes answer' },
    { key: 'trigger', label: 'Trigger', type: 'textarea', placeholder: 'What causes this to fire?' },
    { key: 'attributeId', label: 'Target attribute', type: 'ref', refSection: 'logicAttributes' },
    { key: 'operation', label: 'Operation', type: 'select', options: ['increment', 'decrement', 'set', 'toggle'] },
    { key: 'value', label: 'Value', type: 'text', placeholder: 'e.g. 1, true, "done"' },
    { key: 'groupId', label: 'Group', type: 'ref', refSection: 'logicGroups', optional: true },
  ],
};
