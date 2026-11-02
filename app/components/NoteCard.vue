<script setup lang="ts">
import type { Note } from "~/models/note";

const route = useRoute();

defineProps<{
  note: Note;
}>();
</script>

<template>
  <NuxtLink
    :to="`/${note.id}`"
    class="block cursor-pointer border-b border-secondary hover:bg-secondary/45 p-3"
    :class="{ 'bg-secondary/60!': route.params.id === note.id }"
  >
    <div class="font-semibold">{{ note.title || "Без названия" }}</div>
    <div class="flex flex-col">
      <div
        v-for="item in note.checklist.slice(0, 3)"
        :key="item.id"
        class="flex gap-2"
      >
        <UiCheckbox :model-value="item.completed" disabled />
        <span class="text-sm">{{ item.title }}</span>
      </div>
    </div>
  </NuxtLink>
</template>
