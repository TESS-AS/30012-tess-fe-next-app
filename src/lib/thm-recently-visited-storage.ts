/**
 * THM Projects (MSL) — "Recently visited" persistence.
 *
 * Client-side only: we keep the last few work orders the user opened in
 * localStorage so the section survives reloads without a BE round-trip.
 * BE deliberately doesn't own this list — it's a per-device convenience.
 */

import type {
	ThmRecentlyVisitedItem,
	ThmWorkOrder,
} from "@/types/thm-projects.types";

const STORAGE_KEY = "tess.thm.recentlyVisited";
const MAX_ITEMS = 5;

export const THM_RECENTLY_VISITED_EVENT = "thm:recently-visited-changed";
export const THM_RECENTLY_VISITED_STORAGE_KEY = STORAGE_KEY;

export function getRecentlyVisited(): ThmRecentlyVisitedItem[] {
	if (typeof window === "undefined") return [];
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as ThmRecentlyVisitedItem[];
		if (!Array.isArray(parsed)) return [];
		return parsed.filter(
			(item): item is ThmRecentlyVisitedItem =>
				!!item &&
				typeof item === "object" &&
				!!item.workOrder &&
				typeof item.workOrder.workOrderNumber === "string" &&
				typeof item.visitedAt === "string",
		);
	} catch {
		return [];
	}
}

export function recordVisit(workOrder: ThmWorkOrder): void {
	if (typeof window === "undefined") return;
	const others = getRecentlyVisited().filter(
		(item) => item.workOrder.workOrderNumber !== workOrder.workOrderNumber,
	);
	const next: ThmRecentlyVisitedItem[] = [
		{ workOrder, visitedAt: new Date().toISOString() },
		...others,
	].slice(0, MAX_ITEMS);
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
		window.dispatchEvent(new Event(THM_RECENTLY_VISITED_EVENT));
	} catch {
		// localStorage may be unavailable (private mode, quota); silently ignore.
	}
}
