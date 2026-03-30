const STORAGE_KEY = "tess_product_return";

export type ProductReturnTarget = {
	pathname: string;
	scrollY: number;
};

export function setProductReturnTarget(
	pathname: string,
	options?: { scrollY?: number },
): void {
	if (typeof window === "undefined" || !pathname) return;
	try {
		const payload: ProductReturnTarget = {
			pathname,
			scrollY: options?.scrollY ?? window.scrollY ?? 0,
		};
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
	} catch {
		/* ignore quota / private mode */
	}
}

export function peekProductReturnTarget(): ProductReturnTarget | null {
	if (typeof window === "undefined") return null;
	try {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as ProductReturnTarget;
		if (!parsed?.pathname || typeof parsed.pathname !== "string") return null;
		return {
			pathname: parsed.pathname,
			scrollY: typeof parsed.scrollY === "number" ? parsed.scrollY : 0,
		};
	} catch {
		return null;
	}
}

export function consumeProductReturnTarget(): ProductReturnTarget | null {
	const target = peekProductReturnTarget();
	if (target) {
		try {
			sessionStorage.removeItem(STORAGE_KEY);
		} catch {
			/* ignore */
		}
	}
	return target;
}
