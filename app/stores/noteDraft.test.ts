import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { CURRENT_NOTE_SCHEMA_VERSION } from "~/models/note";
import { useNoteDraftStore } from "~/stores/noteDraft";
import {
  createLocalStorageMock,
  type LocalStorageMock,
} from "../../tests/utils/localStorageMock";

const DRAFT_STORAGE_KEY = "note-editor-draft";
let localStorageMock: LocalStorageMock;

describe("note draft schema version", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorageMock = createLocalStorageMock();
    vi.stubGlobal("localStorage", localStorageMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("silently removes a draft saved with another schema version", () => {
    const storage = localStorageMock;
    storage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({
        id: "note-1",
        schema_version: CURRENT_NOTE_SCHEMA_VERSION + 1,
        title: "Несовместимый черновик",
        checklist: [],
      }),
    );

    const draftStore = useNoteDraftStore();

    expect(draftStore.hasSnapshot()).toBe(false);
    expect(storage.removeItem).toHaveBeenCalledWith(DRAFT_STORAGE_KEY);
    expect(storage.getItem(DRAFT_STORAGE_KEY)).toBeNull();
  });

  it("keeps a draft saved with the current schema version", () => {
    const storage = localStorageMock;
    const draft = {
      id: "note-1",
      schema_version: CURRENT_NOTE_SCHEMA_VERSION,
      title: "Актуальный черновик",
      checklist: [],
    };
    storage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));

    const draftStore = useNoteDraftStore();

    expect(draftStore.hasSnapshot()).toBe(true);
    expect(draftStore.readSnapshot()).toEqual(draft);
    expect(storage.removeItem).not.toHaveBeenCalled();
  });
});
