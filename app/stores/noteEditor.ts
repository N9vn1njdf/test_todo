import { createId } from "@paralleldrive/cuid2";
import { watchDebounced } from "@vueuse/core";
import { computed, ref, type Ref, type WatchStopHandle } from "vue";
import { defineStore } from "pinia";
import type { ChecklistItem, Note } from "~/models/note";

type HistoryChange =
  | { type: "note-title"; before: string; after: string }
  | {
      type: "checklist-item-title";
      itemId: string;
      before: string;
      after: string;
    }
  | {
      type: "checklist-item-completed";
      itemId: string;
      before: boolean;
      after: boolean;
    }
  | { type: "add-checklist-item"; item: ChecklistItem; index: number }
  | { type: "remove-checklist-item"; item: ChecklistItem; index: number };

interface PendingTitleChange {
  before: string | null;
  sequence: number;
  value: Ref<string>;
  stop: WatchStopHandle;
  commit: (after: string) => void;
}

function cloneNote(note: Note): Note {
  return {
    ...note,
    checklist: note.checklist.map((item) => ({ ...item })),
  };
}

export const useNoteEditorStore = defineStore("noteEditor", () => {
  const noteDraftStore = useNoteDraftStore();
  const draft = ref<Note | null>(null);
  const history = ref<HistoryChange[]>([]);
  const historyIndex = ref(0);
  const pendingTitleCount = ref(0);
  const pendingItemTitles = new Map<string, PendingTitleChange>();
  let pendingNoteTitle: PendingTitleChange | null = null;
  let nextPendingSequence = 0;

  const canUndo = computed(
    () => historyIndex.value > 0 || pendingTitleCount.value > 0,
  );
  const canRedo = computed(
    () =>
      pendingTitleCount.value === 0 &&
      historyIndex.value < history.value.length,
  );

  function cancelPendingChanges(): void {
    pendingNoteTitle?.stop();
    pendingNoteTitle = null;

    for (const pending of pendingItemTitles.values()) {
      pending.stop();
    }
    pendingItemTitles.clear();
    pendingTitleCount.value = 0;
  }

  function recordChange(change: HistoryChange): void {
    history.value.splice(historyIndex.value);
    history.value.push(change);
    historyIndex.value = history.value.length;
    if (draft.value) {
      noteDraftStore.saveSnapshot(draft.value);
    }
  }

  function hasSavedDraft(): boolean {
    return noteDraftStore.hasSnapshot();
  }

  function restoreSavedDraft(): Note | null {
    const savedDraft = noteDraftStore.restoreSnapshot();
    if (!savedDraft) {
      return null;
    }

    cancelPendingChanges();
    draft.value = cloneNote(savedDraft);
    history.value = [];
    historyIndex.value = 0;
    return cloneNote(savedDraft);
  }

  function consumeRestoredDraft(id: string): boolean {
    if (!noteDraftStore.consumeRestoredDraft(id)) {
      return false;
    }

    return true;
  }

  function clearSavedDraft(): void {
    noteDraftStore.clearSnapshot();
  }

  function flushPendingChanges(): void {
    const pendingChanges = [
      ...(pendingNoteTitle ? [pendingNoteTitle] : []),
      ...pendingItemTitles.values(),
    ]
      .filter((pending) => pending.before !== null)
      .sort((left, right) => left.sequence - right.sequence);

    const allPending = [
      ...(pendingNoteTitle ? [pendingNoteTitle] : []),
      ...pendingItemTitles.values(),
    ];

    for (const pending of allPending) {
      pending.stop();
    }

    for (const pending of pendingChanges) {
      pending.commit(pending.value.value);
    }

    pendingNoteTitle = null;
    pendingItemTitles.clear();
  }

  function initialize(note: Note): void {
    cancelPendingChanges();

    draft.value = cloneNote(note);
    history.value = [];
    historyIndex.value = 0;
  }

  function reset(): void {
    cancelPendingChanges();
    draft.value = null;
    history.value = [];
    historyIndex.value = 0;
  }

  function clearHistory(): void {
    flushPendingChanges();
    history.value = [];
    historyIndex.value = 0;
  }

  function updatePendingTitle(
    pending: PendingTitleChange,
    after: string,
    change: (before: string, after: string) => HistoryChange,
  ): void {
    if (pending.before === null) {
      return;
    }

    const before = pending.before;
    pending.before = null;
    pendingTitleCount.value -= 1;

    if (before !== after) {
      recordChange(change(before, after));
    }
  }

  function createPendingTitleChange(
    createChange: (before: string, after: string) => HistoryChange,
  ): PendingTitleChange {
    const value = ref("");
    let pending: PendingTitleChange;

    pending = {
      before: null,
      sequence: 0,
      value,
      stop: () => {},
      commit: (after) => updatePendingTitle(pending, after, createChange),
    };
    pending.stop = watchDebounced(value, (after) => pending.commit(after), {
      debounce: 1000,
    });

    return pending;
  }

  function getNoteTitlePending(): PendingTitleChange {
    if (!pendingNoteTitle) {
      pendingNoteTitle = createPendingTitleChange((before, after) => ({
        type: "note-title",
        before,
        after,
      }));
    }

    return pendingNoteTitle;
  }

  function getChecklistTitlePending(itemId: string): PendingTitleChange {
    let pending = pendingItemTitles.get(itemId);
    if (!pending) {
      pending = createPendingTitleChange((before, after) => ({
        type: "checklist-item-title",
        itemId,
        before,
        after,
      }));
      pendingItemTitles.set(itemId, pending);
    }

    return pending;
  }

  function setNoteTitle(title: string): void {
    if (!draft.value || draft.value.title === title) {
      return;
    }

    const pending = getNoteTitlePending();
    if (pending.before === null) {
      pending.before = draft.value.title;
      pendingTitleCount.value += 1;
    }

    pending.sequence = ++nextPendingSequence;
    draft.value.title = title;
    pending.value.value = title;
  }

  function setChecklistItemTitle(itemId: string, title: string): void {
    const item = draft.value?.checklist.find(({ id }) => id === itemId);
    if (!item || item.title === title) {
      return;
    }

    const pending = getChecklistTitlePending(itemId);
    if (pending.before === null) {
      pending.before = item.title;
      pendingTitleCount.value += 1;
    }

    pending.sequence = ++nextPendingSequence;
    item.title = title;
    pending.value.value = title;
  }

  function addChecklistItem(): void {
    if (!draft.value) {
      return;
    }

    flushPendingChanges();
    const item: ChecklistItem = {
      id: createId(),
      title: "",
      completed: false,
    };
    const index = draft.value.checklist.length;
    draft.value.checklist.push(item);
    recordChange({ type: "add-checklist-item", item: { ...item }, index });
  }

  function removeChecklistItem(itemId: string): void {
    if (!draft.value) {
      return;
    }

    flushPendingChanges();
    const index = draft.value.checklist.findIndex(({ id }) => id === itemId);
    if (index === -1) {
      return;
    }

    const item = draft.value.checklist[index];
    if (!item) {
      return;
    }

    draft.value.checklist.splice(index, 1);
    recordChange({
      type: "remove-checklist-item",
      item: { ...item },
      index,
    });
  }

  function setChecklistItemCompleted(itemId: string, completed: boolean): void {
    if (!draft.value) {
      return;
    }

    flushPendingChanges();
    const item = draft.value.checklist.find(({ id }) => id === itemId);
    if (!item || item.completed === completed) {
      return;
    }

    const before = item.completed;
    item.completed = completed;
    recordChange({
      type: "checklist-item-completed",
      itemId,
      before,
      after: completed,
    });
  }

  function applyChange(change: HistoryChange, forward: boolean): void {
    if (!draft.value) {
      return;
    }

    switch (change.type) {
      case "note-title":
        draft.value.title = forward ? change.after : change.before;
        break;
      case "checklist-item-title": {
        const item = draft.value.checklist.find(
          ({ id }) => id === change.itemId,
        );
        if (item) {
          item.title = forward ? change.after : change.before;
        }
        break;
      }
      case "checklist-item-completed": {
        const item = draft.value.checklist.find(
          ({ id }) => id === change.itemId,
        );
        if (item) {
          item.completed = forward ? change.after : change.before;
        }
        break;
      }
      case "add-checklist-item":
        if (forward) {
          draft.value.checklist.splice(change.index, 0, { ...change.item });
        } else {
          draft.value.checklist = draft.value.checklist.filter(
            ({ id }) => id !== change.item.id,
          );
        }
        break;
      case "remove-checklist-item":
        if (forward) {
          draft.value.checklist = draft.value.checklist.filter(
            ({ id }) => id !== change.item.id,
          );
        } else {
          draft.value.checklist.splice(change.index, 0, { ...change.item });
        }
        break;
    }
  }

  function undo(): void {
    flushPendingChanges();
    if (historyIndex.value === 0) {
      return;
    }

    historyIndex.value -= 1;
    applyChange(history.value[historyIndex.value]!, false);
  }

  function redo(): void {
    flushPendingChanges();
    if (historyIndex.value >= history.value.length) {
      return;
    }

    applyChange(history.value[historyIndex.value]!, true);
    historyIndex.value += 1;
  }

  return {
    draft,
    restoredDraftId: noteDraftStore.restoredDraftId,
    canUndo,
    canRedo,
    initialize,
    reset,
    hasSavedDraft,
    restoreSavedDraft,
    consumeRestoredDraft,
    clearSavedDraft,
    clearHistory,
    flushPendingChanges,
    setNoteTitle,
    setChecklistItemTitle,
    setChecklistItemCompleted,
    addChecklistItem,
    removeChecklistItem,
    undo,
    redo,
  };
});
