export interface CreateCustomerDimensions {
	dimensionType: string;
	customerNumber: string;
	dimensionName: string;
}

export interface CreateUserDimensions {
	userId: number;
	customerNumber: string;
	[key: string]: string | number | number[]; // dynamic support for dimension keys
}

export interface CustomerDimension {
	d1_id: number;
	d1_name: string;
	d2_id: number | null;
	d2_name: string | null;
	d3_id: number | null;
	d3_name: string | null;
	[key: string]: string | number | null;
}

export type CustomerDimensionItem = {
	d1_id: number;
	d1_name: string;
	d2_id: number | null;
	d2_name: string | null;
	d3_id: number | null;
	d3_name: string | null;
};

export type UserDimensionItem = {
	userId: number;
	customerId: number;
	customerNumber: string;
	dimension1: {
		ids: number[];
		label: string;
		mode: boolean;
	};
	dimension2: {
		ids: number[];
		label: string;
		mode: boolean;
	};
	dimension3: {
		ids: number[];
		label: string;
		mode: boolean;
	};
};

export interface SearchDimensionResponse {
	dimensionId: number;
	dimensionName: string;
	customerId: number;
	customerNumber: string;
}
