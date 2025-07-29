import { useEffect, useState } from "react";

import axiosClient from "@/services/axiosClient";

interface Company {
	companyNumber: number;
	companyId: string;
	companyName: string;
}

export function useGetCompanies(shouldFetch: boolean) {
	const [companies, setCompanies] = useState<Company[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<unknown>(null);

	useEffect(() => {
		if (!shouldFetch) return;

		const fetchCompanies = async () => {
			try {
				setIsLoading(true);
				const response = await axiosClient.get("/company");
				setCompanies(response.data);
			} catch (err) {
				setError(err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchCompanies();
	}, [shouldFetch]);

	return { companies, isLoading, error };
}
