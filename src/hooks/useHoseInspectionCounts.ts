import { useEffect, useMemo, useState } from "react";

import { usePunchoutProfile } from "@/hooks/usePunchoutProfile";
import { getHoseInspection } from "@/services/assets.service";

export type HoseInspectionCounts = {
	approved: number;
	rejected: number;
	overdue: number;
	replacementDue: number;
	upcomingInspection: number;
	upcomingReplacement: number;
};

export function useHoseInspectionCounts(
	s1Code?: string,
	customerNumberOverride?: string,
) {
	const { data: profile } = usePunchoutProfile();
	const [counts, setCounts] = useState<HoseInspectionCounts>({
		approved: 0,
		rejected: 0,
		overdue: 0,
		replacementDue: 0,
		upcomingInspection: 0,
		upcomingReplacement: 0,
	});
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<unknown>(null);

	const customerNumber = useMemo(
		() => customerNumberOverride || profile?.defaultCustomerNumber,
		[customerNumberOverride, profile?.defaultCustomerNumber],
	);
	const userId = profile?.userId ? String(profile.userId) : undefined;

	const fetchCounts = async () => {
		if (!userId) return;
		setLoading(true);
		setError(null);
		try {
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

			setCounts({
				rejected: rejectedRes?.data?.length ?? 0,
				approved: approvedRes?.data?.length ?? 0,
				overdue: overdueRes?.data?.length ?? 0,
				replacementDue: replacementDueRes?.data?.length ?? 0,
				upcomingInspection: upcomingInspectionRes?.data?.length ?? 0,
				upcomingReplacement: upcomingReplacementRes?.data?.length ?? 0,
			});
		} catch (err) {
			setError(err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!userId) return;
		fetchCounts();
	}, [userId, customerNumber, s1Code]);

	return { counts, loading, error, refresh: fetchCounts };
}
