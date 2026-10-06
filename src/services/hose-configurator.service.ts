import type {
	HoseDiameterResponse,
	HoseMediumResponse,
	HosePressureResponse,
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

export function buildHoseSelectionPayload(
	input: HoseSelectionRequest,
): HoseSelectionRequest {
	const payload: HoseSelectionRequest = {};

	if (input.medium != null && input.medium !== "") {
		payload.medium = input.medium;
	}
	if (input.temperature != null && Number.isFinite(input.temperature)) {
		payload.temperature = input.temperature;
	}
	if (input.pressure != null && Number.isFinite(input.pressure)) {
		payload.pressure = input.pressure;
	}
	if (input.dimension != null && input.dimension !== "") {
		payload.dimension = input.dimension;
	}

	return payload;
}

export async function postHoseSelection(
	payload: HoseSelectionRequest,
): Promise<HoseSelectionResponse> {
	const response = await axiosClient.post<HoseSelectionResponse>(
		"/hoseConfigurator/hoseSelection",
		buildHoseSelectionPayload(payload),
	);
	return response.data;
}
