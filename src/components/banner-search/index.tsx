"use client";

import { useSearchStore } from "@/lib/searchStore";

export default function BannerSearchInput() {
	const triggerFocus = useSearchStore((s) => s.triggerFocus);

	return (
		<input
			type="text"
			placeholder="Søk etter slanger, utstyr..."
			readOnly
			onFocus={() => triggerFocus()}
			className="flex-1 rounded-md border border-gray-300 bg-[#F8F9F8] px-2 py-[7px] text-base text-gray-700 placeholder-gray-500 outline-none"
		/>
	);
}
