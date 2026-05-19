import { registerWidget } from '@/renderer/widgets';
import { BrandOverviewWidget } from './BrandOverviewWidget';
import { BrandToneWidget } from './BrandToneWidget';
import { BrandColourWidget } from './BrandColourWidget';
import { BrandReferencesWidget } from './BrandReferencesWidget';
import { ColourPickerWidget } from './ColourPickerWidget';

registerWidget('brand-overview', BrandOverviewWidget);
registerWidget('brand-tone', BrandToneWidget);
registerWidget('brand-colour', BrandColourWidget);
registerWidget('brand-references', BrandReferencesWidget);
registerWidget('colour-picker', ColourPickerWidget);
