import { ReactNode } from "react";

import { formatNorwegianCurrency } from "@/utils/formatCurrency";

type CartKitPartRowProps = {
	name: string;
	itemNumber: string;
	price: number;
	/** Shown as "label: value" when `meta` is not set. */
	quantity?: number;
	quantityLabel?: string;
	/** When set, shown as-is instead of quantity (e.g. hose length "10000 mm"). */
	meta?: string;
	/** Optional slot rendered between the quantity/meta and the price — used
	 *  for the employee "Enhetspris" override input on cart page rows.
	 *  Returns `null` when the caller has no reason to render (e.g. user
	 *  lacks `canOverridePrice`). */
	priceInputSlot?: ReactNode;
};

export function CartKitPartRow({
	name,
	itemNumber,
	price,
	quantity,
	quantityLabel,
	meta,
	priceInputSlot,
}: CartKitPartRowProps) {
	const qty = quantity && quantity > 0 ? quantity : 1;
	const metaText =
		meta?.trim() ||
		(quantityLabel ? `${quantityLabel}: ${qty}` : String(qty));

	return (
		<div className="flex items-start justify-between gap-2">
			<div className="flex min-w-0 flex-col">
				<p className="mb-2 font-semibold text-[#0F1912] uppercase underline">
					{name}
				</p>
				<p className="text-xs text-[#5A615D]">{itemNumber}</p>
			</div>
			<div className="flex shrink-0 items-center gap-6">
				<span className="text-sm whitespace-nowrap text-[#5A615D]">
					{metaText}
				</span>
				{priceInputSlot}
				<p className="font-bold">{formatNorwegianCurrency(price)}</p>
			</div>
		</div>
	);
}
