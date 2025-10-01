import axiosInstance from "./axiosClient";

export interface RequisitionResponse {
	customerId: number;
	requisitionId: number;
	requestDate: string;
	requestTime: string;
	description: string;
	status: string;
	totalPrice: number;
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
): Promise<RequisitionResponse[]> => {
	try {
		const response = await axiosInstance.get(
			`/requisition/getRequisition/${customerNumber}`,
		);
		console.log(response.data, "response");
		return response.data;
	} catch (error) {
		console.error("Error getting requisition:", error);
		throw error;
	}
};
