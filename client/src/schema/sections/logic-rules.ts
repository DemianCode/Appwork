import type { SectionConfig } from '../types';
export const logicRules: SectionConfig = {
  id: 'logicRules', title: 'Simple rules', group: 'logic', icon: '·', shape: 'list',
  parentId: 'logic',
  intro: 'Plain-English app rules. "When X happens, then Y."',
  details: 'Use this for any decision the app makes that can be written as a sentence. Examples:\n\n• "When a user finishes the quiz, show their profile type."\n• "When the score is above 7, mark the profile as Thoughtful."\n• "Hide the upgrade banner once the user has paid."\n\nIf the rule needs typed user state (scores, flags), use Attributes + Scoring + Conditions + Outcomes instead — those let you build more reusable, layered logic.',
  fields: [
    { key: 'name', label: 'Rule name', type: 'text', placeholder: 'e.g. Show personalised results' },
    { key: 'type', label: 'Rule type', type: 'select', options: ['Display rule', 'Personalisation', 'Navigation', 'Validation', 'Calculation', 'Other'] },
    { key: 'condition', label: 'Condition — when does this apply?', type: 'textarea', placeholder: 'Describe in plain English' },
    { key: 'action', label: 'Action — what happens?', type: 'textarea' },
    { key: 'notes', label: 'Notes', type: 'textarea', optional: true, placeholder: 'Edge cases, exceptions' },
    { key: 'category', label: 'Category', type: 'text', optional: true },
  ],
};
