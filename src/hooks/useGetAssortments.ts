import { useEffect, useState } from "react";

import axiosClient from "@/services/axiosClient";

export function useGetAssortments(shouldFetch: boolean) {
	const [assortments, setAssortments] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<unknown>(null);

	useEffect(() => {
		if (!shouldFetch) return;

		const fetchAssortments = async () => {
			try {
				setIsLoading(true);
				const response = await axiosClient.get("/assortment");
				setAssortments(response.data ?? []);
			} catch (err) {
				setError(err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchAssortments();
	}, [shouldFetch]);

	return { assortments, isLoading, error };
}
