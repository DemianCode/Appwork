import type { SectionConfig } from '../types';
export const brand: SectionConfig = {
  id: 'brand', title: 'Brand', group: 'context', icon: '🎨', shape: 'object',
  intro: 'How the app should look and sound. Three sub-tools cover tone, colour direction, and references — pick the ones your app needs.',
  fields: [
    { key: 'overview', label: 'Brand overview', type: 'custom', widget: 'brand-overview' },
  ],
};
