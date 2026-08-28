import { getUserDimensions } from "@/services/dimensions.service";
import { UserDimensionItem } from "@/types/dimensions.types";
import { useQuery } from "@tanstack/react-query";

export interface DimensionLevel {
	label: string;
	omni: boolean;
}

interface UseDimensionLabelsOptions {
	/** Fallback labels used when BE returns nothing or is still loading. */
	fallback: [string, string, string];
}

/**
 * Shared source of truth for the three invoice-dimension level configs.
 * Both the input component (invoice-dimensions.tsx) and the summary card
 * (StepConfirmation.tsx) read from here so the labels stay in sync.
 *
 * Backed by react-query so the underlying `/dimension/getUserDimension` call
 * only fires once per session.
 */
export function useDimensionLabels({
	fallback,
}: UseDimensionLabelsOptions): {
	isLoading: boolean;
	levels: [DimensionLevel, DimensionLevel, DimensionLevel];
} {
	const query = useQuery<UserDimensionItem[]>({
		queryKey: ["userDimensions"],
		queryFn: () => getUserDimensions(),
		staleTime: 1000 * 60 * 30,
	});

	const h = query.data?.[0]?.hierarchy;

	const levels: [DimensionLevel, DimensionLevel, DimensionLevel] = [
		{
			label: h?.dimension1?.label || fallback[0],
			omni: !!h?.dimension1?.mode,
		},
		{
			label: h?.dimension2?.label || fallback[1],
			omni: !!h?.dimension2?.mode,
		},
		{
			label: h?.dimension3?.label || fallback[2],
			omni: !!h?.dimension3?.mode,
		},
	];

	return {
		isLoading: query.isLoading,
		levels,
	};
}
