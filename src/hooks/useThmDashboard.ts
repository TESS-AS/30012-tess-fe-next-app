import { getThmDashboard } from "@/services/thm-projects.service";
import type { ThmDashboardParams } from "@/types/thm-projects.types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const thmDashboardKeys = {
	all: ["thm", "dashboard"] as const,
	detail: (params: ThmDashboardParams) =>
		[...thmDashboardKeys.all, params] as const,
};

export function useThmDashboard(params: ThmDashboardParams | null) {
	return useQuery({
		queryKey: params
			? thmDashboardKeys.detail(params)
			: [...thmDashboardKeys.all, "noop"],
		queryFn: () => getThmDashboard(params as ThmDashboardParams),
		enabled: !!params?.workOrderNumber,
		placeholderData: keepPreviousData,
		staleTime: 60 * 1000,
	});
}
