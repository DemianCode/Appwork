import { overview } from './overview';
import { roles } from './roles';
import { screens } from './screens';
import { flows } from './flows';
import { logic } from './logic';
import { data } from './data';
import type { SectionConfig } from '../types';

export const SECTIONS: SectionConfig[] = [
  overview, roles, screens, flows, logic, data,
];
export const SECTION_MAP: Record<string, SectionConfig> = Object.fromEntries(SECTIONS.map((s) => [s.id, s]));
