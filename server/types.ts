export type ProjectMeta = {
  name: string;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
};

export type ProjectSections = Record<string, unknown>;

export type Project = {
  id: string;
  meta: ProjectMeta;
  sections: ProjectSections;
};

export type ProjectSummary = {
  id: string;
  name: string;
  updatedAt: string;
  counts: Record<string, number>;
};

export const CURRENT_SCHEMA_VERSION = 1;
