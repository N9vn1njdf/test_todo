<script setup lang="ts">
const model = defineModel<boolean>({ default: false });

withDefaults(
	defineProps<{
		disabled?: boolean;
	}>(),
	{
		disabled: false,
	},
);
</script>

<template>
	<input
		v-model="model"
		type="checkbox"
		:disabled="disabled"
		:class="{
			'cursor-pointer': !disabled,
		}"
	/>
</template>
