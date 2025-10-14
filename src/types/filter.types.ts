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

export interface SliderConfig {
	attributeKey: string;
	type: "slider";
	min: number;
	max: number;
	unit: string;
}

export interface FilterChildValue {
	value: string;
	type: string;
	productcount: string;
}

export interface FilterChildrenResponse {
	attributeKey: string;
	values: FilterChildValue[];
	slider?: SliderConfig;
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
