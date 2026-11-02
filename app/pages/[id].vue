<script setup lang="ts">
import NoteEdit from "~/components/note/Edit.vue";
import NoteView from "~/components/note/View.vue";
import type { Note } from "~/models/note";

const route = useRoute();
const router = useRouter();
const notesStore = useNotesStore();
const isNew = computed(() => route.params.id === "new");
const isEditing = ref(isNew.value);
const noteNotFound = computed(
  () =>
    !isNew.value &&
    !notesStore.notes.some((item) => item.id === route.params.id),
);
const note = ref<Note>({
  id: "",
  title: "",
  checklist: [],
});
const titleError = ref(false);

watch(
  () => route.params.id,
  (id) => {
    titleError.value = false;
    isEditing.value = id === "new";

    if (id === "new") {
      note.value = { id: "", title: "", checklist: [] };
      return;
    }

    const existingNote = notesStore.notes.find((item) => item.id === id);
    if (!existingNote) {
      note.value = { id: "", title: "", checklist: [] };
      return;
    }

    note.value = {
      ...existingNote,
      checklist: existingNote.checklist.map((item) => ({ ...item })),
    };
  },
  { immediate: true },
);

function copyNote(source: Note): Note {
  return {
    ...source,
    checklist: source.checklist.map((item) => ({ ...item })),
  };
}

function save(): void {
  if (!note.value.title.trim()) {
    titleError.value = true;
    return;
  }

  if (isNew.value) {
    const createdNote = notesStore.createNote({
      title: note.value.title,
      checklist: note.value.checklist,
    });
    void router.push(`/${createdNote.id}`);
    return;
  }

  notesStore.saveNote(note.value);
  note.value = copyNote(note.value);
  titleError.value = false;
  isEditing.value = false;
}

function cancelEditing(): void {
  titleError.value = false;

  if (isNew.value) {
    void router.push("/");
    return;
  }

  const savedNote = notesStore.notes.find(
    (item) => item.id === route.params.id,
  );
  if (savedNote) {
    note.value = copyNote(savedNote);
  }
  isEditing.value = false;
}

function remove(): void {
  notesStore.deleteNote(note.value.id);
  void router.push("/");
}
</script>

<template>
  <div
    v-if="noteNotFound"
    class="h-full flex flex-col items-center justify-center"
  >
    <div class="text-3xl mb-1">404</div>
    <div>Заметка не найдена</div>
  </div>

  <div v-else class="flex flex-col gap-3 p-3">
    <div class="flex justify-end gap-2">
      <template v-if="isEditing">
        <UiButton
          label="Отменить редактирование"
          color="secondary"
          @click="cancelEditing"
          v-if="!isNew"
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
      <UiButton v-if="!isNew" label="Удалить" color="error" @click="remove" />
    </div>

    <NoteEdit
      v-if="isEditing"
      v-model="note"
      v-model:title-error="titleError"
    />
    <NoteView v-else :note="note" />
  </div>
</template>
