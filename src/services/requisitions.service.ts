import axiosInstance from "./axiosClient";

export interface RequisitionResponse {
	customerId: number;
	requisitionId: number;
	requestDate: string;
	requestTime: string;
	description: string;
	status: string;
	totalPrice: number;
	fullName: string;
	requisitionLines: [
		{
			requisitionLineId: number;
			lineNumber: number;
			itemId: number;
			quantity: number;
			itemNumber: string;
			unitPrice: number;
		},
	];
}

export const getRequisition = async (
	customerNumber: string,
	status?: string,
): Promise<RequisitionResponse[]> => {
	try {
		const url = `/requisition/getRequisition/${customerNumber}`;
		const response = await axiosInstance.get(url, {
			params: status ? { status } : {},
		});
		return response.data;
	} catch (error) {
		console.error("Error getting requisition:", error);
		throw error;
	}
};
