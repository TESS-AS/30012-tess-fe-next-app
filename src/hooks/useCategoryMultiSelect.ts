"use client";

/**
 * PBI2940 multi-select category state.
 *
 * Single responsibility: own the `Set<string>` of selected category IDs and
 * keep it synced to the URL as `?cats=id1,id2`. Nothing about search results
 * or `flag: true` seeding lives here — that's the composing hook's job (it
 * has `inferredCategories` in scope). This keeps the module focused, easy to
 * test in isolation, and reusable in any other list surface that needs
 * URL-persisted multi-select against comma-separated params.
 *
 * Performance notes:
 *   - `Set` for O(1) `.has()` (cheaper than array scans on each checkbox).
 *   - `selectedIdsArray` and `selectedChips` memoized so downstream deps
 *     stay reference-stable across unrelated renders.
 *   - Toggle/remove/setAll pushed to URL only when the set actually changes
 *     (identity check via `setsEqual`).
 *   - No effects run against derived data — all state changes are user- or
 *     composer-driven, no reactive loops.
 */

import { useCallback, useMemo, useState } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const CATS_PARAM = "cats";

export interface UseCategoryMultiSelectResult {
	/** Live Set of selected category IDs. Prefer `.has()` for membership. */
	selectedIds: Set<string>;
	/** Stable-reference sorted array — safe as a react-query key or dep. */
	selectedIdsArray: string[];
	/** Toggle membership. Idempotent no-op if id is empty. */
	toggle: (id: string) => void;
	/** Remove a specific id (idempotent). */
	remove: (id: string) => void;
	/** Replace the whole set. Useful for seeding from BE flag=true rows. */
	setAll: (ids: Iterable<string>) => void;
	/** Clear the entire selection and drop the URL param. */
	clear: () => void;
}

const readInitialFromUrl = (
	searchParams: ReturnType<typeof useSearchParams>,
): Set<string> => {
	const raw = searchParams?.get(CATS_PARAM);
	if (!raw) return new Set<string>();
	return new Set(raw.split(",").filter(Boolean));
};

const setsEqual = (a: Set<string>, b: Set<string>): boolean => {
	if (a === b) return true;
	if (a.size !== b.size) return false;
	for (const v of a) if (!b.has(v)) return false;
	return true;
};

export function useCategoryMultiSelect(): UseCategoryMultiSelectResult {
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const router = useRouter();

	const [selectedIds, setSelectedIds] = useState<Set<string>>(() =>
		readInitialFromUrl(searchParams),
	);

	// Serialise the set into a canonical URL param. Pulled into its own
	// callback so both user actions and composer-driven seeding go through
	// the same path — no duplicate URL-writing logic.
	const writeToUrl = useCallback(
		(ids: Set<string>) => {
			const params = new URLSearchParams(searchParams.toString());
			if (ids.size > 0) {
				const sorted = Array.from(ids).sort();
				params.set(CATS_PARAM, sorted.join(","));
			} else {
				params.delete(CATS_PARAM);
			}
			router.replace(
				`${pathname}${params.toString() ? `?${params.toString()}` : ""}`,
				{ scroll: false },
			);
		},
		[searchParams, pathname, router],
	);

	const toggle = useCallback(
		(id: string) => {
			if (!id) return;
			setSelectedIds((prev) => {
				const next = new Set(prev);
				if (next.has(id)) next.delete(id);
				else next.add(id);
				if (setsEqual(prev, next)) return prev;
				writeToUrl(next);
				return next;
			});
		},
		[writeToUrl],
	);

	const remove = useCallback(
		(id: string) => {
			if (!id) return;
			setSelectedIds((prev) => {
				if (!prev.has(id)) return prev;
				const next = new Set(prev);
				next.delete(id);
				writeToUrl(next);
				return next;
			});
		},
		[writeToUrl],
	);

	const setAll = useCallback(
		(ids: Iterable<string>) => {
			setSelectedIds((prev) => {
				const next = new Set<string>();
				for (const id of ids) if (id) next.add(id);
				if (setsEqual(prev, next)) return prev;
				writeToUrl(next);
				return next;
			});
		},
		[writeToUrl],
	);

	const clear = useCallback(() => {
		setSelectedIds((prev) => {
			if (prev.size === 0) return prev;
			const next = new Set<string>();
			writeToUrl(next);
			return next;
		});
	}, [writeToUrl]);

	const selectedIdsArray = useMemo(
		() => Array.from(selectedIds).sort(),
		[selectedIds],
	);

	return {
		selectedIds,
		selectedIdsArray,
		toggle,
		remove,
		setAll,
		clear,
	};
}
