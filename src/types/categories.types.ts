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
	image?: string;
	imageGray?: string;
	imageGreen?: string;
	mediaId?: Array<{ url: string; filename?: string; picture_type?: string; thumbnail_url?: string }> | { url: string; filename?: string; picture_type?: string; thumbnail_url?: string };
}
