import { useEffect, useState } from "react";

import axiosClient from "@/services/axiosClient";
import { ProfileUser } from "@/types/user.types";

export function useGetProfileData() {
	const [data, setData] = useState<ProfileUser | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<unknown>(null);

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				setIsLoading(true);
				const response = await axiosClient.get<ProfileUser[]>("/user");
				setData(response.data[0] ?? null);
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
