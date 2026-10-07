import { getHosePressure } from "@/services/hose-configurator.service";
import type { HosePressureResponse } from "@/types/hose-configurator.types";
import { useQuery } from "@tanstack/react-query";

export const hosePressureKeys = {
	all: ["hoseConfigurator", "hosePressure"] as const,
};

export const useGetHosePressure = (enabled = true) => {
	const { data, isLoading, isError, error, refetch } = useQuery({
		queryKey: hosePressureKeys.all,
		queryFn: getHosePressure,
		enabled,
		staleTime: 30 * 60 * 1000,
		gcTime: 60 * 60 * 1000,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});

	return {
		data: (data ?? null) as HosePressureResponse | null,
		minPressure: data?.minPressure ?? null,
		maxPressure: data?.maxPressure ?? null,
		isLoading,
		isError,
		error: error as Error | null,
		refetch,
	};
};
