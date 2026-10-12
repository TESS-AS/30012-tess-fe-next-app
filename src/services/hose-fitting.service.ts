import type {
	HoseFittingAngle,
	HoseFittingGender,
	HoseFittingMaterial,
	HoseFittingRotationAngle,
	HoseFittingType,
} from "@/types/hose-fitting.types";

import axiosClient from "./axiosClient";

/** Fittingtype dropdown (Ende 1 / 2). */
export async function getTypeFitting(): Promise<HoseFittingType[]> {
	const response = await axiosClient.get<HoseFittingType[]>(
		"/hoseFitting/getTypeFitting",
	);
	return response.data;
}

/** Tilkobling dropdown (Female / Male). */
export async function getHoseGender(): Promise<HoseFittingGender[]> {
	const response = await axiosClient.get<HoseFittingGender[]>(
		"/hoseFitting/getHoseGender",
	);
	return response.data;
}

/** Utførelse dropdown (Rett, 45°, 90°, …). */
export async function getHoseAngle(): Promise<HoseFittingAngle[]> {
	const response = await axiosClient.get<HoseFittingAngle[]>(
		"/hoseFitting/getHoseAngle",
	);
	return response.data;
}

/** Materiale dropdown. */
export async function getHoseMaterial(): Promise<HoseFittingMaterial[]> {
	const response = await axiosClient.get<HoseFittingMaterial[]>(
		"/hoseFitting/getHoseMaterial",
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
