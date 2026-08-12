export interface IProductSearch {
	itemVariantCount: number;
	productName: string;
	productNumber: string;
	thumbnail: string;
	attribute1?: string | null;
	attribute2?: string | null;
	redirect?: string | null;
	ranking?: number | null;
	// Not returned by /proxy/search today — kept optional in case BE re-adds it.
	inStock?: boolean;
}

export type ISuggestions = string;

export interface ISearchList {
	product: SearchArray[];
	page: number;
	totalPages: number;
}

export interface SearchArray {
	productNumber: string;
	productName: string;
	media_m: string;
}

export interface SearchCategory {
	categoryNumber?: string;
	depth?: number;
	slug?: string[];
	name: string;
	productVariantCount: number;
}

export interface SearchResponse {
	suggestions: ISuggestions[];
	productRes: IProductSearch[];
	categories: SearchCategory[];
}

export interface PriceResponse {
	itemNumber: string;
	warehouseNumber: string;
	quantity: number;
	basePrice: number;
	basePriceTotal: number;
	quantityPrice: number;
	methodMatches: {};
	bestPrice: number;
	bestSource: string;
	surCharge: number;
	flatDiscount: number;
}
