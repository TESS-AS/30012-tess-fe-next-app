import type {
	HoseAssemblyRequest,
	HoseAssemblyResponse,
	HoseDiameterResponse,
	HoseMediumResponse,
	HosePressureResponse,
	HoseSelectionItem,
	HoseSelectionPage,
	HoseSelectionRequest,
	HoseSelectionResponse,
	HoseTemperatureResponse,
} from "@/types/hose-configurator.types";

import axiosClient from "./axiosClient";

export async function getHoseDiameter(): Promise<HoseDiameterResponse> {
	const response = await axiosClient.get<HoseDiameterResponse>(
		"/hoseConfigurator/getHoseDiameter",
	);
	return response.data;
}

export async function getHoseMedium(): Promise<HoseMediumResponse> {
	const response = await axiosClient.get<HoseMediumResponse>(
		"/hoseConfigurator/getHoseMedium",
	);
	return response.data;
}

export async function getHosePressure(): Promise<HosePressureResponse> {
	const response = await axiosClient.get<HosePressureResponse>(
		"/hoseConfigurator/getHosePressure",
	);
	return response.data;
}

export async function getHoseTemperature(): Promise<HoseTemperatureResponse> {
	const response = await axiosClient.get<HoseTemperatureResponse>(
		"/hoseConfigurator/getHoseTemperature",
	);
	return response.data;
}

export const HOSE_SELECTION_PAGE_SIZE = 10;

function isHoseSelectionItem(value: unknown): value is HoseSelectionItem {
	return (
		!!value &&
		typeof value === "object" &&
		"itemNumber" in value &&
		typeof (value as HoseSelectionItem).itemNumber === "string"
	);
}

export function parseHoseSelectionResponse(
	data: HoseSelectionResponse,
	page: number,
	pageSize: number,
): HoseSelectionPage {
	if (Array.isArray(data)) {
		return {
			items: data.filter(isHoseSelectionItem),
			page,
			pageSize,
			totalCount: null,
		};
	}

	const list =
		data.items ??
		data.data ??
		data.results ??
		data.hoses ??
		data.products ??
		[];
	const totalRaw =
		data.totalCount ?? data.total ?? data.totalItems ?? data.count;

	return {
		items: list.filter(isHoseSelectionItem),
		page,
		pageSize,
		totalCount: typeof totalRaw === "number" ? totalRaw : null,
	};
}

export function hoseSelectionHasMore(result: HoseSelectionPage): boolean {
	if (result.totalCount != null) {
		return result.page * result.pageSize < result.totalCount;
	}
	return result.items.length === result.pageSize;
}

export function buildHoseSelectionPayload(
	input: HoseSelectionRequest,
): HoseSelectionRequest {
	const { temperature } = input;
	const [temperatureFrom, temperatureTo] = temperature ?? [];
	const normalizedTemperature =
		temperatureFrom != null &&
		temperatureTo != null &&
		Number.isFinite(temperatureFrom) &&
		Number.isFinite(temperatureTo)
			? ([
					Math.min(temperatureFrom, temperatureTo),
					Math.max(temperatureFrom, temperatureTo),
				] as [number, number])
			: null;

	return {
		medium: input.medium?.trim() ? input.medium.trim() : null,
		temperature: normalizedTemperature,
		pressure:
			input.pressure != null && Number.isFinite(input.pressure)
				? input.pressure
				: null,
		dimension: input.dimension?.trim() ? input.dimension.trim() : null,
	};
}

export async function postHoseSelection(
	payload: HoseSelectionRequest,
	page = 1,
	pageSize = HOSE_SELECTION_PAGE_SIZE,
): Promise<HoseSelectionPage> {
	const response = await axiosClient.post<HoseSelectionResponse>(
		"/hoseConfigurator/hoseSelection",
		buildHoseSelectionPayload(payload),
		{ params: { page, pageSize } },
	);
	return parseHoseSelectionResponse(response.data, page, pageSize);
}

export async function postHoseAssembly(
	payload: HoseAssemblyRequest,
): Promise<HoseAssemblyResponse> {
	const response = await axiosClient.post<HoseAssemblyResponse>(
		"/hoseConfigurator/hoseAssemblyConfigurator",
		payload,
	);
	return response.data;
}
