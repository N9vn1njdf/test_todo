import { createId } from "@paralleldrive/cuid2";
import { defineStore } from "pinia";
import type { Note } from "~/models/note";

const NOTES_STORAGE_KEY = "notes";

function normalizeNote(
  note: Pick<Note, "title" | "checklist">,
): Pick<Note, "title" | "checklist"> {
  return {
    title: note.title.trim(),
    checklist: note.checklist
      .map((item) => ({ ...item, title: item.title.trim() }))
      .filter((item) => item.title.length > 0),
  };
}

function cloneNote(note: Note): Note {
  return {
    ...note,
    checklist: note.checklist.map((item) => ({ ...item })),
  };
}

function createMockNotes(): Note[] {
  return [
    {
      id: "demo-weekly-plans",
      title: "Планы на неделю",
      checklist: [
        { id: "demo-buy-groceries", title: "Купить продукты", completed: true },
        {
          id: "demo-book-doctor",
          title: "Записаться к врачу",
          completed: false,
        },
      ],
    },
    {
      id: "demo-project-ideas",
      title: "Идеи для проекта",
      checklist: [
        {
          id: "demo-design-interface",
          title: "Продумать интерфейс",
          completed: false,
        },
        {
          id: "demo-list-features",
          title: "Составить список функций",
          completed: false,
        },
      ],
    },
  ];
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
    note.checklist.every(
      (item) =>
        item !== null &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        typeof item.completed === "boolean",
    )
  );
}

function cloneNotes(notes: Note[]): Note[] {
  return notes.map(cloneNote);
}

export const useNotesStore = defineStore("notes", {
  state: () => ({
    notes: createMockNotes(),
    initialized: false,
  }),
  actions: {
    initializeFromStorage(): void {
      if (this.initialized) {
        return;
      }

      this.initialized = true;
      if (!import.meta.client) {
        return;
      }

      try {
        const storedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
        if (storedNotes) {
          const parsed: unknown = JSON.parse(storedNotes);
          if (Array.isArray(parsed) && parsed.every(isNote)) {
            this.notes = cloneNotes(parsed);
            return;
          }
        }
      } catch {
        // Fall back to the deterministic example notes if storage is unavailable.
      }

      this.persistNotes();
    },
    persistNotes(): void {
      if (!import.meta.client) {
        return;
      }

      try {
        localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(this.notes));
      } catch {
        // Storage may be unavailable; keep notes usable in memory.
      }
    },
    createNote(note: Omit<Note, "id">): Note {
      const normalizedNote = normalizeNote(note);
      const newNote: Note = {
        ...normalizedNote,
        id: createId(),
        checklist: normalizedNote.checklist.map((item) => ({
          ...item,
          id: createId(),
        })),
      };

      this.notes.push(cloneNote(newNote));
      this.persistNotes();
      return newNote;
    },
    saveNote(note: Note): void {
      const noteIndex = this.notes.findIndex((item) => item.id === note.id);
      if (noteIndex !== -1) {
        this.notes[noteIndex] = cloneNote({ ...note, ...normalizeNote(note) });
        this.persistNotes();
      }
    },
    deleteNote(id: string): void {
      this.notes = this.notes.filter((note) => note.id !== id);
      this.persistNotes();
    },
  },
});
