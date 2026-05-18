import type { SectionConfig } from '../types';
export const integrations: SectionConfig = {
  id: 'integrations', title: 'Integrations', group: 'logic', icon: '🔌', shape: 'list',
  intro: 'External services the app depends on — auth, payments, email, analytics, AI, maps.',
  fields: [
    { key: 'name', label: 'Service name', type: 'text', placeholder: 'e.g. Stripe, SendGrid, OpenAI' },
    { key: 'type', label: 'Type', type: 'select', options: ['auth', 'payments', 'email', 'analytics', 'storage', 'AI', 'maps', 'other'] },
    { key: 'purpose', label: 'Purpose', type: 'textarea', placeholder: 'What does this service do for the app?' },
    { key: 'whoPays', label: 'Who pays', type: 'text', placeholder: 'e.g. Per-user subscription, business pays', optional: true },
    { key: 'configNeeded', label: 'Config / keys needed', type: 'textarea', placeholder: 'e.g. Stripe API key, webhook URL', optional: true },
    { key: 'notes', label: 'Notes', type: 'textarea', optional: true },
  ],
};
