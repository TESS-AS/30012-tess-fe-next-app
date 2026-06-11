import {
	CreateRequisitionPayload,
	CreateRequisitionResponse,
	RequisitionListResponse,
	UpdateRequisitionPayload,
	UpdateRequisitionResponse,
} from "@/types/requisitions";

import axiosInstance from "./axiosClient";

export const getRequisition = async (
	customerNumber: string,
	status?: string,
	page = 1,
	pageSize = 20,
	search?: string,
): Promise<RequisitionListResponse> => {
	try {
		const url = `/requisition/getRequisition/${customerNumber}`;
		const params: Record<string, string | number> = { page, pageSize };
		if (status) params.status = status;
		if (search?.trim()) params.search = search.trim();
		const response = await axiosInstance.get(url, { params });
		return response.data;
	} catch (error) {
		console.error("Error getting requisition:", error);
		throw error;
	}
};

export const createRequisition = async (
	payload: CreateRequisitionPayload,
): Promise<CreateRequisitionResponse> => {
	try {
		const url = `/requisition/createRequisition`;
		const response = await axiosInstance.post(url, payload);
		return response.data;
	} catch (error) {
		console.error("Error creating requisition:", error);
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
