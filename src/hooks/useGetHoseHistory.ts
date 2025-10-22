import { useQuery } from "@tanstack/react-query";

import { getHoseHistory } from "../services/assets.service";

export const hoseHistoryKeys = {
	all: ["hoseHistory"] as const,
	detail: (hexagonId: string) => [...hoseHistoryKeys.all, hexagonId] as const,
};

export const useGetHoseHistory = (hexagonId: string) => {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: hoseHistoryKeys.detail(hexagonId),
		queryFn: async () => {
			try {
				const response = await getHoseHistory(hexagonId);
				return response;
			} catch (err: any) {
				const errorMessage =
					err?.response?.data?.message ||
					err?.message ||
					"Failed to load hose history";
				throw new Error(errorMessage);
			}
		},
		enabled: !!hexagonId,
		staleTime: 5 * 60 * 1000,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});

	return {
		hoseHistory: data ?? [],
		isLoading,
		error: error as Error | null,
		setHoseHistory: () => {},
		refetch,
	};
};
