<template>
	<div class="flex h-full">
		<div class="w-70 h-full overflow-scroll border-r border-secondary">
			<NoteCard v-for="i in 10" />
		</div>
		<div class="flex-1">
			<slot />
		</div>
	</div>
</template>
