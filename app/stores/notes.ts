import { createId } from "@paralleldrive/cuid2";
import { defineStore } from "pinia";
import type { Note } from "~/models/note";

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
      id: createId(),
      title: "Планы на неделю",
      checklist: [
        { id: createId(), title: "Купить продукты", completed: true },
        { id: createId(), title: "Записаться к врачу", completed: false },
      ],
    },
    {
      id: createId(),
      title: "Идеи для проекта",
      checklist: [
        { id: createId(), title: "Продумать интерфейс", completed: false },
        { id: createId(), title: "Составить список функций", completed: false },
      ],
    },
  ];
}

export const useNotesStore = defineStore("notes", {
  state: () => ({
    notes: createMockNotes(),
  }),
  actions: {
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
      return newNote;
    },
    saveNote(note: Note): void {
      const noteIndex = this.notes.findIndex((item) => item.id === note.id);
      if (noteIndex !== -1) {
        this.notes[noteIndex] = cloneNote({ ...note, ...normalizeNote(note) });
      }
    },
    deleteNote(id: string): void {
      this.notes = this.notes.filter((note) => note.id !== id);
    },
  },
});
