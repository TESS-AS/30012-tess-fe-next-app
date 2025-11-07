export interface IProductSearch {
	inStock: boolean;
	itemVariantCount: number;
	attributes: ProductAttributes;
	productName: string;
	productNumber: string;
	thumbnail: string;
	attribute1?: string | null;
	attribute2?: string | null;
	redirect?: string;
	itemNumberMatch?: boolean;
}

export interface ProductAttributes {
	attribute1?: string | null;
	attribute2?: string | null;
	[k: string]: string | number | boolean | null | undefined;
}

export interface ISuggestions {
	keyword: string;
}

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
	name: string;
	productVariantCount: string;
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
