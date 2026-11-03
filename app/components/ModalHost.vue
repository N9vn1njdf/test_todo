<script setup lang="ts">
const modalStore = useModalStore();

function closeModal(result: unknown): void {
  modalStore.requestClose(result);
}
</script>

<template>
  <UiModal
    v-if="modalStore.activeModal"
    :model-value="!modalStore.activeModal.closing"
    @update:model-value="(isOpen) => !isOpen && closeModal(undefined)"
    @after-leave="modalStore.finishClose"
  >
    <component
      :is="modalStore.activeModal.component"
      :key="modalStore.activeModal.id"
      v-bind="modalStore.activeModal.props"
      @close="closeModal"
    />
  </UiModal>
</template>
