<script setup lang="ts">
import * as LucideIcons from "@lucide/vue";
import type { Component } from "vue";

type ButtonColor = "primary" | "secondary" | "error";
type ButtonVariant = "solid" | "ghost" | "soft";

const props = withDefaults(
  defineProps<{
    label?: string;
    icon?: string;
    color: ButtonColor;
    variant?: ButtonVariant;
    disabled?: boolean;
  }>(),
  {
    variant: "solid",
  },
);

const iconComponent = computed(
  () =>
    props.icon &&
    (LucideIcons as unknown as Record<string, Component>)[props.icon],
);

const solidColorClasses: Record<ButtonColor, string> = {
  primary: "bg-primary hover:bg-primary/80 text-white",
  secondary: "bg-secondary hover:bg-secondary/80 text-black",
  error: "bg-red-500 hover:bg-red-500/80 text-white",
};

const variantColorClasses: Record<
  ButtonVariant,
  Record<ButtonColor, string>
> = {
  solid: solidColorClasses,
  ghost: {
    primary: "text-primary hover:text-primary/80",
    secondary: "text-black hover:text-black/80",
    error: "text-red-500 hover:text-red-400",
  },
  soft: {
    primary: "bg-primary/10 hover:bg-primary/15 text-primary",
    secondary: "bg-secondary/10 hover:bg-secondary/15 text-black",
    error: "bg-red-500/10 hover:bg-red-500/15 text-red-500",
  },
};
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    :class="[
      'inline-flex items-center justify-center rounded-md text-sm',

      icon && !label ? 'size-8 p-0' : 'px-3 py-1.5',
      variantColorClasses[variant][color],
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
