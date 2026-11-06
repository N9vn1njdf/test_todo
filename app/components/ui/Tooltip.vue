<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

defineProps<{
  text: string;
}>();

const root = ref<HTMLElement | null>(null);
const tooltip = ref<HTMLElement | null>(null);
const isMounted = ref(false);
const isHovered = ref(false);
const isFocused = ref(false);
const tooltipStyle = ref({ left: "0px", top: "0px" });
const tooltipId = useId();
const isVisible = computed(() => isHovered.value || isFocused.value);

function updatePosition(): void {
  const triggerElement = root.value;
  const tooltipElement = tooltip.value;
  if (!triggerElement || !tooltipElement) return;

  const triggerRect = triggerElement.getBoundingClientRect();
  const tooltipRect = tooltipElement.getBoundingClientRect();
  const viewportPadding = 8;
  const gap = 8;
  const spaceAbove = triggerRect.top - gap - viewportPadding;
  const spaceBelow =
    window.innerHeight - triggerRect.bottom - gap - viewportPadding;
  const placeAbove =
    spaceAbove >= tooltipRect.height || spaceAbove >= spaceBelow;

  const maxLeft = Math.max(
    viewportPadding,
    window.innerWidth - tooltipRect.width - viewportPadding,
  );
  const left = Math.min(
    Math.max(
      triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2,
      viewportPadding,
    ),
    maxLeft,
  );
  const preferredTop = placeAbove
    ? triggerRect.top - tooltipRect.height - gap
    : triggerRect.bottom + gap;
  const maxTop = Math.max(
    viewportPadding,
    window.innerHeight - tooltipRect.height - viewportPadding,
  );
  const top = Math.min(Math.max(preferredTop, viewportPadding), maxTop);

  tooltipStyle.value = { left: `${left}px`, top: `${top}px` };
}

function onFocusOut(event: FocusEvent): void {
  const nextTarget = event.relatedTarget;
  if (!(nextTarget instanceof Node) || !root.value?.contains(nextTarget)) {
    isFocused.value = false;
  }
}

watch(isVisible, async (visible) => {
  if (!visible) {
    window.removeEventListener("resize", updatePosition);
    window.removeEventListener("scroll", updatePosition, true);
    return;
  }

  window.addEventListener("resize", updatePosition);
  window.addEventListener("scroll", updatePosition, true);
  await nextTick();
  updatePosition();
});

onMounted(() => {
  isMounted.value = true;
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updatePosition);
  window.removeEventListener("scroll", updatePosition, true);
});
</script>

<template>
  <span
    ref="root"
    class="inline-flex"
    :aria-describedby="isVisible ? tooltipId : undefined"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @focusin="isFocused = true"
    @focusout="onFocusOut"
  >
    <slot />
  </span>

  <Teleport to="body">
    <span
      v-if="isMounted && isVisible"
      :id="tooltipId"
      ref="tooltip"
      role="tooltip"
      class="pointer-events-none fixed z-9999 max-w-[calc(100vw-16px)] whitespace-nowrap select-none rounded bg-gray-800 px-2 py-1 text-xs text-white"
      :style="tooltipStyle"
    >
      {{ text }}
    </span>
  </Teleport>
</template>
