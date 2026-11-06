import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { CURRENT_NOTE_SCHEMA_VERSION, type Note } from "~/models/note";
import {
  createLocalStorageMock,
  type LocalStorageMock,
} from "../../tests/utils/localStorageMock";
import { useNoteDraftStore } from "~/stores/noteDraft";
import { useNoteEditorStore } from "~/stores/noteEditor";

const DRAFT_STORAGE_KEY = "note-editor-draft";
let localStorageMock: LocalStorageMock;

function createNote(): Note {
  return {
    id: "note-1",
    schema_version: CURRENT_NOTE_SCHEMA_VERSION,
    title: "Исходная заметка",
    checklist: [
      { id: "item-1", title: "Первый пункт", completed: false },
      { id: "item-2", title: "Второй пункт", completed: true },
    ],
  };
}

describe("note editor store", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setActivePinia(createPinia());
    localStorageMock = createLocalStorageMock();
    vi.stubGlobal("localStorage", localStorageMock);
    vi.stubGlobal("useNoteDraftStore", useNoteDraftStore);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("initializes an independent draft and resets editor state", () => {
    const store = useNoteEditorStore();
    const note = createNote();

    store.initialize(note);

    expect(store.draft).toEqual(note);
    expect(store.draft).not.toBe(note);
    expect(store.draft?.checklist[0]).not.toBe(note.checklist[0]);
    expect(store.canUndo).toBe(false);
    expect(store.canRedo).toBe(false);

    store.addChecklistItem();
    store.reset();

    expect(store.draft).toBeNull();
    expect(store.canUndo).toBe(false);
    expect(store.canRedo).toBe(false);
  });

  it("undoes and redoes atomic checklist changes in the correct order", () => {
    const store = useNoteEditorStore();
    store.initialize(createNote());

    store.setChecklistItemCompleted("item-1", true);
    store.setChecklistItemTitle("item-1", "Переименованный пункт");
    vi.advanceTimersByTime(1000);
    store.addChecklistItem();

    const addedItem = store.draft?.checklist[2];
    expect(addedItem).toMatchObject({ title: "", completed: false });
    expect(store.canUndo).toBe(true);
    expect(store.canRedo).toBe(false);

    store.undo();
    expect(store.draft?.checklist).toHaveLength(2);
    store.undo();
    expect(store.draft?.checklist[0]?.title).toBe("Первый пункт");
    store.undo();
    expect(store.draft?.checklist[0]?.completed).toBe(false);
    expect(store.canUndo).toBe(false);
    expect(store.canRedo).toBe(true);

    store.redo();
    store.redo();
    store.redo();
    expect(store.draft?.checklist[0]).toMatchObject({
      title: "Переименованный пункт",
      completed: true,
    });
    expect(store.draft?.checklist[2]).toEqual(addedItem);
    expect(store.canRedo).toBe(false);
  });

  it("restores a removed checklist item at its original position", () => {
    const store = useNoteEditorStore();
    store.initialize(createNote());

    store.removeChecklistItem("item-1");
    expect(store.draft?.checklist.map(({ id }) => id)).toEqual(["item-2"]);

    store.undo();
    expect(store.draft?.checklist.map(({ id }) => id)).toEqual([
      "item-1",
      "item-2",
    ]);
    store.redo();
    expect(store.draft?.checklist.map(({ id }) => id)).toEqual(["item-2"]);
  });

  it("groups continuous note-title input into one debounced history change", async () => {
    const store = useNoteEditorStore();
    store.initialize(createNote());

    store.setNoteTitle("Промежуточный заголовок");
    await vi.advanceTimersByTimeAsync(500);
    store.setNoteTitle("Итоговый заголовок");

    expect(store.draft?.title).toBe("Итоговый заголовок");
    expect(store.canUndo).toBe(true);
    expect(store.canRedo).toBe(false);
    expect(localStorageMock.setItem).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(999);
    expect(store.canRedo).toBe(false);
    expect(localStorageMock.setItem).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
    expect(JSON.parse(localStorageMock.getItem(DRAFT_STORAGE_KEY)!)).toEqual(
      store.draft,
    );

    store.undo();
    expect(store.draft?.title).toBe("Исходная заметка");
    store.redo();
    expect(store.draft?.title).toBe("Итоговый заголовок");
  });

  it("debounces checklist-title changes and ignores a net no-op", async () => {
    const store = useNoteEditorStore();
    store.initialize(createNote());

    store.setChecklistItemTitle("item-1", "Временное значение");
    store.setChecklistItemTitle("item-1", "Первый пункт");
    await vi.advanceTimersByTimeAsync(1000);

    expect(store.draft?.checklist[0]?.title).toBe("Первый пункт");
    expect(store.canUndo).toBe(false);
    expect(localStorageMock.setItem).not.toHaveBeenCalled();

    store.setChecklistItemTitle("item-1", "Новое название");
    await vi.advanceTimersByTimeAsync(1000);
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
    store.undo();
    expect(store.draft?.checklist[0]?.title).toBe("Первый пункт");
  });

  it("flushes pending text changes before undo and saves the resulting draft", () => {
    const store = useNoteEditorStore();
    store.initialize(createNote());

    store.setNoteTitle("Изменённый заголовок");
    expect(store.draft?.title).toBe("Изменённый заголовок");
    expect(localStorageMock.setItem).not.toHaveBeenCalled();

    store.undo();

    expect(store.draft?.title).toBe("Исходная заметка");
    expect(store.canUndo).toBe(false);
    expect(store.canRedo).toBe(true);
    expect(JSON.parse(localStorageMock.getItem(DRAFT_STORAGE_KEY)!)).toEqual({
      ...createNote(),
      title: "Изменённый заголовок",
    });

    vi.advanceTimersByTime(1000);
    expect(store.draft?.title).toBe("Исходная заметка");
  });

  it("flushes pending text before atomic changes and clears redo after branching", () => {
    const store = useNoteEditorStore();
    store.initialize(createNote());

    store.setNoteTitle("Название 1");
    store.addChecklistItem();
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);

    store.undo();
    expect(store.draft?.checklist).toHaveLength(2);
    store.undo();
    expect(store.draft?.title).toBe("Исходная заметка");
    expect(store.canRedo).toBe(true);

    store.setChecklistItemCompleted("item-1", true);
    expect(store.canRedo).toBe(false);
    store.redo();
    expect(store.draft?.title).toBe("Исходная заметка");
    expect(store.draft?.checklist[0]?.completed).toBe(true);
  });

  it("clears history after flushing pending titles", () => {
    const store = useNoteEditorStore();
    store.initialize(createNote());

    store.setNoteTitle("Сохранённое название");
    store.clearHistory();

    expect(store.draft?.title).toBe("Сохранённое название");
    expect(store.canUndo).toBe(false);
    expect(store.canRedo).toBe(false);
    expect(JSON.parse(localStorageMock.getItem(DRAFT_STORAGE_KEY)!)).toEqual(
      store.draft,
    );
  });

  it("restores a saved draft as a copy without restoring undo history", () => {
    const storage = localStorageMock;
    const savedDraft = { ...createNote(), title: "Восстановленный черновик" };
    storage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(savedDraft));
    const store = useNoteEditorStore();

    expect(store.restoreSavedDraft()).toEqual(savedDraft);
    expect(store.draft).toEqual(savedDraft);
    expect(store.draft).not.toBe(savedDraft);
    expect(store.draft?.checklist[0]).not.toBe(savedDraft.checklist[0]);
    expect(store.restoredDraftId).toBe("note-1");
    expect(store.canUndo).toBe(false);
    expect(store.canRedo).toBe(false);
    expect(store.consumeRestoredDraft("other-note")).toBe(false);
    expect(store.consumeRestoredDraft("note-1")).toBe(true);
    expect(store.restoredDraftId).toBeNull();

    store.clearSavedDraft();
    expect(store.hasSavedDraft()).toBe(false);
    expect(storage.removeItem).toHaveBeenCalledWith(DRAFT_STORAGE_KEY);
  });

  it("returns null when there is no saved draft", () => {
    const store = useNoteEditorStore();

    expect(store.restoreSavedDraft()).toBeNull();
    expect(store.draft).toBeNull();
  });
});
