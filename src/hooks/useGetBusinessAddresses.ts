// hooks/useGetBusinessAddresses.ts
import { useEffect, useRef, useState } from "react";

import axiosClient from "@/services/axiosClient";
import { UserAddress } from "@/types/user.types";

export function useGetBusinessAddresses(
	customerNumber: string | undefined,
	shouldFetch: boolean,
) {
	const [data, setData] = useState<UserAddress[] | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<unknown>(null);
	const hasFetched = useRef(false);

	useEffect(() => {
		if (!shouldFetch || !customerNumber || hasFetched.current) return;

		const fetchData = async () => {
			try {
				setIsLoading(true);
				const response = await axiosClient.get<UserAddress[]>(
					`/address/customer/${customerNumber}`,
				);
				setData(response.data ?? []);
				hasFetched.current = true;
			} catch (err) {
				setError(err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [customerNumber, shouldFetch]);

	return { data, isLoading, error };
}
