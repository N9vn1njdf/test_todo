import { createId } from "@paralleldrive/cuid2";
import { defineStore } from "pinia";
import type { ChecklistItem, Note } from "~/models/note";

function createMockNotes(): Note[] {
	return [
		{
			id: createId(),
			title: "Планы на неделю",
			text: "Основные задачи на эту неделю.",
			checklist: [
				{ id: createId(), title: "Купить продукты", completed: true },
				{ id: createId(), title: "Записаться к врачу", completed: false },
			],
		},
		{
			id: createId(),
			title: "Идеи для проекта",
			text: "Заметки и идеи, которые стоит обсудить.",
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
			const newNote: Note = {
				...note,
				id: createId(),
				checklist: note.checklist.map((item: ChecklistItem) => ({
					...item,
					id: createId(),
				})),
			};

			this.notes.push(newNote);
			return newNote;
		},
		saveNote(note: Note): void {
			const noteIndex = this.notes.findIndex((item) => item.id === note.id);
			if (noteIndex !== -1) this.notes[noteIndex] = note;
		},
		deleteNote(id: string): void {
			this.notes = this.notes.filter((note) => note.id !== id);
		},
	},
});