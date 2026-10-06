import { getHoseDiameter } from "@/services/hose-configurator.service";
import type { HoseDiameterResponse } from "@/types/hose-configurator.types";
import { useQuery } from "@tanstack/react-query";

export const hoseDiameterKeys = {
	all: ["hoseConfigurator", "hoseDiameter"] as const,
};

export const useGetHoseDiameter = (enabled = true) => {
	const { data, isLoading, isError, error, refetch } = useQuery({
		queryKey: hoseDiameterKeys.all,
		queryFn: getHoseDiameter,
		enabled,
		staleTime: 10 * 60 * 1000,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});

	return {
		data: (data ?? null) as HoseDiameterResponse | null,
		diameters: data?.innerDiameterTomme ?? [],
		meta: data?.metaInnerDiameterTomme ?? null,
		isLoading,
		isError,
		error: error as Error | null,
		refetch,
	};
};
