import { useEffect, useState } from "react";

import axiosClient from "@/services/axiosClient";

interface Warehouse {
	id: string;
	name: string;
}

export function useGetWarehouses(shouldFetch: boolean) {
	const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<unknown>(null);

	useEffect(() => {
		if (!shouldFetch) return;

		const fetchWarehouses = async () => {
			try {
				setIsLoading(true);
				const response = await axiosClient.get("/warehouse");
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
		};

		fetchWarehouses();
	}, [shouldFetch]);

	return { warehouses, isLoading, error };
}
