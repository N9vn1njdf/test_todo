<script setup lang="ts">
const title = defineModel<string>("title", { default: "" });
const completed = defineModel<boolean>("completed", { default: false });
const emit = defineEmits<{ delete: [] }>();
</script>

<template>
  <div class="flex gap-2 items-center p-1 hover:bg-secondary/45">
    <UiCheckbox v-model="completed" class="w-5 aspect-square" />
    <input
      v-model="title"
      type="text"
      class="flex-1 text-sm focus:outline-none"
      :class="{ 'line-through text-gray-400': completed }"
      aria-label="Название пункта чеклиста"
    />
    <button
      type="button"
      class="text-red-500 hover:text-red-400 cursor-pointer text-sm"
      @click="emit('delete')"
    >
      Удалить
    </button>
  </div>
</template>
