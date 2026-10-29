import { useMemo } from "react";

import {
	getHoseAngle,
	getHoseGender,
	getHoseMaterial,
	getHoseRotationAngle,
	getTypeFitting,
} from "@/services/hose-fitting.service";
import type { SelectOption } from "@/types/hose-fitting.types";
import { useQueries } from "@tanstack/react-query";

export const hoseFittingKeys = {
	all: ["hoseFitting"] as const,
	typeFitting: (ecom = false) =>
		[...hoseFittingKeys.all, "typeFitting", ecom] as const,
	gender: (ecom = false) => [...hoseFittingKeys.all, "gender", ecom] as const,
	angle: (ecom = false) => [...hoseFittingKeys.all, "angle", ecom] as const,
	material: (ecom = false) =>
		[...hoseFittingKeys.all, "material", ecom] as const,
	rotationAngle: () => [...hoseFittingKeys.all, "rotationAngle"] as const,
};

function bySortOrder<T extends { sortOrder?: number }>(a: T, b: T) {
	return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
}

/**
 * ecom lookups return a string array ("BSP", "Female", "90°").
 * Older responses are objects with an id and a name. Both become select options.
 */
function toSelectOptions(
	items: readonly unknown[] | undefined,
	labelKey: string,
	idKey: string,
	sort: boolean,
): SelectOption[] {
	const list = [...(items ?? [])];
	const objects = list.filter(
		(item): item is { sortOrder?: number } =>
			typeof item === "object" && item != null,
	);
	if (sort && objects.length === list.length) {
		objects.sort(bySortOrder);
	}
	const source = sort && objects.length === list.length ? objects : list;

	return source.flatMap((item) => {
		if (typeof item === "string") {
			const label = item.trim();
			return label ? [{ value: label, label }] : [];
		}
		if (typeof item !== "object" || item == null) return [];
		const record = item as Record<string, unknown>;
		const rawLabel = record[labelKey];
		const label = typeof rawLabel === "string" ? rawLabel.trim() : "";
		if (!label) return [];
		const rawId = record[idKey];
		const value =
			rawId != null && String(rawId).trim() !== "" ? String(rawId) : label;
		return [{ value, label }];
	});
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
				queryKey: hoseFittingKeys.typeFitting(true),
				queryFn: () => getTypeFitting(true),
				enabled,
				staleTime: 30 * 60 * 1000,
				gcTime: 60 * 60 * 1000,
				refetchOnMount: false,
				refetchOnWindowFocus: false,
			},
			{
				queryKey: hoseFittingKeys.gender(true),
				queryFn: () => getHoseGender(true),
				enabled,
				staleTime: 30 * 60 * 1000,
				gcTime: 60 * 60 * 1000,
				refetchOnMount: false,
				refetchOnWindowFocus: false,
			},
			{
				queryKey: hoseFittingKeys.angle(true),
				queryFn: () => getHoseAngle(true),
				enabled,
				staleTime: 30 * 60 * 1000,
				gcTime: 60 * 60 * 1000,
				refetchOnMount: false,
				refetchOnWindowFocus: false,
			},
			{
				queryKey: hoseFittingKeys.material(true),
				queryFn: () => getHoseMaterial(true),
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

	const fittingTypeOptions = useMemo(
		() =>
			toSelectOptions(
				typeFittingQuery.data,
				"typeFittingName",
				"typeFittingId",
				false,
			),
		[typeFittingQuery.data],
	);

	const connectionOptions = useMemo(
		() => toSelectOptions(genderQuery.data, "genderName", "genderId", true),
		[genderQuery.data],
	);

	const designOptions = useMemo(
		() => toSelectOptions(angleQuery.data, "angleName", "angleId", true),
		[angleQuery.data],
	);

	const materialOptions = useMemo(
		() =>
			toSelectOptions(materialQuery.data, "materialType", "materialId", true),
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
