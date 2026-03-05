import { getAssets } from "@/services/assets.service";
import type { GetAssetsResponse } from "@/types/assets.types";
import { useQuery } from "@tanstack/react-query";

export const hoseDetailsKeys = {
	all: ["hoseDetails"] as const,
	detail: (hexagonId: string, customerNumber?: string) =>
		[...hoseDetailsKeys.all, hexagonId, customerNumber] as const,
};

export const useGetHoseDetails = (
	hexagonId: string,
	customerNumber?: string,
) => {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: hoseDetailsKeys.detail(hexagonId, customerNumber),
		queryFn: async () => {
			try {
				// Search for the specific hose by hexagonId
				const response = await getAssets(
					customerNumber,
					undefined, // s1Code
					1, // page
					1, // pageSize - we only need one result
					undefined, // ageRange
					undefined, // approved
					undefined, // overdue
					undefined, // replacementDue
					undefined, // spareSet
					undefined, // rejected
					undefined, // searchTerm
					hexagonId, // hexagonId
				);

				if (response?.data && response.data.length > 0) {
					return response.data[0];
				}

				return null;
			} catch (err: any) {
				const errorMessage =
					err?.response?.data?.message ||
					err?.message ||
					"Failed to load hose details";
				throw new Error(errorMessage);
			}
		},
		enabled: !!hexagonId && !!customerNumber,
		staleTime: 5 * 60 * 1000,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});

	return {
		hoseDetails: data as GetAssetsResponse | null,
		isLoading,
		error: error as Error | null,
		refetch,
	};
};
