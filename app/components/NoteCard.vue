<script setup lang="ts">
import type { Note } from "~/models/note";

defineProps<{
	note: Note;
}>();
</script>

<template>
	<NuxtLink :to="`/${note.id}`" class="block cursor-pointer border-b border-secondary p-3">
		<div class="font-semibold">{{ note.title || "Без названия" }}</div>
		<div class="flex flex-col">
			<div v-for="item in note.checklist" :key="item.id" class="flex gap-2">
				<UiCheckbox :model-value="item.completed" disabled />
				<span class="text-sm">{{ item.title }}</span>
			</div>
		</div>
	</NuxtLink>
</template>
