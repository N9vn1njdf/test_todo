<script setup lang="ts">
type ButtonColor = "primary" | "secondary" | "error";

defineProps<{
  label: string;
  color: ButtonColor;
  disabled?: boolean;
}>();

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
      'rounded-md px-3 py-1.5 text-sm cursor-pointer',
      colorClasses[color],
      { 'opacity-50 cursor-not-allowed': disabled },
    ]"
  >
    {{ label }}
  </button>
</template>
