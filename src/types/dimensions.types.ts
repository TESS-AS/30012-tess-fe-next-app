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
    [key: string]: string | number;
}