"use client";

import { useEffect } from "react";

import { usePathname } from "@/i18n/navigation";

const PENDING_SCROLL_KEY = "tess_pending_scroll";

export type PendingScrollPayload = {
	y: number;
	pathPrefix: string;
};

/** Call before router.push(listingUrl) so the listing page restores scroll after navigation. */
export function setPendingScrollRestore(y: number, fullPathForPush: string) {
	if (typeof window === "undefined") return;
	const pathPrefix = fullPathForPush.split("?")[0] || fullPathForPush;
	try {
		sessionStorage.setItem(
			PENDING_SCROLL_KEY,
			JSON.stringify({ y, pathPrefix } satisfies PendingScrollPayload),
		);
	} catch {
		/* ignore */
	}
}

export function ScrollRestoreOnRoute() {
	const pathname = usePathname();

	useEffect(() => {
		try {
			const raw = sessionStorage.getItem(PENDING_SCROLL_KEY);
			if (!raw) return;
			const parsed = JSON.parse(raw) as PendingScrollPayload;
			if (
				typeof parsed?.y !== "number" ||
				typeof parsed?.pathPrefix !== "string"
			) {
				sessionStorage.removeItem(PENDING_SCROLL_KEY);
				return;
			}
			if (pathname !== parsed.pathPrefix) return;
			sessionStorage.removeItem(PENDING_SCROLL_KEY);
			const run = () => {
				const el = document.getElementById("app-scroll-container");
				if (el && "scrollTo" in el) {
					(el as HTMLElement).scrollTo({ top: parsed.y, behavior: "auto" });
				} else {
					window.scrollTo({ top: parsed.y, behavior: "auto" });
				}
			};
			requestAnimationFrame(() => {
				setTimeout(run, 0);
			});
		} catch {
			sessionStorage.removeItem(PENDING_SCROLL_KEY);
		}
	}, [pathname]);

	return null;
}
