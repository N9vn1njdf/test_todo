<script setup lang="ts">
import { createId } from "@paralleldrive/cuid2";
import type { Note } from "~/models/note";

const note = defineModel<Note>({ required: true });
const titleError = defineModel<boolean>("titleError", { default: false });

watch(
  () => note.value.title,
  (title) => {
    if (title.trim()) {
      titleError.value = false;
    }
  },
);

function addChecklistItem(): void {
  note.value.checklist.push({ id: createId(), title: "", completed: false });
}

function removeChecklistItem(id: string): void {
  note.value.checklist = note.value.checklist.filter((item) => item.id !== id);
}
</script>

<template>
  <div class="flex flex-col gap-3">
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
  </div>
</template>
