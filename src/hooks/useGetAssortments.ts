import { useCallback, useEffect, useState } from "react";

import axiosClient from "@/services/axiosClient";

export function useGetAssortments(shouldFetch: boolean, companyNumber?: string | number) {
	const [assortments, setAssortments] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<unknown>(null);

	const fetchAssortments = useCallback(async () => {
		if (!shouldFetch) return;

		try {
			setIsLoading(true);
			const params = companyNumber ? { companyNumber: String(companyNumber) } : {};
			const response = await axiosClient.get("/assortment", { params });
			setAssortments(response.data ?? []);
		} catch (err) {
			setError(err);
		} finally {
			setIsLoading(false);
		}
	}, [shouldFetch, companyNumber]);

	useEffect(() => {
		fetchAssortments();
	}, [fetchAssortments]);

	return { assortments, isLoading, error, refetch: fetchAssortments };
}
