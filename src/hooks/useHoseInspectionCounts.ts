import { useMemo } from "react";

import { usePunchoutProfile } from "@/hooks/usePunchoutProfile";
import { getHoseInspection } from "@/services/assets.service";
import { useQuery } from "@tanstack/react-query";

export type HoseInspectionCounts = {
	approved: number;
	rejected: number;
	overdue: number;
	replacementDue: number;
	upcomingInspection: number;
	upcomingReplacement: number;
};

export const hoseInspectionKeys = {
	all: ["hoseInspection"] as const,
	counts: (params: {
		customerNumber?: string;
		s1Code?: string;
		userId?: string;
	}) => [...hoseInspectionKeys.all, "counts", params] as const,
};

export function useHoseInspectionCounts(
	s1Code?: string,
	customerNumberOverride?: string,
) {
	const { data: profile } = usePunchoutProfile();

	const customerNumber = useMemo(
		() => customerNumberOverride || profile?.defaultCustomerNumber,
		[customerNumberOverride, profile?.defaultCustomerNumber],
	);
	const userId = profile?.userId ? String(profile.userId) : undefined;

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: hoseInspectionKeys.counts({ customerNumber, s1Code, userId }),
		queryFn: async () => {
			const common = {
				customerNumber,
				s1Code,
				page: 1,
				pageSize: 1000,
			} as const;

			const [
				rejectedRes,
				approvedRes,
				overdueRes,
				replacementDueRes,
				upcomingInspectionRes,
				upcomingReplacementRes,
			] = await Promise.all([
				getHoseInspection({ ...common, rejected: "true" }),
				getHoseInspection({ ...common, approved: "true" }),
				getHoseInspection({ ...common, overdue: "true" }),
				getHoseInspection({ ...common, replacementDue: "true" }),
				getHoseInspection({ ...common, upcomingInspection: "true" }),
				getHoseInspection({ ...common, upcomingReplacement: "true" }),
			]);

			return {
				rejected: rejectedRes?.data?.length ?? 0,
				approved: approvedRes?.data?.length ?? 0,
				overdue: overdueRes?.data?.length ?? 0,
				replacementDue: replacementDueRes?.data?.length ?? 0,
				upcomingInspection: upcomingInspectionRes?.data?.length ?? 0,
				upcomingReplacement: upcomingReplacementRes?.data?.length ?? 0,
			};
		},
		enabled: !!userId,
		staleTime: 2 * 60 * 1000,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});

	const counts: HoseInspectionCounts = data ?? {
		approved: 0,
		rejected: 0,
		overdue: 0,
		replacementDue: 0,
		upcomingInspection: 0,
		upcomingReplacement: 0,
	};

	return { counts, loading: isLoading, error, refresh: refetch };
}
