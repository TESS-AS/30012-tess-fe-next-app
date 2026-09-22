/**
 * Single point of truth for FE price resolution.
 *
 * Takes the raw price maps that BE ships (via the price engine) plus any
 * employee-set per-unit overrides, and returns effective maps + a resolver
 * function that layer overrides on top. AppContext delegates to this hook
 * so `calculatedPrices` / `unitPrices` / totals stay consistent across
 * every consumer (cart, StepConfirmation, order summary, email builder,
 * salesOrder payload) without each site needing its own override logic.
 *
 * ## Policy: what an override implies
 *
 * When an employee sets a unit price for an item, that price is treated as
 * the FINAL line price. It intentionally:
 *   - Replaces `bestPrice` from the price engine (calculatedPrices).
 *   - Replaces `basePriceTotal` (orderSummaryTotalPrice).
 *   - Zeros any BE-supplied surcharge and discount for that item.
 *
 * This mirrors the M3 side, where the salesOrder is sent with
 * `openPrice: true` and the ERP charges the FE-supplied price verbatim —
 * no standard-price-list lookup, no discount stacking. Keeping the FE
 * display convention aligned with what actually gets billed prevents the
 * "the customer paid X but the receipt says Y" class of bug.
 *
 * If product ever changes this rule (e.g. discounts still stack on
 * overrides), change it here — one file — and every downstream consumer
 * updates automatically.
 *
 * ## Known limitation: same itemNumber, multiple cart lines
 *
 * The FE cart data model is keyed by itemNumber, so `calculatedPrices`
 * carries one value per item. When the same itemNumber appears more than
 * once in the cart (e.g. as a standalone line AND as a kit sub-component),
 * we sum the quantities and apply `override × totalQty`. This matches the
 * existing engine-price behavior. If per-instance pricing is ever needed
 * (rare) the cart would need line-scoped identifiers, not just itemNumber.
 *
 * ## Performance
 *
 * Every effective map short-circuits to the raw reference when no overrides
 * are set, so the non-employee path allocates nothing. `cartItemQuantities`
 * only rewalks the cart when `cartItems` changes.
 */

import { useMemo } from "react";

import { getCartKitPartEntries } from "@/lib/cart-kit";
import { CartKitResponse } from "@/types/carts.types";

export interface PriceResolverInput {
	cartItems: CartKitResponse | undefined;
	/** Line-total map keyed by itemNumber (BE `bestPrice`). */
	calculatedPrices: Record<string, number>;
	/** By-quantity variant used as a preferred lookup in `getEffectivePrice`. */
	calculatedPricesByQuantity: Record<string, number>;
	/** Per-unit map keyed by itemNumber. */
	unitPrices: Record<string, number>;
	/** Pre-discount basePriceTotal, one entry per itemNumber. */
	orderSummaryTotalPrice: Record<string, number>;
	surChargePrices: Record<string, number>;
	rabatterPrices: Record<string, number>;
	/** Employee-set per-unit overrides. Empty when the user isn't eligible
	 *  or hasn't edited any price — hook takes the fast path in that case. */
	overriddenUnitPrices: Record<string, number>;
}

export interface PriceResolverResult {
	/** `itemNumber → totalQty` across regular cart + kit sub-lines. */
	cartItemQuantities: Map<string, number>;
	/** Raw maps with overrides layered per the policy documented above. */
	calculatedPrices: Record<string, number>;
	unitPrices: Record<string, number>;
	orderSummaryTotalPrice: Record<string, number>;
	surChargePrices: Record<string, number>;
	rabatterPrices: Record<string, number>;
	/** Per-item, per-quantity lookup that honors overrides first. */
	getEffectivePrice: (itemNumber: string, quantity: number) => number;
}

