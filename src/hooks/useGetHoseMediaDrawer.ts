import { getHoseMediaDrawer } from "@/services/assets.service";
import type { HoseMediaDrawerResponse } from "@/types/assets.types";
import { useQuery } from "@tanstack/react-query";

export const hoseMediaDrawerKeys = {
	all: ["hoseMediaDrawer"] as const,
	detail: (hexagonId: string) =>
		[...hoseMediaDrawerKeys.all, hexagonId] as const,
};

export const useGetHoseMediaDrawer = (
	hexagonId: string | null,
	enabled: boolean,
) => {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: hoseMediaDrawerKeys.detail(hexagonId ?? ""),
		queryFn: () => getHoseMediaDrawer(hexagonId as string),
		enabled: !!hexagonId && enabled,
		staleTime: 5 * 60 * 1000,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});

	return {
		data: (data ?? null) as HoseMediaDrawerResponse | null,
		isLoading,
		error: error as Error | null,
		refetch,
	};
};
