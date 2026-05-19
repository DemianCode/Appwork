import { overview } from './overview';
import { roles } from './roles';
import { screens } from './screens';
import { flows } from './flows';
import { logic } from './logic';
import { logicRules } from './logic-rules';
import { logicGroups } from './logic-groups';
import { logicAttributes } from './logic-attributes';
import { logicScoring } from './logic-scoring';
import { logicConditions } from './logic-conditions';
import { logicOutcomes } from './logic-outcomes';
import { data } from './data';
import { integrations } from './integrations';
import { triggers } from './triggers';
import { nonGoals } from './non-goals';
import { brand } from './brand';
import { brandTone } from './brand-tone';
import { brandColour } from './brand-colour';
import { brandReferences } from './brand-references';
import { constraints } from './constraints';
import { glossary } from './glossary';
import { openQuestions } from './open-questions';
import type { SectionConfig } from '../types';

export const SECTIONS: SectionConfig[] = [
  overview, roles, screens, flows,
  logic, logicRules, logicGroups, logicAttributes, logicScoring, logicConditions, logicOutcomes,
  data, integrations, triggers,
  nonGoals,
  brand, brandTone, brandColour, brandReferences,
  constraints, glossary, openQuestions,
];
export const SECTION_MAP: Record<string, SectionConfig> = Object.fromEntries(SECTIONS.map((s) => [s.id, s]));
