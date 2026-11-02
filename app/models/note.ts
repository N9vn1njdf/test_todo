export interface ChecklistItem {
	id: string;
	title: string;
	completed: boolean;
}

export interface Note {
	id: string;
	title: string;
	text: string;
	checklist: ChecklistItem[];
}
