<script setup lang="ts">
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
		type="checkbox"
		:disabled="disabled"
		:class="{
			'cursor-pointer': !disabled,
		}"
	/>
</template>
