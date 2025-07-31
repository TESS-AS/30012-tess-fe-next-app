"use client";

import { ReactNode } from "react";

import { useSyncSSOToken } from "@/hooks/useSyncSSOToken";
import { Loader2 } from "lucide-react";
import { SessionProvider, useSession } from "next-auth/react";

export function AuthProvider({ children }: { children: ReactNode }) {
	return (
		<SessionProvider>
			<AuthGate>{children}</AuthGate>
		</SessionProvider>
	);
}

function AuthGate({ children }: { children: ReactNode }) {
	const isReady = useSyncSSOToken();
	const { status } = useSession();

	if (status === "loading" || !isReady) {
		return (
			<div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
				<div className="flex flex-col items-center gap-3 rounded-lg bg-white p-6 shadow-lg">
					<Loader2 className="h-8 w-8 animate-spin text-[#009640]" />
					<p className="text-sm font-medium text-gray-600">Authenticating...</p>
				</div>
			</div>
		);
	}

	return <>{children}</>;
}
