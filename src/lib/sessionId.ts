const SESSION_ID_KEY = "tess.userSessionId";

export function getUserSessionId(): string {
	if (typeof window === "undefined") return "server";

	const existing = window.sessionStorage.getItem(SESSION_ID_KEY);
	if (existing) return existing;

	const generated =
		typeof crypto !== "undefined" && "randomUUID" in crypto
			? crypto.randomUUID()
			: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

	window.sessionStorage.setItem(SESSION_ID_KEY, generated);
	return generated;
}
