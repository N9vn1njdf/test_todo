import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { CURRENT_NOTE_SCHEMA_VERSION, type Note } from "~/models/note";
import { useNotesStore } from "~/stores/notes";
import {
  createLocalStorageMock,
  type LocalStorageMock,
} from "../../tests/utils/localStorageMock";

const NOTES_STORAGE_KEY = "notes";
const NOTES_INITIALIZED_STORAGE_KEY = "notes-initialized";
let localStorageMock: LocalStorageMock;

function createNote(id = "note-1"): Note {
  return {
    id,
    schema_version: CURRENT_NOTE_SCHEMA_VERSION,
    title: "Заметка",
    checklist: [{ id: `${id}-item`, title: "Пункт", completed: false }],
  };
}

describe("notes store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorageMock = createLocalStorageMock();
    vi.stubGlobal("localStorage", localStorageMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("creates and persists two initial notes on first initialization", () => {
    const store = useNotesStore();

    store.initializeFromStorage();

    expect(store.initialized).toBe(true);
    expect(store.notes).toHaveLength(2);
    expect(store.notes.map(({ title }) => title)).toEqual([
      "Планы на неделю",
      "Идеи для проекта",
    ]);

    const storage = localStorageMock;
    expect(JSON.parse(storage.getItem(NOTES_STORAGE_KEY)!)).toEqual(
      store.notes,
    );
    expect(storage.getItem(NOTES_INITIALIZED_STORAGE_KEY)).toBe("true");
  });

  it("restores valid notes from localStorage", () => {
    const storage = localStorageMock;
    const savedNote = createNote();
    storage.setItem(NOTES_STORAGE_KEY, JSON.stringify([savedNote]));
    storage.setItem(NOTES_INITIALIZED_STORAGE_KEY, "true");

    const store = useNotesStore();
    store.initializeFromStorage();

    expect(store.notes).toEqual([savedNote]);
    expect(store.notes[0]).not.toBe(savedNote);
    expect(store.notes[0]?.checklist[0]).not.toBe(savedNote.checklist[0]);
  });

  it("uses initial notes when saved data is invalid on first initialization", () => {
    localStorageMock.setItem(NOTES_STORAGE_KEY, "not valid JSON");

    const store = useNotesStore();
    store.initializeFromStorage();

    expect(store.notes).toHaveLength(2);
    expect(store.notes[0]?.title).toBe("Планы на неделю");
  });

  it("does not initialize or read storage more than once", () => {
    const store = useNotesStore();
    store.initializeFromStorage();
    const storage = localStorageMock;
    const getItemCalls = storage.getItem.mock.calls.length;

    store.notes = [];
    store.initializeFromStorage();

    expect(store.notes).toEqual([]);
    expect(storage.getItem).toHaveBeenCalledTimes(getItemCalls);
  });

  it("creates a normalized note with fresh ids and persists it", () => {
    const store = useNotesStore();

    const created = store.createNote({
      title: "  Новая заметка  ",
      checklist: [
        { id: "input-1", title: "  Первый пункт  ", completed: true },
        { id: "input-2", title: "   ", completed: false },
      ],
    });

    expect(created.title).toBe("Новая заметка");
    expect(created.schema_version).toBe(CURRENT_NOTE_SCHEMA_VERSION);
    expect(created.id).not.toBe("");
    expect(created.checklist).toHaveLength(1);
    expect(created.checklist[0]).toMatchObject({
      title: "Первый пункт",
      completed: true,
    });
    expect(created.checklist[0]?.id).not.toBe("input-1");
    expect(store.notes).toEqual([created]);
    expect(JSON.parse(localStorageMock.getItem(NOTES_STORAGE_KEY)!)).toEqual([
      created,
    ]);
  });

  it("saves an existing note after normalizing its title and checklist", () => {
    const store = useNotesStore();
    const existingNote = createNote();
    store.notes = [existingNote];

    store.saveNote({
      ...existingNote,
      title: "  Обновлённая заметка ",
      checklist: [
        { id: "item-1", title: "  Обновлённый пункт ", completed: true },
        { id: "item-2", title: "  ", completed: false },
      ],
    });

    expect(store.notes[0]).toEqual({
      ...existingNote,
      title: "Обновлённая заметка",
      checklist: [
        { id: "item-1", title: "Обновлённый пункт", completed: true },
      ],
    });
    expect(JSON.parse(localStorageMock.getItem(NOTES_STORAGE_KEY)!)).toEqual(
      store.notes,
    );
  });

  it("does not persist when saving a note that does not exist", () => {
    const store = useNotesStore();

    store.saveNote(createNote("missing-note"));

    expect(store.notes).toEqual([]);
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it("deletes a note and persists the remaining notes", () => {
    const store = useNotesStore();
    store.notes = [createNote("first"), createNote("second")];

    store.deleteNote("first");

    expect(store.notes.map(({ id }) => id)).toEqual(["second"]);
    expect(JSON.parse(localStorageMock.getItem(NOTES_STORAGE_KEY)!)).toEqual(
      store.notes,
    );
  });

  it("keeps initial notes usable when localStorage is unavailable", () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error("Storage unavailable");
    });
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error("Storage unavailable");
    });

    const store = useNotesStore();
    expect(() => store.initializeFromStorage()).not.toThrow();
    expect(store.notes).toHaveLength(2);

    expect(() =>
      store.createNote({ title: "Работает в памяти", checklist: [] }),
    ).not.toThrow();
    expect(store.notes).toHaveLength(3);
  });
});
