<script setup lang="ts">
const model = defineModel<string>({ default: "" });
</script>

<template>
	<input
		v-model="model"
		type="text"
		class="w-full rounded-md border border-secondary px-3 py-2 focus:outline-2 focus:outline-primary"
	/>
</template>