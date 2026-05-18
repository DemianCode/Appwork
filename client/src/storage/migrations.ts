import type { Project } from '@/schema/types';

type LegacyRule = { id?: string; name?: string; type?: string; condition?: string; action?: string; notes?: string; category?: string };
type LegacyData = {
  overview?: Record<string, unknown>;
  screens?: Array<Record<string, unknown>>;
  flows?: Array<Record<string, unknown>>;
  logic?: LegacyRule[];
  data?: Array<Record<string, unknown>>;
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
      logic: {
        simpleRules: logicArr.map((r) => ({ ...r, category: r.category ?? '' })),
        groups: [], attributes: [], scoring: [], conditions: [], outcomes: [],
      },
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
