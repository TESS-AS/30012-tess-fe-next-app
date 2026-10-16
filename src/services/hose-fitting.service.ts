import type {
	HoseFittingAngle,
	HoseFittingGender,
	HoseFittingMaterial,
	HoseFittingRotationAngle,
	HoseFittingType,
} from "@/types/hose-fitting.types";

import axiosClient from "./axiosClient";

function ecomQuery(ecom: boolean) {
	return ecom ? { params: { ecom: true } } : undefined;
}

/** Fittingtype dropdown (Ende 1 / 2). */
export async function getTypeFitting(ecom = false): Promise<HoseFittingType[]> {
	const response = await axiosClient.get<HoseFittingType[]>(
		"/hoseFitting/getTypeFitting",
		ecomQuery(ecom),
	);
	return response.data;
}

/** Tilkobling dropdown (Female / Male). */
export async function getHoseGender(ecom = false): Promise<HoseFittingGender[]> {
	const response = await axiosClient.get<HoseFittingGender[]>(
		"/hoseFitting/getHoseGender",
		ecomQuery(ecom),
	);
	return response.data;
}

/** Utførelse dropdown (Rett, 45°, 90°, …). */
export async function getHoseAngle(ecom = false): Promise<HoseFittingAngle[]> {
	const response = await axiosClient.get<HoseFittingAngle[]>(
		"/hoseFitting/getHoseAngle",
		ecomQuery(ecom),
	);
	return response.data;
}

/** Materiale dropdown. */
export async function getHoseMaterial(
	ecom = false,
): Promise<HoseFittingMaterial[]> {
	const response = await axiosClient.get<HoseFittingMaterial[]>(
		"/hoseFitting/getHoseMaterial",
		ecomQuery(ecom),
	);
	return response.data;
}

/** Velg ende rotation cards (0°, 90°, 180°, 270°, …). */
export async function getHoseRotationAngle(): Promise<HoseFittingRotationAngle[]> {
	const response = await axiosClient.get<HoseFittingRotationAngle[]>(
		"/hoseFitting/getHoseRotationAngle",
	);
	return response.data;
}
