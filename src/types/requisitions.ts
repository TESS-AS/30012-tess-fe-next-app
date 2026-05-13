export type RequisitionType = 1 | 2;

export interface PlacerAddress {
	addressId: number;
	addressLine1: string | null;
	addressLine2: string | null;
	addressLine3: string | null;
	city: string | null;
	postalCode: string | null;
	countryCode: string | null;
}

export interface RequisitionResponse {
	customerId: number;
	requisitionId: number;
	requestDate: string;
	requestTime: string;
	description: string;
	status: string;
	totalPrice: number;
	fullName: string;
	requisitionType?: RequisitionType | null;
	placerUserId?: number | null;
	placerAddress?: PlacerAddress[] | null;
	requisitionLines: Array<{
		requisitionLineId: number;
		lineNumber: number;
		itemId: number;
		quantity: number;
		itemNumber: string;
		productName: string;
		productNumber: string;
		unitPrice: number;
		lineTotalPrice?: number;
	}>;
}

export interface RequisitionListResponse {
	requisitions: RequisitionResponse[];
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
}

export interface UpdateRequisitionPayload {
	customerNumber: string;
	requisitionId: number;
	status: string;
}

export interface UpdateRequisitionResponse {
	message: string;
	updated: [
		{
			requisition_id: number;
			status: string;
			description: string;
		},
	];
}

export interface CreateRequisitionPayload {
	customerNumber: string;
	description: string;
	items: Array<{
		itemNumber: string;
		quantity: number;
	}>;
}

export interface CreateRequisitionResponse {
	customerNumber: string;
	userId: number;
	requisitionId: number;
	description: string;
	requisitionLines: Array<{
		lineNumber: number;
		itemNumber: string;
		quantity: number;
	}>;
}
