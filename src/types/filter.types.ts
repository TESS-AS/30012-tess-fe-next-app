export interface FilterValues {
	search: string;
	category: string;
	brand: string;
	minPrice: string;
	maxPrice: string;
	availability: string[];
	spec: string;
	certification: string;
	location: string;
	mapCoords?: [number, number];
}
