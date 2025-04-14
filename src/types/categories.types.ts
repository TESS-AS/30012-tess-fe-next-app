export interface RawCategory {
	group_id: string;
	name_en?: string;
	name_no?: string;
	children?: RawCategory[];
	[key: string]: any;
}

export interface Category {
	name: string;
	slug: string;
	groupId: string;
	subcategories?: Category[];
}
