export type Group = { id: string; name: string; color: string };
export type Attribute = { id: string; name: string; type: 'number' | 'boolean' | 'text' | 'enum'; description: string; defaultValue: string; groupId: string | null };
export type ScoringRule = { id: string; name: string; trigger: string; attributeId: string; operation: 'increment' | 'decrement' | 'set' | 'toggle'; value: string; groupId: string | null };
export type Condition = { id: string; name: string; attributeId: string; operator: '>' | '<' | '>=' | '<=' | '==' | '!=' | 'contains' | 'not contains'; value: string; groupId: string | null };
export type Outcome = { id: string; name: string; conditionIds: string[]; logic: 'AND' | 'OR'; action: string; groupId: string | null };
export type SimpleRule = { id: string; name: string; type: string; condition: string; action: string; notes: string; category: string };

export type LogicState = {
  simpleRules: SimpleRule[];
  groups: Group[];
  attributes: Attribute[];
  scoring: ScoringRule[];
  conditions: Condition[];
  outcomes: Outcome[];
};

export const emptyLogic = (): LogicState => ({
  simpleRules: [], groups: [], attributes: [], scoring: [], conditions: [], outcomes: [],
});

export const GROUP_COLORS = ['#5b8def', '#3dd68c', '#fbbf24', '#f87171', '#a78bfa', '#fb923c', '#22d3ee', '#f472b6'];
