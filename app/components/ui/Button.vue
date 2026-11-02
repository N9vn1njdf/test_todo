<script setup lang="ts">
type ButtonColor = "primary" | "secondary" | "error";

defineProps<{
  label: string;
  color: ButtonColor;
}>();

const colorClasses: Record<ButtonColor, string> = {
  primary: "bg-primary text-white",
  secondary: "bg-secondary text-black",
  error: "bg-red-500 text-white",
};
</script>

<template>
  <button type="button" :class="['rounded-md px-4 py-2', colorClasses[color]]">
    {{ label }}
  </button>
</template>
