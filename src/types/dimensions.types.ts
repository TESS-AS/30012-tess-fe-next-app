export interface CreateCustomerDimensions {
	dimensionType: string;
	customerNumber: string;
	dimensionName: string;
	budget: number;
	parentDimension?: string;
}

export interface DimensionLabel {
	[key: string]: string
}

export interface CreateUserDimensions {
	userId: number;
	customerNumber: string;
	[key: string]: string | number | number[]; // dynamic support for dimension keys
}

export interface CustomerDimension {
	d1_id: number;
	d1_name: string;
	d1_type: string;
	d2_id: number | null;
	d2_name: string | null;
	d2_type: string;
	d3_id: number | null;
	d3_name: string | null;
	d3_type: string;
	[key: string]: string | number | null;
}

export type CustomerDimensionItem = {
	d1_id: number;
	d1_name: string;
	d1_type: string;
	d2_id: number | null;
	d2_name: string | null;
	d2_type: string;
	d3_id: number | null;
	d3_name: string | null;
	d3_type: string;
};

export interface UserDimensionItem {
	userId: number;
	customerNumber: string;
	hierarchy: {
		dimension1?: {
			label: string;
			name: string;
			mode: boolean;
		};
		dimension2?: {
			label: string;
			name: string;
			mode: boolean;
		};
		dimension3?: {
			label: string;
			name: string;
			mode: boolean;
		};
	};
}

export interface SearchDimensionResponse {
	dimensionId: number;
	dimensionName: string;
	customerId: number;
	customerNumber: string;
}

export interface Dimension {
	id: string;
	name: string;
	type: string;
	budget: string;
	children?: Dimension[];
	isExpanded?: boolean;
}

export interface DimensionType {
	dimension: string;
	type: string;
	active: boolean;
}
