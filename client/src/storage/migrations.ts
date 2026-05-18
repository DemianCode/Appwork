import type { Project } from '@/schema/types';

type LegacyRule = { id?: string; name?: string; type?: string; condition?: string; action?: string; notes?: string; category?: string };
type LegacyData = {
  overview?: Record<string, unknown>;
  screens?: Array<Record<string, unknown>>;
  flows?: Array<Record<string, unknown>>;
  logic?: LegacyRule[];
  data?: Array<Record<string, unknown>>;
};

type OldLogicShape = {
  simpleRules?: unknown[];
  groups?: unknown[];
  attributes?: unknown[];
  scoring?: unknown[];
  conditions?: unknown[];
  outcomes?: unknown[];
};

export function migrateLegacy(raw: LegacyData | null | undefined, name = 'Untitled (imported from v1)'): Project {
  const now = new Date().toISOString();
  const legacy = raw ?? {};
  const logicArr: LegacyRule[] = Array.isArray(legacy.logic) ? legacy.logic : [];
  return {
    id: 'untitled',
    meta: { name, createdAt: now, updatedAt: now, schemaVersion: 1 },
    sections: {
      overview: legacy.overview ?? {},
      roles: [],
      screens: (legacy.screens ?? []).map((s) => ({ ...s, seenBy: [], states: [] })),
      flows: legacy.flows ?? [],
      logicRules: logicArr.map((r) => ({ ...r, category: r.category ?? '' })),
      logicGroups: [],
      logicAttributes: [],
      logicScoring: [],
      logicConditions: [],
      logicOutcomes: [],
      data: legacy.data ?? [],
      integrations: [], triggers: [], nonGoals: [],
      brand: {}, constraints: {}, glossary: [], openQuestions: [],
    },
  };
}

export function readLegacyLocalStorage(): LegacyData | null {
  try {
    const s = localStorage.getItem('ap-data');
    return s ? (JSON.parse(s) as LegacyData) : null;
  } catch { return null; }
}

/**
 * Maps a v2-alpha unified `project.sections.logic` object into the new
 * per-subsection slots. No-op if the project already uses the new layout.
 * Mutates and returns the project for ergonomic callsite chaining.
 */
export function migrateLogicShape(project: Project): Project {
  const sections = project.sections as Record<string, unknown>;
  const old = sections.logic as OldLogicShape | undefined;
  if (!old || typeof old !== 'object' || Array.isArray(old)) return project;
  const hasOldKeys = !!(old.simpleRules || old.groups || old.attributes || old.scoring || old.conditions || old.outcomes);
  if (!hasOldKeys) return project;
  const alreadyMigrated = Array.isArray(sections.logicRules);
  if (alreadyMigrated) return project;

  sections.logicRules      = old.simpleRules ?? [];
  sections.logicGroups     = old.groups      ?? [];
  sections.logicAttributes = old.attributes  ?? [];
  sections.logicScoring    = old.scoring     ?? [];
  sections.logicConditions = old.conditions  ?? [];
  sections.logicOutcomes   = old.outcomes    ?? [];
  delete sections.logic;
  return project;
}
