import { defineStore } from "pinia";
import { ref } from "vue";
import type { ChecklistItem, Note } from "~/models/note";

const DRAFT_STORAGE_KEY = "note-editor-draft";

function cloneNote(note: Note): Note {
  return {
    ...note,
    checklist: note.checklist.map((item) => ({ ...item })),
  };
}

function isChecklistItem(value: unknown): value is ChecklistItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Partial<ChecklistItem>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.completed === "boolean"
  );
}

function isNote(value: unknown): value is Note {
  if (!value || typeof value !== "object") {
    return false;
  }

  const note = value as Partial<Note>;
  return (
    typeof note.id === "string" &&
    typeof note.title === "string" &&
    Array.isArray(note.checklist) &&
    note.checklist.every(isChecklistItem)
  );
}

export const useNoteDraftStore = defineStore("noteDraft", () => {
  const restoredDraftId = ref<string | null>(null);

  function readSnapshot(): Note | null {
    if (!import.meta.client) {
      return null;
    }

    try {
      const value = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!value) {
        return null;
      }

      const parsed: unknown = JSON.parse(value);
      if (isNote(parsed)) {
        return cloneNote(parsed);
      }

      clearSnapshot();
    } catch {
      clearSnapshot();
    }

    return null;
  }

  function hasSnapshot(): boolean {
    return readSnapshot() !== null;
  }

  function saveSnapshot(note: Note): void {
    if (!import.meta.client) {
      return;
    }

    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(cloneNote(note)));
    } catch {
      // Storage may be unavailable; editing remains available in memory.
    }
  }

  function restoreSnapshot(): Note | null {
    const snapshot = readSnapshot();
    if (!snapshot) {
      return null;
    }

    restoredDraftId.value = snapshot.id;
    return snapshot;
  }

  function consumeRestoredDraft(id: string): boolean {
    const expectedId = id === "new" ? "" : id;
    if (restoredDraftId.value !== expectedId) {
      return false;
    }

    restoredDraftId.value = null;
    return true;
  }

  function clearSnapshot(): void {
    restoredDraftId.value = null;
    if (!import.meta.client) {
      return;
    }

    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignore storage errors; editing remains available.
    }
  }

  return {
    restoredDraftId,
    readSnapshot,
    hasSnapshot,
    saveSnapshot,
    restoreSnapshot,
    consumeRestoredDraft,
    clearSnapshot,
  };
});
