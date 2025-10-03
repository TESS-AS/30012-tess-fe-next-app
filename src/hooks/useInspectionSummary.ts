import { useEffect, useMemo, useState } from "react";

import {
	getInspectionSummary,
	type InspectionSummaryItem,
	type InspectionSummaryResponse,
	type InspectionSummaryType,
} from "@/services/assets.service";

export type UIInspectionType = "completed" | "planned";

export interface UseInspectionSummaryOptions {
	type: UIInspectionType;
	s1Code?: string;
	customerNumber?: string;
	yearOffset?: number; // -2, -1, 0, +1, +2
}

export interface UseInspectionSummaryResult {
	data: InspectionSummaryItem[];
	loading: boolean;
	error?: unknown;
	lastMonths: InspectionSummaryItem[];
	totalCount: number;
	series: {
		month: string;
		year: string;
		inspectionCount: number;
		monthIndex: number;
		percentage: number;
	}[];
	maxCount: number;
}

export function useInspectionSummary(
	options: UseInspectionSummaryOptions,
): UseInspectionSummaryResult {
	const { type, s1Code, customerNumber, yearOffset = 0 } = options;

	const apiType: InspectionSummaryType =
		type === "planned" ? "upcoming" : "completed";

	const [data, setData] = useState<InspectionSummaryItem[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<unknown>();

	useEffect(() => {
		let active = true;
		setLoading(true);
		setError(undefined);

		getInspectionSummary(apiType, { s1Code, customerNumber, yearOffset })
			.then((res: InspectionSummaryResponse) => {
				if (!active) return;
				setData(Array.isArray(res?.data) ? res.data : []);
			})
			.catch((err) => {
				if (!active) return;
				setError(err);
				setData([]);
			})
			.finally(() => {
				if (!active) return;
				setLoading(false);
			});

		return () => {
			active = false;
		};
	}, [apiType, s1Code, customerNumber, yearOffset]);

	const monthOrder = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	const pickedMonths = useMemo(() => {
		if (!data?.length) return [];
		return [...data].sort(
			(a, b) =>
				Number(a.year) - Number(b.year) ||
				monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month),
		);
	}, [data]);

	const totalCount = useMemo(
		() =>
			(pickedMonths || []).reduce(
				(sum, m) => sum + (m.inspectionCount || 0),
				0,
			),
		[pickedMonths],
	);

	const maxCount = useMemo(
		() =>
			(pickedMonths || []).reduce(
				(max, m) => Math.max(max, m.inspectionCount || 0),
				0,
			),
		[pickedMonths],
	);

	const series = useMemo(() => {
		const arr = (pickedMonths || []).map((m) => {
			const monthIndex = monthOrder.indexOf(m.month);
			const percentage = maxCount > 0 ? m.inspectionCount / maxCount : 0;
			return { ...m, monthIndex, percentage };
		});
		return arr.sort(
			(a, b) => Number(a.year) - Number(b.year) || a.monthIndex - b.monthIndex,
		);
	}, [pickedMonths, maxCount]);

	return {
		data,
		loading,
		error,
		lastMonths: pickedMonths,
		totalCount,
		series,
		maxCount,
	};
}
