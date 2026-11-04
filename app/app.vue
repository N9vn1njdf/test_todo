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
  <main class="h-screen flex items-center justify-center bg-gray-100">
    <div
      class="w-full max-w-5xl h-[calc(100vh-100px)] bg-white border border-secondary rounded-2xl"
    >
      <div
        v-if="hasDraftPrompt"
        class="flex items-center justify-between gap-3 border-b border-secondary bg-amber-50 px-4 py-3 text-sm"
      >
        <span>Обнаружен черновик, хотите продолжить?</span>
        <div class="flex gap-2">
          <UiButton label="Да" color="primary" @click="continueDraft" />
          <UiButton label="Нет" color="secondary" @click="discardDraft" />
        </div>
      </div>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
    <ModalHost />
  </main>
</template>
