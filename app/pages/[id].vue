<script setup lang="ts">
import { createId } from "@paralleldrive/cuid2";
import type { Note } from "~/models/note";

const route = useRoute();
const router = useRouter();
const notesStore = useNotesStore();
const isNew = computed(() => route.params.id === "new");
const note = ref<Note>({
  id: "",
  title: "",
  text: "",
  checklist: [],
});

watch(
  () => route.params.id,
  (id) => {
    if (id === "new") {
      note.value = { id: "", title: "", text: "", checklist: [] };
      return;
    }

    const existingNote = notesStore.notes.find((item) => item.id === id);
    if (!existingNote) {
      void router.replace("/");
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
  if (isNew.value) {
    const createdNote = notesStore.createNote({
      title: note.value.title,
      text: note.value.text,
      checklist: note.value.checklist,
    });
    void router.push(`/${createdNote.id}`);
    return;
  }

  notesStore.saveNote(note.value);
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
  <div class="flex flex-col gap-3 p-3">
    <div class="flex flex-col gap-1">
      <label for="note-title">Название</label>
      <UiInput id="note-title" v-model="note.title" />
    </div>
    <div class="flex flex-col gap-1">
      <label for="note-description">Описание</label>
      <UiTextarea id="note-description" v-model="note.text" />
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
