export interface RawCategory {
	groupId: string;
	nameEn?: string;
	nameNo?: string;
	children?: RawCategory[];
	[key: string]: any;
}

export interface Category {
	name: string;
	slug: string;
	groupId: string;
	subcategories?: Category[];
}
