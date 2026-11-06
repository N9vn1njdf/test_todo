<script setup lang="ts">
import { Check } from "@lucide/vue";

const model = defineModel<boolean>({ default: false });

withDefaults(
  defineProps<{
    disabled?: boolean;
    size?: "sm" | "md" | "lg";
  }>(),
  {
    disabled: false,
    size: "md",
  },
);

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

const checkSizes = {
  sm: 12,
  md: 15,
  lg: 18,
};
const borderSizes = {
  sm: "border",
  md: "border-2",
  lg: "border-2",
};
</script>

<template>
  <label
    class="inline-flex shrink-0 items-center justify-center"
    :class="[
      sizeClasses[size],
      { 'cursor-pointer': !disabled, 'cursor-not-allowed': disabled },
    ]"
  >
    <input
      v-model="model"
      type="checkbox"
      :disabled="disabled"
      class="peer sr-only"
    />
    <span
      aria-hidden="true"
      :class="borderSizes[size]"
      class="flex h-full w-full items-center justify-center rounded-full border-gray-400 bg-transparent text-white transition-colors peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-disabled:opacity-50"
    >
      <Check v-if="model" :size="checkSizes[size]" :stroke-width="3" />
    </span>
  </label>
</template>
