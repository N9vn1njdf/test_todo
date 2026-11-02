<template>
	<div class="flex flex-col gap-3 p-3">
		<div class="flex flex-col gap-1">
			<label for="note-title">Название</label>
			<UiInput id="note-title" />
		</div>
		<div class="flex flex-col gap-1">
			<label for="note-description">Описание</label>
			<UiTextarea id="note-description" />
		</div>

		<div class="flex flex-col gap-1">
			<div>TODO</div>
			<NoteTotoItem v-for="i in 7" />
		</div>
	</div>
</template>
