"use client";

import { ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
	// Auth is handled by backend (GET /auth/sso, GET /auth/tenant).
	// Session is established via backend cookies; profile is loaded via /user in ProfileProvider.
	return <>{children}</>;
}
