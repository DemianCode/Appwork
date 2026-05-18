import type { SectionConfig } from '../types';
export const overview: SectionConfig = {
  id: 'overview', title: 'Overview', group: 'core', icon: '◈', shape: 'object',
  intro: "Start here. Describe your app in plain terms — what it does, who it's for, and why someone would use it.",
  fields: [
    { key: 'name', label: 'App name', type: 'text', placeholder: 'e.g. HouseMatch' },
    { key: 'tagline', label: 'One-line description', type: 'text', placeholder: 'What does this app do in one sentence?' },
    { key: 'targetUsers', label: 'Who uses it', type: 'enum-chips', options: [], hint: 'Add primary user types (chips appear after typing them in Roles).' },
    { key: 'problem', label: 'Problem it solves', type: 'textarea', placeholder: 'What frustration or gap does it address?' },
    { key: 'uniqueValue', label: 'What makes it valuable / different', type: 'textarea', placeholder: 'Your selling point.' },
    { key: 'successCriteria', label: 'How will you know it worked?', type: 'textarea', placeholder: 'e.g. 70% finish the quiz; users return within 7 days.', optional: true },
    {
      key: 'customNotes', label: 'Custom notes', type: 'list', optional: true,
      hint: 'Anything else worth keeping with this project — ideas, references, open thoughts, links.',
      itemFields: [
        { key: 'name', label: 'Title', type: 'text', placeholder: 'e.g. Inspiration, Tech notes, Open question' },
        { key: 'content', label: 'Notes', type: 'textarea' },
      ],
    },
  ],
};
