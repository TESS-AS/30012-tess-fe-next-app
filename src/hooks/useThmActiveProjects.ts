import { getThmActiveProjects } from "@/services/thm-projects.service";
import type { ThmWorkOrderListParams } from "@/types/thm-projects.types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const thmActiveProjectsKeys = {
	all: ["thm", "active-projects"] as const,
	list: (params: ThmWorkOrderListParams) =>
		[...thmActiveProjectsKeys.all, params] as const,
};

export function useThmActiveProjects(params: ThmWorkOrderListParams) {
	return useQuery({
		queryKey: thmActiveProjectsKeys.list(params),
		queryFn: () => getThmActiveProjects(params),
		placeholderData: keepPreviousData,
		staleTime: 30 * 1000,
	});
}
