export interface IProductSearch {
	product_name: string;
	product_number: string;
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
	product_number: string;
	product_name: string;
	media_m: string;
}

export interface SearchResponse {
	searchSuggestions: ISuggestions[];
	productRes: IProductSearch[];
}
