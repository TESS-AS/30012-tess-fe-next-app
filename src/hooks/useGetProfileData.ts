import { useEffect, useState } from "react";

import axiosClient from "@/services/axiosClient";
import { ProfileUser } from "@/types/user.types";
import { useSession } from "next-auth/react";

export function useGetProfileData() {
	const [data, setData] = useState<ProfileUser | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<unknown>(null);

	const { data: session, status } = useSession();

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

	useEffect(() => {
		if (
			status === "authenticated" &&
			session?.accessToken &&
			session?.idToken
		) {
			let isMounted = true;

			const load = async () => {
				if (isMounted) await fetchUserData();
			};

			load();
			const timeout = setTimeout(load, 1000);

			return () => {
				isMounted = false;
				clearTimeout(timeout);
			};
		}
	}, [status, session]);

	return { data, isLoading, error };
}
