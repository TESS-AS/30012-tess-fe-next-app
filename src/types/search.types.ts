export interface IProductSearch {
	itemVariantCount: number;
	productName: string;
	productNumber: string;
	thumbnail: string;
	itemName?: string | null;
	attribute1?: string | null;
	attribute2?: string | null;
	redirect?: string | null;
	redirectType?: string | null;
	ranking?: number | null;
	inStock?: boolean;
}

export const VARIANT_REDIRECT_TYPES = new Set([
	"itemNumber",
	"sap",
	"gtin",
	"skf",
	"supplier",
	"name",
]);

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
	numberOfHits?: number;
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
