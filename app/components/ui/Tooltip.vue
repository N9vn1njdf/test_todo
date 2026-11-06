<script setup lang="ts">
defineProps<{
  text: string;
}>();
</script>

<template>
  <span class="group relative inline-flex">
    <slot />
    <span
      role="tooltip"
      class="invisible absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap select-none rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
    >
      {{ text }}
    </span>
  </span>
</template>
