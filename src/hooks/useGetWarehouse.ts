import { useCallback, useEffect, useState } from "react";

import axiosClient from "@/services/axiosClient";

interface Warehouse {
	id: string;
	name: string;
}

export function useGetWarehouses(shouldFetch: boolean, companyNumber?: string | number) {
	const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<unknown>(null);

	const fetchWarehouses = useCallback(async () => {
		if (!shouldFetch) return;

		try {
			setIsLoading(true);
			const params = companyNumber ? { companyNumber: String(companyNumber) } : {};
			const response = await axiosClient.get("/warehouse", { params });
			setWarehouses(
				response.data.map((w: any) => ({
					id: w.warehousenumber,
					name: w.warehousename,
				})),
			);
		} catch (err) {
			setError(err);
		} finally {
			setIsLoading(false);
		}
	}, [shouldFetch, companyNumber]);

	useEffect(() => {
		fetchWarehouses();
	}, [fetchWarehouses]);

	return { warehouses, isLoading, error, refetch: fetchWarehouses };
}
