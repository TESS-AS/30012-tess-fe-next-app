const PENDING_SCROLL_KEY = "tess_pending_scroll";
const URL_SCROLL_MAP_KEY = "tess_url_scroll_map";

const MAX_RESTORE_WAIT_MS = 3000;
const RESTORE_POLL_MS = 80;
const RESTORE_TOLERANCE_PX = 4;
const SCROLL_SAVE_DEBOUNCE_MS = 150;

export type PendingScrollPayload = {
	y: number;
	pathPrefix: string;
};

type UrlScrollMap = Record<string, number>;

export type RestoreFlag = { value: boolean };

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

function readUrlScrollMap(): UrlScrollMap {
	if (typeof window === "undefined") return {};
	try {
		const raw = sessionStorage.getItem(URL_SCROLL_MAP_KEY);
		return raw ? (JSON.parse(raw) as UrlScrollMap) : {};
	} catch {
		return {};
	}
}

function writeUrlScrollMap(map: UrlScrollMap) {
	if (typeof window === "undefined") return;
	try {
		sessionStorage.setItem(URL_SCROLL_MAP_KEY, JSON.stringify(map));
	} catch {
		/* ignore */
	}
}

function getFullUrl(): string {
	if (typeof window === "undefined") return "";
	return `${window.location.pathname}${window.location.search}`;
}

function getScrollContainer(): HTMLElement | null {
	if (typeof document === "undefined") return null;
	return document.getElementById("app-scroll-container");
}

function getScrollTop(): number {
	const el = getScrollContainer();
	if (el) return el.scrollTop;
	if (typeof window !== "undefined") return window.scrollY;
	return 0;
}

function applyScroll(y: number) {
	const el = getScrollContainer();
	if (el) {
		el.scrollTo({ top: y, behavior: "auto" });
	} else if (typeof window !== "undefined") {
		window.scrollTo({ top: y, behavior: "auto" });
	}
}

function saveScrollForUrl(url: string) {
	const map = readUrlScrollMap();
	map[url] = getScrollTop();
	writeUrlScrollMap(map);
}

/**
 * Poll-scroll to targetY until reached or timeout. The polling is URL-aware:
 * if window.location changes mid-poll, it stops by itself so we never scroll
 * the wrong page.
 */
function pollRestore(targetY: number, urlAtStart: string, onDone: () => void) {
	const startedAt = Date.now();

	const attempt = () => {
		if (typeof window === "undefined") {
			onDone();
			return;
		}
		if (getFullUrl() !== urlAtStart) {
			onDone();
			return;
		}

		const el = getScrollContainer();
		const scrollHeight = el
			? el.scrollHeight
			: document.documentElement.scrollHeight;
		const clientHeight = el ? el.clientHeight : window.innerHeight;
		const maxScroll = Math.max(0, scrollHeight - clientHeight);
		const desired = Math.min(targetY, maxScroll);

		applyScroll(desired);

		const currentTop = getScrollTop();
		const reachedTarget =
			Math.abs(currentTop - targetY) <= RESTORE_TOLERANCE_PX;
		const timedOut = Date.now() - startedAt >= MAX_RESTORE_WAIT_MS;

		if (reachedTarget || timedOut) {
			onDone();
			return;
		}
		setTimeout(attempt, RESTORE_POLL_MS);
	};

	requestAnimationFrame(() => {
		setTimeout(attempt, 0);
	});
}

/**
 * Attach a debounced scroll listener that persists the current scroll position
 * for the URL active at the time of attachment. Returns a cleanup function.
 */
export function attachScrollTracking(restoreFlag: RestoreFlag): () => void {
	if (typeof window === "undefined") return () => {};
	const urlAtStart = getFullUrl();
	const container = getScrollContainer();
	const target: HTMLElement | Window = container ?? window;
	let debounceId: ReturnType<typeof setTimeout> | null = null;

	const onScroll = () => {
		if (debounceId) clearTimeout(debounceId);
		debounceId = setTimeout(() => {
			if (restoreFlag.value) return;
			saveScrollForUrl(urlAtStart);
		}, SCROLL_SAVE_DEBOUNCE_MS);
	};

	target.addEventListener("scroll", onScroll, { passive: true });
	return () => {
		target.removeEventListener("scroll", onScroll);
		if (debounceId) clearTimeout(debounceId);
	};
}

/**
 * Monkey-patch history.pushState so we snapshot the scroll position
 * synchronously, before the URL (and therefore the rendered content height)
 * changes. Without this we lose scroll when navigating from a tall listing
 * page to a shorter detail page because the browser clamps scrollTop.
 */
export function attachHistoryPatch(restoreFlag: RestoreFlag): () => void {
	if (typeof window === "undefined") return () => {};
	const originalPushState = window.history.pushState;

	const patched = function (
		this: History,
		...args: Parameters<History["pushState"]>
	) {
		if (!restoreFlag.value) {
			saveScrollForUrl(getFullUrl());
		}
		return originalPushState.apply(this, args);
	};

	window.history.pushState = patched;
	return () => {
		window.history.pushState = originalPushState;
	};
}

/**
 * Listen for browser back/forward (popstate) and restore the saved scroll for
 * the new URL. The restore runs outside the React effect lifecycle so React
 * Strict Mode's double-mount won't cancel it.
 */
export function attachPopstateRestore(restoreFlag: RestoreFlag): () => void {
	if (typeof window === "undefined") return () => {};
	const onPopState = () => {
		const newUrl = getFullUrl();
		const map = readUrlScrollMap();
		const targetY = map[newUrl];
		if (typeof targetY !== "number") return;
		restoreFlag.value = true;
		pollRestore(targetY, newUrl, () => {
			restoreFlag.value = false;
		});
	};
	window.addEventListener("popstate", onPopState);
	return () => window.removeEventListener("popstate", onPopState);
}

/**
 * Consume the pending-scroll payload (set by `setPendingScrollRestore` from
 * the Tilbake button) and restore if it matches the current pathname.
 */
export function consumePendingScrollRestore(
	currentPathname: string,
	restoreFlag: RestoreFlag,
): void {
	if (typeof window === "undefined") return;
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
		if (currentPathname !== parsed.pathPrefix) return;
		sessionStorage.removeItem(PENDING_SCROLL_KEY);
		restoreFlag.value = true;
		pollRestore(parsed.y, getFullUrl(), () => {
			restoreFlag.value = false;
		});
	} catch {
		sessionStorage.removeItem(PENDING_SCROLL_KEY);
	}
}
