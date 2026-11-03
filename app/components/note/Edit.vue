<script setup lang="ts">
import ConfirmationModal from "~/modals/ConfirmationModal.vue";

const titleError = defineModel<boolean>("titleError", { default: false });
const modalStore = useModalStore();
const editorStore = useNoteEditorStore();
const title = computed({
  get: () => editorStore.draft?.title ?? "",
  set: (value: string) => editorStore.setNoteTitle(value),
});

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

watch(
  () => editorStore.draft?.title,
  (value) => {
    if (value?.trim()) {
      titleError.value = false;
    }
  },
);

async function confirmRemoveChecklistItem(id: string): Promise<void> {
  const item = editorStore.draft?.checklist.find(
    (checklistItem) => checklistItem.id === id,
  );
  if (!item) {
    return;
  }

  const confirmed = await modalStore.open<boolean>(ConfirmationModal, {
    text: `Удалить пункт «${item.title || "Без названия"}»?`,
  });

  if (confirmed) {
    editorStore.removeChecklistItem(id);
  }
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-col gap-1">
      <label for="note-title">Название</label>
      <UiInput
        id="note-title"
        v-model="title"
        @keydown.stop="handleHistoryShortcut"
      />
      <p v-if="titleError" class="text-red-500 text-sm">
        Поле обязательно к заполнению
      </p>
    </div>

    <div class="flex flex-col gap-1">
      <div>TODO</div>
      <NoteTotoItem
        v-for="item in editorStore.draft?.checklist ?? []"
        :key="item.id"
        :title="item.title"
        :completed="item.completed"
        @update:title="editorStore.setChecklistItemTitle(item.id, $event)"
        @update:completed="
          editorStore.setChecklistItemCompleted(item.id, $event)
        "
        @delete="confirmRemoveChecklistItem(item.id)"
      />
      <button
        type="button"
        class="self-start text-sm text-primary"
        @click="editorStore.addChecklistItem"
      >
        Добавить пункт
      </button>
    </div>
  </div>
</template>
