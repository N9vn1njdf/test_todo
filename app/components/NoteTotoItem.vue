<script setup lang="ts">
const title = defineModel<string>("title", { default: "" });
const completed = defineModel<boolean>("completed", { default: false });
const emit = defineEmits<{ delete: [] }>();
const editorStore = useNoteEditorStore();

function handleHistoryShortcut(event: KeyboardEvent): void {
  if (
    !(event.ctrlKey || event.metaKey) ||
    event.altKey ||
    event.key.toLowerCase() !== "z"
  ) {
    return;
  }

  event.preventDefault();
  if (event.shiftKey) {
    editorStore.redo();
  } else {
    editorStore.undo();
  }
}
</script>

<template>
  <div class="flex gap-2 items-center p-1 hover:bg-secondary/45">
    <UiCheckbox v-model="completed" size="lg" />
    <input
      v-model="title"
      type="text"
      class="flex-1 focus:outline-none"
      :class="{ 'line-through text-gray-400': completed }"
      aria-label="Название пункта чеклиста"
      @keydown.stop="handleHistoryShortcut"
    />
    <UiButton
      label="Удалить"
      color="error"
      variant="ghost"
      @click="emit('delete')"
    />
  </div>
</template>
