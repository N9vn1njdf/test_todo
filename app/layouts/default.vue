<script setup lang="ts">
const notesStore = useNotesStore();
</script>

<template>
  <div class="flex h-full">
    <div
      class="flex h-full w-70 flex-col overflow-scroll border-r border-secondary"
    >
      <NuxtLink
        to="/new"
        class="m-3 rounded-md bg-primary px-3 py-2 text-center text-white"
      >
        Создать
      </NuxtLink>
      <NoteCard v-for="note in notesStore.notes" :key="note.id" :note="note" />
    </div>
    <div class="flex-1">
      <slot />
    </div>
  </div>
</template>
