<script setup lang="ts">
const router = useRouter();
const editorStore = useNoteEditorStore();
const notesStore = useNotesStore();
const hasDraftPrompt = ref(false);

onMounted(() => {
  notesStore.initializeFromStorage();
  hasDraftPrompt.value = editorStore.hasSavedDraft();
});

function continueDraft(): void {
  const savedDraft = editorStore.restoreSavedDraft();
  if (!savedDraft) {
    hasDraftPrompt.value = false;
    return;
  }

  hasDraftPrompt.value = false;
  void router.push(savedDraft.id ? `/${savedDraft.id}` : "/new");
}

function discardDraft(): void {
  editorStore.clearSavedDraft();
  hasDraftPrompt.value = false;
}
</script>

<template>
  <main
    class="flex h-[100dvh] items-center justify-center bg-white md:h-screen md:bg-gray-100"
  >
    <div
      class="flex h-full min-h-0 w-full max-w-5xl flex-col overflow-hidden bg-white md:h-[calc(100vh-100px)] md:rounded-2xl md:border md:border-secondary"
    >
      <div
        v-if="hasDraftPrompt"
        class="flex items-center justify-between gap-3 border-b border-secondary bg-amber-50 px-4 py-3 text-sm md:rounded-t-2xl"
      >
        <span>Обнаружен черновик, хотите продолжить?</span>
        <div class="flex gap-2">
          <UiButton label="Да" color="primary" @click="continueDraft" />
          <UiButton label="Нет" color="secondary" @click="discardDraft" />
        </div>
      </div>
      <div class="min-h-0 flex-1">
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </div>
    </div>
    <ModalHost />
  </main>
</template>
