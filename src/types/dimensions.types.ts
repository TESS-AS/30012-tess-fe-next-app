export interface CreateCustomerDimensions {
	dimensionType: string;
	customerNumber: string;
	dimensionName: string;
}

export interface CreateUserDimensions {
    userId: number;
    customerNumber: string;
    dimension1Id: number[];
    dimension2Id: number[];
    dimension3Id: number[];
    dimension1Label: string;
    dimension2Label: string;
    dimension3Label: string;
}