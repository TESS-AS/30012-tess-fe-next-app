/**
 * Warehouse utilities shared between product-info and product-variant-table.
 *
 * The BE pricing endpoint is scoped by (customerNumber, companyNumber), and
 * warehouses can belong to a company different from the user's default. So
 * everywhere we display a price or add an item to the cart, we need the
 * matching warehouseNumber + companyNumber pair — that's what these helpers
 * produce.
 */

export interface WarehouseOption {
	warehouseId: number;
	warehouseNumber: string;
	warehouseName: string;
	balance: number;
	companyNumber: string;
}

export interface ResolvedWarehouse {
	warehouseNumber: string;
	companyNumber: string;
	balance: number;
	warehouseName: string;
}

interface InventoryRow {
	warehouseId?: number;
	warehouseNumber?: string | number;
	warehouseName?: string;
	balance?: number;
	companyNumber?: string | number;
}

interface BuildOptions {
	/** Localized label used as a fallback warehouseName, e.g. "Lager" / "Warehouse". */
	warehouseLabel: string;
	/** Max options to return after dedup. Defaults to 50. */
	limit?: number;
}

function toOption(inv: InventoryRow, label: string): WarehouseOption {
	return {
		warehouseId: inv.warehouseId ?? 0,
		warehouseNumber: String(inv.warehouseNumber ?? inv.warehouseId ?? ""),
		warehouseName: inv.warehouseName || `${label} ${inv.warehouseId ?? ""}`,
		balance: inv.balance ?? 0,
		companyNumber: String(inv.companyNumber ?? ""),
	};
}

/**
 * From a set of warehouse options, pick the one the UI should preselect.
 *
 * Prefers the user's default warehouse when it's present in the options (even
 * at zero balance — a user's mental model of "my warehouse" beats "first with
 * stock"). Falls back to the first option (highest balance, per
 * `buildWarehouseOptions` sort) so the picker isn't empty.
 */
export function pickPreferredWarehouse(
	options: WarehouseOption[],
	defaultWarehouseNumber: string | undefined,
): WarehouseOption | undefined {
	if (!options.length) return undefined;
	if (defaultWarehouseNumber) {
		const match = options.find(
			(o) => o.warehouseNumber === defaultWarehouseNumber,
		);
		if (match) return match;
	}
	return options[0];
}

/**
 * Sort: in-stock first (descending balance), then zero-balance (by warehouseId).
 * Dedup: by (companyNumber, warehouseNumber) since the same warehouseNumber can
 * exist under multiple companies.
 */
export function buildWarehouseOptions(
	inventory: InventoryRow[] | undefined | null,
	{ warehouseLabel, limit = 50 }: BuildOptions,
): WarehouseOption[] {
	if (!inventory?.length) return [];

	const withBalance = inventory
		.filter((inv) => (inv.balance ?? 0) > 0)
		.map((inv) => toOption(inv, warehouseLabel))
		.sort((a, b) => b.balance - a.balance);
	const withZero = inventory
		.filter((inv) => (inv.balance ?? 0) === 0)
		.map((inv) => toOption(inv, warehouseLabel))
		.sort((a, b) => a.warehouseId - b.warehouseId);

	const seen = new Set<string>();
	return [...withBalance, ...withZero]
		.filter((w) => {
			const key = `${w.companyNumber}-${w.warehouseNumber}`;
			if (!w.warehouseNumber || seen.has(key)) return false;
			seen.add(key);
			return true;
		})
		.slice(0, limit);
}

/**
 * Resolve a warehouse "candidate" string against the inventory.
 *
 * The candidate may be either the canonical warehouseNumber or — for older
 * code paths still in flight — a stringified warehouseId. Both are looked up,
 * with the matching inventory row's warehouseNumber returned.
 *
 * Falls back to defaults if neither the candidate nor the user's default
 * warehouse can be matched.
 */
export function resolveWarehouse(
	inventory: InventoryRow[] | undefined | null,
	candidate: string | undefined,
	defaults: { warehouseNumber?: string; companyNumber?: string },
): ResolvedWarehouse | null {
	const list = inventory ?? [];
	const fallbackCompanyNumber = defaults.companyNumber
		? String(defaults.companyNumber)
		: "1";

	const candidates: string[] = [];
	if (candidate) candidates.push(candidate);
	if (defaults.warehouseNumber) candidates.push(defaults.warehouseNumber);

	for (const c of candidates) {
		const inv = list.find(
			(i) => String(i.warehouseNumber) === c || String(i.warehouseId) === c,
		);
		if (inv) {
			return {
				warehouseNumber: String(inv.warehouseNumber ?? inv.warehouseId ?? c),
				companyNumber: String(inv.companyNumber ?? fallbackCompanyNumber),
				balance: inv.balance ?? 0,
				warehouseName:
					inv.warehouseName || `Lager ${inv.warehouseId ?? ""}`,
			};
		}
	}

	if (defaults.warehouseNumber) {
		return {
			warehouseNumber: defaults.warehouseNumber,
			companyNumber: fallbackCompanyNumber,
			balance: 0,
			warehouseName: "hovedlager",
		};
	}
	return null;
}
