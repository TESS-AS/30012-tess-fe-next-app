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

export interface UserDimensionsResponse {
    userId: number;
    customerId: number;
    customerNumber: string;
    [key: string]: any; // allows dynamic dimension keys like dimension1, dimension2...
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