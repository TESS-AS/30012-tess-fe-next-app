import { useEffect, useState } from "react";

import axiosClient from "@/services/axiosClient";
import { AxiosError } from "axios";
import { useSession, signOut } from "next-auth/react";

export function useSyncSSOToken() {
	const { data: session, status } = useSession();
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		const sync = async () => {
			if (status === "authenticated" && session?.accessToken) {
				try {
					await axiosClient.post("/login/cookie", {
						accessToken: session.accessToken,
					});
					await axiosClient.get("/user");
					setIsReady(true);
				} catch (err) {
					const axiosError = err as AxiosError;
					console.error("SSO sync or user fetch failed", axiosError);
					const errorData = axiosError?.response?.data as { error?: string };

					if (
						axiosError?.response?.status === 401 ||
						errorData?.error?.includes("401")
					) {
						signOut();
					}
				}
			} else if (status === "unauthenticated") {
				setIsReady(true);
			}
		};

		sync();
	}, [session, status]);

	return isReady;
}
