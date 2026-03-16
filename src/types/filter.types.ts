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

// Definition of a single filter (attribute) including its possible values
// and optional slider configuration when the filter is a numeric range.
export interface FilterDefinition {
	key: string;
	values: FilterChildValue[];
	slider?: SliderConfig;
}

// Generic filter key/value pair used when talking to the API
// or serializing filters into the URL.
export interface FilterValues {
	key: string;
	values: string[];
}

// Top-level filter group for a category, as used by the UI.
export interface FilterCategory {
	category: string;
	categoryNumber?: string;
	filters: FilterDefinition[];
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
