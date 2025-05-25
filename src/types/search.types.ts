export interface IProductSearch {
	productName: string;
	productNumber: string;
	media: string;
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

export interface SearchResponse {
	searchSuggestions: ISuggestions[];
	productRes: IProductSearch[];
}

export interface PriceResponse {
	itemNumber: string;
    warehouseNumber: string;
    quantity: number;
    basePrice: number;
    basePriceTotal: number;
    quantityPrice: number;
    methodMatches: {},
    bestPrice: number,
    bestSource: string
}