<script setup lang="ts">
import { onKeyStroke } from "@vueuse/core";
import NoteEdit from "~/components/note/Edit.vue";
import NoteView from "~/components/note/View.vue";
import ConfirmationModal from "~/modals/ConfirmationModal.vue";
import type { Note } from "~/models/note";

const route = useRoute();
const router = useRouter();
const notesStore = useNotesStore();
const modalStore = useModalStore();
const editorStore = useNoteEditorStore();
const isNew = computed(() => route.params.id === "new");
const isEditing = ref(isNew.value);
const noteNotFound = computed(
  () =>
    notesStore.initialized &&
    !isNew.value &&
    !notesStore.notes.some((item) => item.id === route.params.id) &&
    !(isEditing.value && editorStore.draft?.id === route.params.id),
);
const emptyNote: Note = {
  id: "",
  title: "",
  checklist: [],
};
const note = computed(() => editorStore.draft ?? emptyNote);
const titleError = ref(false);

function initializeRouteDraft(id: string | string[] | undefined): void {
  if (!id) return;

  const routeId = Array.isArray(id) ? id[0] : id;
  titleError.value = false;
  isEditing.value = routeId === "new";

  if (editorStore.consumeRestoredDraft(routeId ?? "")) {
    isEditing.value = true;
    return;
  }

  if (editorStore.restoredDraftId !== null) {
    return;
  }

  if (routeId === "new") {
    editorStore.initialize(emptyNote);
    return;
  }

  const existingNote = notesStore.notes.find((item) => item.id === routeId);
  if (!existingNote) {
    editorStore.initialize(emptyNote);
    return;
  }

  editorStore.initialize(existingNote);
}

watch(
  () => route.params.id,
  (value) => initializeRouteDraft(value!),
  { immediate: true },
);

watch(
  () => notesStore.notes,
  () => initializeRouteDraft(route.params.id),
);

watch(
  () => editorStore.restoredDraftId,
  (id) => {
    if (id !== null) {
      initializeRouteDraft(route.params.id);
    }
  },
);

function save(): void {
  editorStore.flushPendingChanges();
  const draft = editorStore.draft;
  if (!draft?.title.trim()) {
    titleError.value = true;
    return;
  }

  if (isNew.value) {
    const createdNote = notesStore.createNote({
      title: draft.title,
      checklist: draft.checklist,
    });
    editorStore.clearSavedDraft();
    void router.push(`/${createdNote.id}`);
    return;
  }

  notesStore.saveNote(draft);
  editorStore.clearSavedDraft();
  editorStore.initialize(draft);
  titleError.value = false;
  isEditing.value = false;
}

function cancelEditing(): void {
  titleError.value = false;
  editorStore.flushPendingChanges();
  editorStore.clearSavedDraft();

  if (isNew.value) {
    editorStore.reset();
    void router.push("/");
    return;
  }

  const savedNote = notesStore.notes.find(
    (item) => item.id === route.params.id,
  );
  if (savedNote) {
    editorStore.initialize(savedNote);
  } else {
    editorStore.reset();
  }
  isEditing.value = false;
}

async function confirmCancelEditing(): Promise<void> {
  const confirmed = await modalStore.open<boolean>(ConfirmationModal, {
    text: isNew.value
      ? "Отменить создание заметки? Введённые данные будут потеряны."
      : "Отменить редактирование? Все несохранённые изменения будут потеряны.",
  });

  if (confirmed) {
    cancelEditing();
  }
}

function remove(): void {
  notesStore.deleteNote(note.value.id);
  editorStore.reset();
  void router.push("/");
}

async function confirmRemove(): Promise<void> {
  const confirmed = await modalStore.open<boolean>(ConfirmationModal, {
    text: `Удалить заметку «${note.value.title || "Без названия"}»?`,
  });

  if (confirmed) {
    remove();
  }
}

function isHistoryShortcut(event: KeyboardEvent): boolean {
  if (!isEditing.value || !(event.ctrlKey || event.metaKey) || event.altKey) {
    return false;
  }

  const target = event.target;
  if (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.closest("input, textarea, select, [contenteditable='true']"))
  ) {
    return false;
  }

  return event.key.toLowerCase() === "z";
}

onKeyStroke(isHistoryShortcut, (event) => {
  event.preventDefault();
  if (event.shiftKey) {
    editorStore.redo();
  } else {
    editorStore.undo();
  }
});
</script>

<template>
  <div
    v-if="noteNotFound"
    class="h-full flex flex-col items-center justify-center"
  >
    <div class="text-3xl mb-1">404</div>
    <div>Заметка не найдена</div>
  </div>

  <div
    v-if="!isEditing && !note.id"
    class="h-full flex flex-col items-center justify-center"
  >
    <div>Загрузка..</div>
  </div>

  <div v-else class="flex flex-col">
    <div class="flex justify-end gap-2 border-b border-secondary p-3">
      <template v-if="isEditing">
        <div class="flex gap-2 flex-1">
          <UiButton
            label="Отменить"
            color="secondary"
            :disabled="!editorStore.canUndo"
            @click="editorStore.undo"
          />
          <UiButton
            label="Повторить"
            color="secondary"
            :disabled="!editorStore.canRedo"
            @click="editorStore.redo"
          />
        </div>

        <UiButton
          :label="isNew ? 'Отменить создание' : 'Отменить редактирование'"
          color="secondary"
          @click="confirmCancelEditing"
        />
        <UiButton
          :label="isNew ? 'Создать' : 'Сохранить'"
          color="primary"
          @click="save"
        />
      </template>
      <UiButton
        v-else
        label="Редактировать"
        color="primary"
        @click="isEditing = true"
      />
      <UiButton
        v-if="!isNew"
        label="Удалить"
        color="error"
        @click="confirmRemove"
      />
    </div>

    <div class="p-5">
      <NoteEdit v-if="isEditing" v-model:title-error="titleError" />
      <NoteView v-else :note="note" />
    </div>
  </div>
</template>
