import { useEffect, useState } from "react";

import axiosClient from "@/services/axiosClient";
import { UserAddress } from "@/types/user.types";

export function useGetUserAdresses() {
	const [data, setData] = useState<UserAddress[] | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<unknown>(null);

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				setIsLoading(true);
				const response = await axiosClient.get<UserAddress[]>("/address/user");
				setData(response.data ?? []);
			} catch (err) {
				setError(err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchUserData();
	}, []);

	return { data, isLoading, error };
}
