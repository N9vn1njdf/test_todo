<script setup lang="ts">
const model = defineModel<string>({ default: "" });
</script>

<template>
	<textarea
		v-model="model"
		class="w-full rounded-md border border-secondary px-3 py-2 focus:outline-2 focus:outline-primary"
	></textarea>
</template>