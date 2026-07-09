/**
 * Column-view helpers for the THM work-order hose list.
 *
 * The BE stores views as a flat list of visible-only, ordered column keys.
 * The FE uses `{ order, visible }` internally so the "Customize columns"
 * modal can show hidden columns separately. These helpers translate between
 * the two shapes and namespace FE keys with a `hoseList.` prefix so the
 * per-user view bag never collides with keys from other tables.
 */

import type { ThmView } from "@/types/thm-projects.types";

export interface ColumnDef<K extends string> {
	key: K;
	label: string;
}

export interface ColumnPreferences<K extends string> {
	order: K[];
	visible: Record<K, boolean>;
}

const THM_LIST_COLUMN_PREFIX = "hoseList.";

const toBeColumnKey = (key: string) => `${THM_LIST_COLUMN_PREFIX}${key}`;

const fromBeColumnKey = (col: string) =>
	col.startsWith(THM_LIST_COLUMN_PREFIX)
		? col.slice(THM_LIST_COLUMN_PREFIX.length)
		: col;

/** Hydrate FE preferences from a BE view. Unknown BE keys are dropped
 * (schema drift) and locally-known but missing keys are appended so newly
 * introduced columns surface at the tail instead of vanishing. */
export function viewColumnsToPreferences<K extends string>(
	beColumns: string[],
	allKeys: readonly K[],
): ColumnPreferences<K> {
	const known = new Set<string>(allKeys);
	const orderedVisible: K[] = [];
	for (const c of beColumns) {
		const fe = fromBeColumnKey(c) as K;
		if (known.has(fe) && !orderedVisible.includes(fe)) {
			orderedVisible.push(fe);
		}
	}
	const visibleSet = new Set<K>(orderedVisible);
	const hidden = allKeys.filter((k) => !visibleSet.has(k));
	const visible = Object.fromEntries(
		allKeys.map((k) => [k, visibleSet.has(k)]),
	) as Record<K, boolean>;
	return { order: [...orderedVisible, ...hidden], visible };
}

/** Serialise FE preferences into the BE-shape visible-only ordered array. */
export function preferencesToViewColumns<K extends string>(
	prefs: ColumnPreferences<K>,
): string[] {
	return prefs.order.filter((k) => prefs.visible[k]).map(toBeColumnKey);
}

/** Pick the view to activate on first load: default > first > none. */
export function pickInitialView(views: ThmView[]): ThmView | null {
	return views.find((v) => v.isDefault) ?? views[0] ?? null;
}
