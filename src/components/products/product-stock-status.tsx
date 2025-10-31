"use client";

interface ProductStockStatusProps {
	name: string;
	availability: string;
}

export function ProductStockStatus({ name }: ProductStockStatusProps) {
	return (
		<div className="flex items-center justify-between rounded-md bg-white py-1">
			<span className="text-md font-normal text-[#5A615D]">{name}</span>
		</div>
	);
}
