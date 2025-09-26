"use client";

import { BadgeCheck } from "lucide-react";

interface ProductStockStatusProps {
	name: string;
	availability: string;
}

export function ProductStockStatus({
	name,
	availability,
}: ProductStockStatusProps) {
	return (
		<div className="flex items-center justify-between rounded-md bg-white">
			<span className="text-md font-normal text-[#5A615D]">{name}</span>
			<span className="inline-flex items-center gap-1 rounded-md bg-[#DCF7E0] px-5 py-1 text-sm font-medium text-green-800">
				<BadgeCheck className="h-3 w-3 fill-emerald-800 text-white" />
				{availability}
			</span>
		</div>
	);
}
