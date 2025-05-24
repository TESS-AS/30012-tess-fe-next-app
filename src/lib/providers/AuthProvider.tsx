"use client";

import { ReactNode, useEffect } from "react";

import axiosClient from "@/services/axiosClient";
import { AxiosError } from "axios";
import { SessionProvider, signOut, useSession } from "next-auth/react";

function SyncSSOTokenAndFetchUser() {
	const { data: session, status } = useSession() as {
		data: any;
		status: "loading" | "authenticated" | "unauthenticated";
	};
	useEffect(() => {
		if (
			status === "authenticated" &&
			session?.accessToken &&
			session?.idToken
		) {
			(async () => {
				try {
					await axiosClient.post("/login/cookie", {
						idToken: session.idToken,
						accessToken: session.accessToken,
					});
					const { data: user } = await axiosClient.get("/user");
				} catch (err) {
					const axiosError = err as AxiosError;
					console.error("SSO sync or user fetch failed", axiosError);
					if (axiosError?.response?.status === 401) {
						signOut();
					}
				}
			})();
		}
	}, [session, status]);

	return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
	return (
		<SessionProvider>
			<SyncSSOTokenAndFetchUser />
			{children}
		</SessionProvider>
	);
}
