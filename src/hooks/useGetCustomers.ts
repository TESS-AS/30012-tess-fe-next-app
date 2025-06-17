import { useEffect, useState } from "react";

import axiosClient from "@/services/axiosClient";

interface Customer {
	customerNumber: string;
	customerName: string;
}

export function useGetCustomers(shouldFetch: boolean) {
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<unknown>(null);

	useEffect(() => {
		if (!shouldFetch) return;

		const fetchCustomers = async () => {
			try {
				setIsLoading(true);
				const response = await axiosClient.get("/customer");
				setCustomers(response.data); // Keep the full customer object
			} catch (err) {
				setError(err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchCustomers();
	}, [shouldFetch]);

	return { customers, isLoading, error };
}
