/**
 * Column-view helpers for the THM work-order hose list.
 *
 * The BE stores views as a flat list of visible-only, ordered column keys
 * that match the nested-object paths in the `getHose` response (e.g.
 * `hoseLine.s2`, `hoseData.uploadedAt`, `hoseHeader.mediaCount`). The FE uses
 * short internal `ColumnKey` values for rendering, so each caller supplies a
 * `ColumnKeyMapping` translating between the two.
 *
 * The FE uses `{ order, visible }` internally so the "Customize columns"
 * modal can show hidden columns separately, while the BE stores only
 * ordered-visible.
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

/** FE ColumnKey → BE nested-path key (e.g. "s2" → "hoseLine.s2"). */
export type ColumnKeyMapping<K extends string> = Record<K, string>;

const reverseMapping = <K extends string>(
	mapping: ColumnKeyMapping<K>,
): Record<string, K> => {
	const out: Record<string, K> = {};
	(Object.keys(mapping) as K[]).forEach((k) => {
		out[mapping[k]] = k;
	});
	return out;
};

/** Hydrate FE preferences from a BE view. Unknown BE keys are dropped
 * (schema drift) and locally-known but missing keys are appended so newly
 * introduced columns surface at the tail instead of vanishing. */
export function viewColumnsToPreferences<K extends string>(
	beColumns: string[],
	allKeys: readonly K[],
	mapping: ColumnKeyMapping<K>,
): ColumnPreferences<K> {
	const reverse = reverseMapping(mapping);
	const known = new Set<string>(allKeys);
	const orderedVisible: K[] = [];
	for (const c of beColumns) {
		const fe = reverse[c];
		if (fe && known.has(fe) && !orderedVisible.includes(fe)) {
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
	mapping: ColumnKeyMapping<K>,
): string[] {
	return prefs.order
		.filter((k) => prefs.visible[k])
		.map((k) => mapping[k]);
}

/** Pick the view to activate on first load: default > first > none. */
export function pickInitialView(views: ThmView[]): ThmView | null {
	return views.find((v) => v.isDefault) ?? views[0] ?? null;
}
