import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { CURRENT_NOTE_SCHEMA_VERSION } from "~/models/note";
import { useNoteDraftStore } from "~/stores/noteDraft";

const DRAFT_STORAGE_KEY = "note-editor-draft";

function createLocalStorageMock() {
  const storage = new Map<string, string>();

  return {
    getItem: vi.fn((key: string) => storage.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
    removeItem: vi.fn((key: string) => storage.delete(key)),
  };
}

describe("note draft schema version", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal("localStorage", createLocalStorageMock());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("silently removes a draft saved with another schema version", () => {
    const storage = localStorage as ReturnType<typeof createLocalStorageMock>;
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
    const storage = localStorage as ReturnType<typeof createLocalStorageMock>;
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
