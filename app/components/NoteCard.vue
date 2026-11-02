<script lang="ts" setup></script>

<template>
	<div class="border-b border-secondary p-3 cursor-pointer">
		<div class="font-semibold">Title</div>
		<div class="flex flex-col">
			<div class="flex gap-2" v-for="i in 3">
				<UiCheckbox disabled />
				<span class="text-sm">todo item</span>
			</div>
		</div>
	</div>
</template>
