<script setup lang="ts">
defineProps<{
  text: string;
}>();

const emit = defineEmits<{
  close: [confirmed: boolean];
}>();
</script>

<template>
  <div>
    <p class="mb-6 text-base text-gray-900">{{ text }}</p>
    <div class="flex justify-end gap-2">
      <UiButton
        label="Отмена"
        color="secondary"
        @click="emit('close', false)"
      />
      <UiButton label="Да" color="primary" @click="emit('close', true)" />
    </div>
  </div>
</template>
