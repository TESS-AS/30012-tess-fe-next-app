import { useCallback, useEffect, useState } from "react";

import axiosClient from "@/services/axiosClient";

interface Customer {
	customerNumber: string;
	customerName: string;
}

export function useGetCustomers(shouldFetch: boolean, companyNumber?: string | number) {
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<unknown>(null);

	const fetchCustomers = useCallback(async () => {
		if (!shouldFetch) return;

		try {
			setIsLoading(true);
			const params = companyNumber ? { companyNumber: String(companyNumber) } : {};
			const response = await axiosClient.get("/customer", { params });
			setCustomers(response.data); // Keep the full customer object
		} catch (err) {
			setError(err);
		} finally {
			setIsLoading(false);
		}
	}, [shouldFetch, companyNumber]);

	useEffect(() => {
		fetchCustomers();
	}, [fetchCustomers]);

	return { customers, isLoading, error, refetch: fetchCustomers };
}
