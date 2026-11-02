<script setup lang="ts">
const notesStore = useNotesStore();
</script>

<template>
  <div class="flex h-full">
    <div
      class="flex h-full w-70 flex-col overflow-scroll border-r border-secondary"
    >
      <div class="border-b border-secondary w-full p-3">
        <NuxtLink to="/new">
          <UiButton label="Создать" color="primary" class="w-full" />
        </NuxtLink>
      </div>
      <NoteCard v-for="note in notesStore.notes" :key="note.id" :note="note" />
    </div>
    <div class="flex-1">
      <slot />
    </div>
  </div>
</template>
