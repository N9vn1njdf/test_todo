<script setup lang="ts">
import type { Note } from "~/models/note";

defineProps<{
  note: Note;
}>();
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-col gap-1">
      <div class="font-semibold text-2xl">{{ note.title }}</div>
    </div>

    <div class="flex flex-col gap-1">
      <div>TODO</div>
      <div
        v-for="item in note.checklist"
        :key="item.id"
        class="flex items-center gap-2 p-1"
      >
        <UiCheckbox :model-value="item.completed" size="lg" disabled />
        <span :class="{ 'line-through text-gray-400': item.completed }">
          {{ item.title }}
        </span>
      </div>
      <div v-if="note.checklist.length === 0" class="text-sm text-gray-500">
        Нет пунктов
      </div>
    </div>
  </div>
</template>
