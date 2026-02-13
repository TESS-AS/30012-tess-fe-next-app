import {
	GetAssetsResponse,
	GetHoseHistory,
	S1Codes,
} from "@/types/assets.types";

import axiosClient from "./axiosClient";

interface S1CodesResponse {
	data: S1Codes[];
	meta: {
		page: number;
		pageSize: number;
		total: number;
		totalPages: number;
	};
}

export type InspectionSummaryType = "completed" | "upcoming";

export interface InspectionSummaryItem {
	month: string;
	year: string;
	inspectionCount: number;
}

export interface InspectionSummaryResponse {
	data: InspectionSummaryItem[];
}

export const getInspectionSummary = async (
	type: InspectionSummaryType,
	opts?: {
		s1Code?: string;
		customerNumber?: string;
		yearOffset?: number; // -2..+2
	},
): Promise<InspectionSummaryResponse> => {
	try {
		const params = new URLSearchParams();
		if (opts?.s1Code) params.append("s1Code", opts.s1Code);
		if (opts?.customerNumber)
			params.append("customerNumber", opts.customerNumber);
		if (typeof opts?.yearOffset === "number") {
			params.append("yearOffset", String(opts.yearOffset));
		}

		const res = await axiosClient.get(
			`/asset/inspectionSummary/${type}?${params.toString()}`,
		);
		return res.data ?? { data: [] };
	} catch (error) {
		return { data: [] };
	}
};

export interface PaginatedResponse<T> {
	data: T[];
	meta: {
		page: number;
		pageSize: number;
		totalItems: number;
		totalPages: number;
	};
}

export const getAssets = async (
	customerNumber?: string,
	s1Code?: string,
	page: number = 1,
	pageSize: number = 10,
	ageRange?: string,
	approved?: string,
	overdue?: string,
	replacementDue?: string,
	spareSet?: string,
	rejected?: string,
): Promise<PaginatedResponse<GetAssetsResponse>> => {
	try {
		const params = new URLSearchParams();
		if (customerNumber) params.append("customerNumber", customerNumber);
		// if (s1Code) params.append("s1Code", s1Code);
		params.append("s1Code", "1391731"); // TODO: Remove this

		params.append("page", page.toString());
		params.append("pageSize", pageSize.toString());
		params.append("ageRange", ageRange || "");
		params.append("approved", approved || "");
		params.append("overdue", overdue || "");
		params.append("replacementDue", replacementDue || "");
		params.append("spareSet", spareSet || "");
		params.append("rejected", rejected || "");

		const response = await axiosClient.get(
			`/asset/getHose?${params.toString()}`,
		);
		return response.data;
	} catch (error) {
		return {
			data: [],
			meta: { page: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
		};
	}
};

export const getS1Codes = async (
	page: number = 1,
	pageSize: number = 100,
	s2?: boolean,
): Promise<S1CodesResponse> => {
	const url = `/asset/getS1?page=${page}&pageSize=${pageSize}&s2=${s2}`;
	try {
		const response = await axiosClient.get(url);
		return (
			response.data || {
				data: [],
				meta: { page: 1, pageSize, total: 0, totalPages: 0 },
			}
		);
	} catch (error) {
		return { data: [], meta: { page: 1, pageSize, total: 0, totalPages: 0 } };
	}
};

export const searchAssets = async (
	search: string,
	customerNumber?: string,
	s1Code?: string,
	page: number = 1,
	pageSize: number = 10,
	ageRange?: string,
	approved?: string,
	overdue?: string,
	replacementDue?: string,
	spareSet?: string,
	rejected?: string,
): Promise<PaginatedResponse<GetAssetsResponse>> => {
	try {
		const params = new URLSearchParams();
		if (customerNumber) params.append("customerNumber", customerNumber);
		if (s1Code) params.append("s1Code", s1Code);
		params.append("page", page.toString());
		params.append("pageSize", pageSize.toString());
		params.append("ageRange", ageRange || "");
		params.append("approved", approved || "");
		params.append("overdue", overdue || "");
		params.append("replacementDue", replacementDue || "");
		params.append("spareSet", spareSet || "");
		params.append("rejected", rejected || "");

		const response = await axiosClient.get(
			`/searchHose/${search}?${params.toString()}`,
		);
		return response.data;
	} catch (error) {
		return {
			data: [],
			meta: { page, pageSize, totalItems: 0, totalPages: 0 },
		};
	}
};

export const getHoseInspection = async ({
	customerNumber,
	s1Code,
	approved,
	rejected,
	overdue,
	replacementDue,
	upcomingInspection,
	upcomingReplacement,
	page = 1,
	pageSize = 1000,
}: {
	customerNumber?: string;
	s1Code?: string;
	approved?: string;
	rejected?: string;
	overdue?: string;
	replacementDue?: string;
	upcomingInspection?: string;
	upcomingReplacement?: string;
	page?: number;
	pageSize?: number;
} = {}): Promise<PaginatedResponse<GetAssetsResponse>> => {
	try {
		const params = new URLSearchParams();
		if (customerNumber) params.append("customerNumber", customerNumber);
		if (s1Code) params.append("s1Code", s1Code);
		params.append("page", page.toString());
		params.append("pageSize", pageSize.toString());
		params.append("approved", approved || "");
		params.append("rejected", rejected || "");
		params.append("overdue", overdue || "");
		params.append("replacementDue", replacementDue || "");
		params.append("upcomingInspection", upcomingInspection || "");
		params.append("upcomingReplacement", upcomingReplacement || "");

		const response = await axiosClient.get(
			`/asset/getHoseInspection?${params.toString()}`,
		);

		return response.data;
	} catch (error) {
		return {
			data: [],
			meta: { page, pageSize, totalItems: 0, totalPages: 0 },
		};
	}
};

export const getHoseHistory = async (
	hexagonId: string,
): Promise<GetHoseHistory> => {
	const response = await axiosClient.get(`/asset/getHoseHistory`, {
		params: { hexagonId },
	});
	return response.data;
};
