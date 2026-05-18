export type ProjectMeta = {
  name: string;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
};

export type Project = {
  id: string;
  meta: ProjectMeta;
  sections: Record<string, unknown>;
};

export type ProjectSummary = {
  id: string;
  name: string;
  updatedAt: string;
  counts: Record<string, number>;
};

export type FieldType =
  | 'text' | 'textarea' | 'select' | 'enum-chips'
  | 'list' | 'ref' | 'custom';

export type FieldConfig = {
  key: string;
  label: string;
  hint?: string;
  placeholder?: string;
  type: FieldType;
  optional?: boolean;
  options?: string[];
  itemFields?: FieldConfig[];
  refSection?: string;
  refMulti?: boolean;
  widget?: string;
};

export type SectionConfig = {
  id: string;
  title: string;
  group: 'core' | 'logic' | 'context';
  icon: string;
  intro: string;
  details?: string;
  parentId?: string;
  shape: 'object' | 'list';
  fields: FieldConfig[];
};

export const CURRENT_SCHEMA_VERSION = 1;
