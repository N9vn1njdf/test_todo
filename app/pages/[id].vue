<script setup lang="ts">
import { createId } from "@paralleldrive/cuid2";
import type { Note } from "~/models/note";

const route = useRoute();
const router = useRouter();
const notesStore = useNotesStore();
const isNew = computed(() => route.params.id === "new");
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
  () => note.value.title,
  (title) => {
    if (title.trim()) {
      titleError.value = false;
    }
  },
);

watch(
  () => route.params.id,
  (id) => {
    titleError.value = false;

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

function save(): void {
  if (!note.value.title.trim()) {
    titleError.value = true;
    return;
  }

  if (isNew.value) {
    notesStore.createNote({
      title: note.value.title,
      checklist: note.value.checklist,
    });
    void router.push("/");
    return;
  }

  notesStore.saveNote(note.value);
  void router.push("/");
}

function remove(): void {
  notesStore.deleteNote(note.value.id);
  void router.push("/");
}

function addChecklistItem(): void {
  note.value.checklist.push({ id: createId(), title: "", completed: false });
}

function removeChecklistItem(id: string): void {
  note.value.checklist = note.value.checklist.filter((item) => item.id !== id);
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
    <div class="flex flex-col gap-1">
      <label for="note-title">Название</label>
      <UiInput id="note-title" v-model="note.title" />
      <p v-if="titleError" class="text-red-500 text-sm">
        Поле обязательно к заполнению
      </p>
    </div>

    <div class="flex flex-col gap-1">
      <div>TODO</div>
      <NoteTotoItem
        v-for="item in note.checklist"
        :key="item.id"
        v-model:title="item.title"
        v-model:completed="item.completed"
        @delete="removeChecklistItem(item.id)"
      />
      <button
        type="button"
        class="self-start text-sm text-primary"
        @click="addChecklistItem"
      >
        Добавить пункт
      </button>
    </div>

    <div class="mt-auto flex justify-end gap-2">
      <UiButton
        :label="isNew ? 'Создать' : 'Сохранить'"
        color="primary"
        @click="save"
      />
      <UiButton v-if="!isNew" label="Удалить" color="error" @click="remove" />
    </div>
  </div>
</template>
