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
    class="block cursor-pointer border-b border-secondary hover:bg-secondary/45 p-3 px-4"
    :class="{ 'bg-secondary/60!': route.params.id === note.id }"
  >
    <div class="font-semibold">{{ note.title || "Без названия" }}</div>
    <div class="flex flex-col mt-2" v-if="note.checklist">
      <div
        v-for="item in note.checklist.slice(0, 3)"
        :key="item.id"
        class="flex gap-2 items-center"
      >
        <UiCheckbox :model-value="item.completed" size="sm" disabled />
        <span class="text-sm line-clamp-1">{{ item.title }}</span>
      </div>
    </div>
  </NuxtLink>
</template>
