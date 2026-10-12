import { getHoseTemperature } from "@/services/hose-configurator.service";
import type { HoseTemperatureResponse } from "@/types/hose-configurator.types";
import { useQuery } from "@tanstack/react-query";

export const hoseTemperatureKeys = {
	all: ["hoseConfigurator", "hoseTemperature"] as const,
};

export const useGetHoseTemperature = (enabled = true) => {
	const { data, isLoading, isError, error, refetch } = useQuery({
		queryKey: hoseTemperatureKeys.all,
		queryFn: getHoseTemperature,
		enabled,
		staleTime: 30 * 60 * 1000,
		gcTime: 60 * 60 * 1000,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});

	return {
		data: (data ?? null) as HoseTemperatureResponse | null,
		minTemperature: data?.minTemperature ?? null,
		maxTemperature: data?.maxTemperature ?? null,
		isLoading,
		isError,
		error: error as Error | null,
		refetch,
	};
};
