import { useEffect, useState } from "react";

import axiosClient from "@/services/axiosClient";
import { UserAddress } from "@/types/user.types";

export function useGetOrganizationAddresses(orgNumber?: string) {
	const [data, setData] = useState<UserAddress[] | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<unknown>(null);

	useEffect(() => {
		if (!orgNumber) return;

		const fetchOrgAddresses = async () => {
			try {
				setIsLoading(true);
				const response = await axiosClient.get<UserAddress[]>(
					`/address/organization/${orgNumber}`,
				);
				setData(response.data ?? []);
			} catch (err) {
				setError(err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchOrgAddresses();
	}, [orgNumber]);

	return { data, isLoading, error };
}
