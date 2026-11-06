export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export const CURRENT_NOTE_SCHEMA_VERSION = 1;

export interface Note {
  id: string;
  schema_version: number;
  title: string;
  checklist: ChecklistItem[];
}