export function usePriceResolver(input: PriceResolverInput): PriceResolverResult {
	const {
		cartItems,
		calculatedPrices,
		calculatedPricesByQuantity,
		unitPrices,
		orderSummaryTotalPrice,
		surChargePrices,
		rabatterPrices,
		overriddenUnitPrices,
	} = input;

	const hasOverrides = Object.keys(overriddenUnitPrices).length > 0;

	const cartItemQuantities = useMemo(() => {
		const map = new Map<string, number>();
		const add = (itemNumber?: string, qty?: number) => {
			if (!itemNumber) return;
			map.set(itemNumber, (map.get(itemNumber) ?? 0) + (qty ?? 1));
		};
		for (const line of cartItems?.cart ?? []) {
			add(line.itemNumber, line.quantity);
		}
		for (const kit of cartItems?.cartKit ?? []) {
			add(kit.hose?.itemNumber, kit.hose?.quantity);
			add(kit.ferrule1?.itemNumber, kit.ferrule1?.quantity);
			add(kit.ferrule2?.itemNumber, kit.ferrule2?.quantity);
			add(kit.insert1?.itemNumber, kit.insert1?.quantity);
			add(kit.insert2?.itemNumber, kit.insert2?.quantity);
			for (const svc of Object.values(kit.services ?? {})) {
				if (svc && typeof svc === "object" && "itemNumber" in svc) {
					const s = svc as { itemNumber?: string; quantity?: number };
					add(s.itemNumber, s.quantity);
				}
			}
			for (const additional of getCartKitPartEntries(kit.additionals)) {
				add(additional.itemNumber, additional.quantity);
			}
		}
		return map;
	}, [cartItems]);

	const effectiveCalculatedPrices = useMemo(() => {
		if (!hasOverrides) return calculatedPrices;
		const result = { ...calculatedPrices };
		for (const [itemNumber, override] of Object.entries(overriddenUnitPrices)) {
			const qty = cartItemQuantities.get(itemNumber);
			if (qty == null) continue;
			result[itemNumber] = override * qty;
		}
		return result;
	}, [hasOverrides, calculatedPrices, overriddenUnitPrices, cartItemQuantities]);

	const effectiveUnitPrices = useMemo(() => {
		if (!hasOverrides) return unitPrices;
		return { ...unitPrices, ...overriddenUnitPrices };
	}, [hasOverrides, unitPrices, overriddenUnitPrices]);

	const effectiveOrderSummaryTotalPrice = useMemo(() => {
		if (!hasOverrides) return orderSummaryTotalPrice;
		const result = { ...orderSummaryTotalPrice };
		for (const [itemNumber, override] of Object.entries(overriddenUnitPrices)) {
			const qty = cartItemQuantities.get(itemNumber);
			if (qty == null) continue;
			result[itemNumber] = override * qty;
		}
		return result;
	}, [
		hasOverrides,
		orderSummaryTotalPrice,
		overriddenUnitPrices,
		cartItemQuantities,
	]);

	const effectiveSurChargePrices = useMemo(() => {
		if (!hasOverrides) return surChargePrices;
		const result = { ...surChargePrices };
		for (const itemNumber of Object.keys(overriddenUnitPrices)) {
			result[itemNumber] = 0;
		}
		return result;
	}, [hasOverrides, surChargePrices, overriddenUnitPrices]);

	const effectiveRabatterPrices = useMemo(() => {
		if (!hasOverrides) return rabatterPrices;
		const result = { ...rabatterPrices };
		for (const itemNumber of Object.keys(overriddenUnitPrices)) {
			result[itemNumber] = 0;
		}
		return result;
	}, [hasOverrides, rabatterPrices, overriddenUnitPrices]);

	// Kept as a plain function (not useMemo) — hot path called per row on
	// every render. Cheap map lookups; the useMemo bookkeeping would cost
	// more than the work.
	const getEffectivePrice = (itemNumber: string, quantity: number): number => {
		const override = overriddenUnitPrices[itemNumber];
		if (override != null) return override * quantity;
		return (
			calculatedPricesByQuantity[`${itemNumber}:${quantity}`] ??
			calculatedPrices[itemNumber] ??
			0
		);
	};

	return {
		cartItemQuantities,
		calculatedPrices: effectiveCalculatedPrices,
		unitPrices: effectiveUnitPrices,
		orderSummaryTotalPrice: effectiveOrderSummaryTotalPrice,
		surChargePrices: effectiveSurChargePrices,
		rabatterPrices: effectiveRabatterPrices,
		getEffectivePrice,
	};
}
