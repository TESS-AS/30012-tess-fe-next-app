import { useEffect, useState } from "react";

import axiosClient from "@/services/axiosClient";
import { DefaultAddress } from "@/types/user.types";

export function useGetDefaultAddress() {
	const [data, setData] = useState<DefaultAddress[] | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<unknown>(null);

	useEffect(() => {
		const fetchDefaultAddressData = async () => {
			try {
				setIsLoading(true);
				const response = await axiosClient.get<DefaultAddress[]>("/address/defaultAddress");
				setData(response.data ?? []);
			} catch (err) {
				setError(err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchDefaultAddressData();
	}, []);

	return { data, isLoading, error };
}
