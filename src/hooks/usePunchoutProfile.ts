import { useEffect, useState } from "react";

import axiosClient from "@/services/axiosClient";
import { ProfileUser } from "@/types/user.types";

export function usePunchoutProfile() {
	const [data, setData] = useState<ProfileUser | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<unknown>(null);

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const response = await axiosClient.get<ProfileUser[]>("/user");
				console.log(response.data[0], "res");
				setData(response.data[0]);
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
