import { getHoseMedium } from "@/services/hose-configurator.service";
import { useQuery } from "@tanstack/react-query";

export const hoseMediumKeys = {
	all: ["hoseConfigurator", "hoseMedium"] as const,
};

export const useGetHoseMedium = (enabled = true) => {
	const { data, isLoading, isError, error, refetch } = useQuery({
		queryKey: hoseMediumKeys.all,
		queryFn: getHoseMedium,
		enabled,
		staleTime: 10 * 60 * 1000,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});

	return {
		mediums: data ?? [],
		isLoading,
		isError,
		error: error as Error | null,
		refetch,
	};
};
