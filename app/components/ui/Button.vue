<script setup lang="ts">
import * as LucideIcons from "@lucide/vue";
import type { Component } from "vue";

type ButtonColor = "primary" | "secondary" | "error";

const props = defineProps<{
  label?: string;
  icon?: string;
  color: ButtonColor;
  disabled?: boolean;
}>();

const iconComponent = computed(
  () =>
    props.icon &&
    (LucideIcons as unknown as Record<string, Component>)[props.icon],
);

const colorClasses: Record<ButtonColor, string> = {
  primary: "bg-primary hover:bg-primary/80 text-white",
  secondary: "bg-secondary hover:bg-secondary/80 text-black",
  error: "bg-red-500 hover:bg-red-500/80 text-white",
};
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    :class="[
      'inline-flex items-center justify-center rounded-md text-sm',

      icon && !label ? 'size-8 p-0' : 'px-3 py-1.5',
      colorClasses[color],
      {
        'gap-2': icon && label,
        'opacity-50 cursor-not-allowed': disabled,
        'cursor-pointer': !disabled,
      },
    ]"
  >
    <component :is="iconComponent" v-if="iconComponent" :size="16" />
    <span v-if="label">{{ label }}</span>
  </button>
</template>
