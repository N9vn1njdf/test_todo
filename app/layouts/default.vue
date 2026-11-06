<script setup lang="ts">
const route = useRoute();
const notesStore = useNotesStore();
const hasActiveNote = computed(() => Boolean(route.params.id));
</script>

<template>
  <div class="flex h-full min-h-0">
    <div
      class="h-full w-full flex-col overflow-y-auto border-secondary md:w-75 md:border-r"
      :class="hasActiveNote ? 'hidden md:flex' : 'flex'"
    >
      <div class="border-b border-secondary w-full p-3">
        <NuxtLink to="/new">
          <UiButton label="Создать" color="primary" class="w-full" />
        </NuxtLink>
      </div>
      <NoteCard v-for="note in notesStore.notes" :key="note.id" :note="note" />
    </div>
    <div
      class="h-full min-w-0 flex-1 flex-col"
      :class="hasActiveNote ? 'flex' : 'hidden md:flex'"
    >
      <div class="min-h-0 flex-1 overflow-y-auto">
        <slot />
      </div>
    </div>
  </div>
</template>
