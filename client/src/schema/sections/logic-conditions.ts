import type { SectionConfig } from '../types';
export const logicConditions: SectionConfig = {
  id: 'logicConditions', title: 'Conditions', group: 'logic', icon: '·', shape: 'list',
  parentId: 'logic',
  intro: 'Named threshold checks on attributes. Reused in outcomes.',
  details: "A condition checks an attribute against a value and gives the check a name. Outcomes then reference conditions by name, so a single condition can trigger many outcomes.\n\nExamples:\n\n• 'Is Thoughtful' — thoughtful > 3\n• 'Is Subscribed' — hasPaid == true\n• 'Mid quiz' — onboardingStage == \"quiz\"\n\nDefine your Attributes first.",
  fields: [
    { key: 'name', label: 'Condition name', type: 'text', placeholder: 'e.g. Is Thoughtful' },
    { key: 'attributeId', label: 'Attribute', type: 'ref', refSection: 'logicAttributes' },
    { key: 'operator', label: 'Operator', type: 'select', options: ['>', '<', '>=', '<=', '==', '!=', 'contains', 'not contains'] },
    { key: 'value', label: 'Value', type: 'text', placeholder: 'e.g. 3, true, "done"' },
    { key: 'groupId', label: 'Group', type: 'ref', refSection: 'logicGroups', optional: true },
  ],
};
