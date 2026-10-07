import {
	getHoseAngle,
	getHoseGender,
	getHoseMaterial,
	getHoseRotationAngle,
	getTypeFitting,
} from "@/services/hose-fitting.service";
import type { SelectOption } from "@/types/hose-fitting.types";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

export const hoseFittingKeys = {
	all: ["hoseFitting"] as const,
	typeFitting: () => [...hoseFittingKeys.all, "typeFitting"] as const,
	gender: () => [...hoseFittingKeys.all, "gender"] as const,
	angle: () => [...hoseFittingKeys.all, "angle"] as const,
	material: () => [...hoseFittingKeys.all, "material"] as const,
	rotationAngle: () => [...hoseFittingKeys.all, "rotationAngle"] as const,
};

function bySortOrder<T extends { sortOrder?: number }>(a: T, b: T) {
	return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
}

/** "Velg ende" cards — only these four orientations are shown in the UI. */
const ALLOWED_ROTATION_DEGREES = ["0", "90", "180", "270"] as const;

/**
 * Lookup lists for step 2 "Spesifiser ende 1 og 2" + "Velg ende".
 * Service layer owns the HTTP; this hook owns caching/loading for the UI.
 */
export function useHoseFittingOptions(enabled = true) {
	const results = useQueries({
		queries: [
			{
				queryKey: hoseFittingKeys.typeFitting(),
				queryFn: getTypeFitting,
				enabled,
				staleTime: 30 * 60 * 1000,
				gcTime: 60 * 60 * 1000,
				refetchOnMount: false,
				refetchOnWindowFocus: false,
			},
			{
				queryKey: hoseFittingKeys.gender(),
				queryFn: getHoseGender,
				enabled,
				staleTime: 30 * 60 * 1000,
				gcTime: 60 * 60 * 1000,
				refetchOnMount: false,
				refetchOnWindowFocus: false,
			},
			{
				queryKey: hoseFittingKeys.angle(),
				queryFn: getHoseAngle,
				enabled,
				staleTime: 30 * 60 * 1000,
				gcTime: 60 * 60 * 1000,
				refetchOnMount: false,
				refetchOnWindowFocus: false,
			},
			{
				queryKey: hoseFittingKeys.material(),
				queryFn: getHoseMaterial,
				enabled,
				staleTime: 30 * 60 * 1000,
				gcTime: 60 * 60 * 1000,
				refetchOnMount: false,
				refetchOnWindowFocus: false,
			},
			{
				queryKey: hoseFittingKeys.rotationAngle(),
				queryFn: getHoseRotationAngle,
				enabled,
				staleTime: 30 * 60 * 1000,
				gcTime: 60 * 60 * 1000,
				refetchOnMount: false,
				refetchOnWindowFocus: false,
			},
		],
	});

	const [
		typeFittingQuery,
		genderQuery,
		angleQuery,
		materialQuery,
		rotationQuery,
	] = results;

	const fittingTypeOptions = useMemo<SelectOption[]>(
		() =>
			(typeFittingQuery.data ?? []).map((item) => ({
				value: String(item.typeFittingId),
				label: item.typeFittingName,
			})),
		[typeFittingQuery.data],
	);

	const connectionOptions = useMemo<SelectOption[]>(
		() =>
			[...(genderQuery.data ?? [])]
				.sort(bySortOrder)
				.map((item) => ({
					value: String(item.genderId),
					label: item.genderName,
				})),
		[genderQuery.data],
	);

	const designOptions = useMemo<SelectOption[]>(
		() =>
			[...(angleQuery.data ?? [])]
				.sort(bySortOrder)
				.map((item) => ({
					value: String(item.angleId),
					label: item.angleName,
				})),
		[angleQuery.data],
	);

	const materialOptions = useMemo<SelectOption[]>(
		() =>
			[...(materialQuery.data ?? [])]
				.sort(bySortOrder)
				.map((item) => ({
					value: String(item.materialId),
					label: item.materialType,
				})),
		[materialQuery.data],
	);

	const rotationAngles = useMemo(() => {
		const mapped = (rotationQuery.data ?? []).map((item) => {
			const degrees =
				item.rotationAngleName.replace(/[^\d]/g, "") ||
				String(item.rotationAngleId);
			return {
				value: String(item.rotationAngleId),
				label: item.rotationAngleName,
				degrees,
				sortOrder: item.sortOrder,
			};
		});

		return ALLOWED_ROTATION_DEGREES.map((degrees) =>
			mapped.find((item) => item.degrees === degrees),
		).filter((item): item is NonNullable<typeof item> => item != null);
	}, [rotationQuery.data]);


	const isLoading = results.some((query) => query.isLoading);
	const isError = results.some((query) => query.isError);

	return {
		fittingTypeOptions,
		connectionOptions,
		designOptions,
		materialOptions,
		rotationAngles,
		isLoading,
		isError,
	};
}
