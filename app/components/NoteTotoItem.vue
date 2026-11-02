<script setup lang="ts">
const title = defineModel<string>("title", { default: "" });
const completed = defineModel<boolean>("completed", { default: false });
</script>

<template>
	<div class="flex gap-2 p-1">
		<UiCheckbox v-model="completed" class="w-5 aspect-square" />
		<input
			v-model="title"
			type="text"
			class="flex-1 text-sm focus:outline-none"
			:class="{ 'line-through text-gray-400': completed }"
			aria-label="Название пункта чеклиста"
		/>
	</div>
</template>
