// export interface FilterValues {
// 	search: string;
// 	category: string;
// 	brand: string;
// 	minPrice: string;
// 	maxPrice: string;
// 	availability: string[];
// 	spec: string;
// 	certification: string;
// 	location: string;
// 	mapCoords?: [number, number];
// }

export interface FilterValues {
	key: string;
	values: string[];
}

export interface FilterEntry {
	key: string;
	productCount: number;
}

export interface SearchFilterResponseItem {
	category: string;
	categoryFilters: any[];
	filter: FilterEntry[];
}

export interface CategoryFilterResponseItem {
	category: string;
	categoryNumber: string;
	filters: FilterEntry[];
}

export type FilterResponseItem =
	| SearchFilterResponseItem
	| CategoryFilterResponseItem;
