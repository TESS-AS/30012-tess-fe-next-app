"use client";

import { ReactNode, useEffect, useState } from "react";

import axiosClient from "@/services/axiosClient";
import { AxiosError } from "axios";
import { SessionProvider, signOut, useSession } from "next-auth/react";

function SyncSSOTokenAndFetchUser() {
	const { data: session, status } = useSession();
	const [isTokenSynced, setIsTokenSynced] = useState(false);

	useEffect(() => {
		if (
			status === "authenticated" &&
			session?.accessToken &&
			session?.idToken
		) {
			(async () => {
				try {
					console.log("Syncing SSO token...");
					await axiosClient.post("/login/cookie", {
						idToken: session.idToken,
						accessToken: session.accessToken,
					});
					console.log("SSO token synced successfully");
					setIsTokenSynced(true);
				} catch (err) {
					const axiosError = err as AxiosError;
					console.error("SSO sync failed", axiosError);
					if (axiosError?.response?.status === 401) {
						signOut();
					}
				}
			})();
		} else if (status === "unauthenticated") {
			setIsTokenSynced(false);
		}
	}, [session, status]);

	return { isTokenSynced };
}

export function AuthProvider({ children }: { children: ReactNode }) {
	return (
		<SessionProvider>
			<AuthStateManager>{children}</AuthStateManager>
		</SessionProvider>
	);
}

function AuthStateManager({ children }: { children: ReactNode }) {
	const syncResult = SyncSSOTokenAndFetchUser();
	const { status } = useSession();

	if (status === "loading") {
		return null;
	}

	if (status === "authenticated" && !syncResult.isTokenSynced) {
		return null;
	}

	return <>{children}</>;
}
