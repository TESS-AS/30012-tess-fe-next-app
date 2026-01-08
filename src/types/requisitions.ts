export interface RequisitionResponse {
	customerId: number;
	requisitionId: number;
	requestDate: string;
	requestTime: string;
	description: string;
	status: string;
	totalPrice: number;
	fullName: string;
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
