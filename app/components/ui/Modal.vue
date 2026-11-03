<script setup lang="ts">
import { onKeyStroke } from "@vueuse/core";
import { onMounted, onUnmounted, watch } from "vue";

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "after-leave": [];
}>();

let previousBodyOverflow = "";
let isBodyScrollLocked = false;

function lockBodyScroll(): void {
  if (isBodyScrollLocked || typeof document === "undefined") {
    return;
  }

  previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  isBodyScrollLocked = true;
}

function unlockBodyScroll(): void {
  if (!isBodyScrollLocked || typeof document === "undefined") {
    return;
  }

  document.body.style.overflow = previousBodyOverflow;
  isBodyScrollLocked = false;
}

onKeyStroke("Escape", () => {
  if (props.modelValue) {
    emit("update:modelValue", false);
  }
});

onMounted(() => {
  if (props.modelValue) {
    lockBodyScroll();
  }
});

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      lockBodyScroll();
    }
  },
);

onUnmounted(() => {
  unlockBodyScroll();
});
</script>

<template>
  <Teleport to="body">
    <Transition name="ui-modal" @after-leave="emit('after-leave')" appear>
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="presentation"
        @click.self="emit('update:modelValue', false)"
      >
        <div class="ui-modal__backdrop absolute inset-0 bg-black/50" />
        <section
          class="ui-modal__content relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
          role="dialog"
          aria-modal="true"
        >
          <slot />
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.ui-modal-enter-active,
.ui-modal-leave-active {
  transition: opacity 180ms ease;
}

.ui-modal-enter-active .ui-modal__content,
.ui-modal-leave-active .ui-modal__content {
  transition: transform 180ms ease;
}

.ui-modal-enter-from,
.ui-modal-leave-to {
  opacity: 0;
}

.ui-modal-enter-from .ui-modal__content,
.ui-modal-leave-to .ui-modal__content {
  transform: translateY(0.75rem) scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .ui-modal-enter-active,
  .ui-modal-leave-active,
  .ui-modal-enter-active .ui-modal__content,
  .ui-modal-leave-active .ui-modal__content {
    transition-duration: 1ms;
  }
}
</style>
