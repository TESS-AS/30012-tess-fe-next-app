import { getThmWorkOrderHoses } from "@/services/thm-projects.service";
import type { ThmWorkOrderListViewParams } from "@/types/thm-projects.types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const thmWorkOrderHoseKeys = {
	all: ["thm", "workOrderHoses"] as const,
	list: (params: ThmWorkOrderListViewParams) =>
		[...thmWorkOrderHoseKeys.all, params] as const,
};

export function useThmWorkOrderHoses(params: ThmWorkOrderListViewParams | null) {
	return useQuery({
		queryKey: params
			? thmWorkOrderHoseKeys.list(params)
			: [...thmWorkOrderHoseKeys.all, "noop"],
		queryFn: () => getThmWorkOrderHoses(params as ThmWorkOrderListViewParams),
		enabled: !!params?.workOrderNumber,
		placeholderData: keepPreviousData,
		staleTime: 60 * 1000,
	});
}
