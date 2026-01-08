import {
	RequisitionListResponse,
	UpdateRequisitionPayload,
	UpdateRequisitionResponse,
} from "@/types/requisitions";

import axiosInstance from "./axiosClient";

export const getRequisition = async (
	customerNumber: string,
	status?: string,
): Promise<RequisitionListResponse> => {
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

export const updateRequisition = async (
	payload: UpdateRequisitionPayload,
): Promise<UpdateRequisitionResponse> => {
	try {
		const url = `/requisition/updateRequisition`;
		const response = await axiosInstance.put(url, payload);
		return response.data;
	} catch (error) {
		console.error("Error getting requisition:", error);
		throw error;
	}
};
