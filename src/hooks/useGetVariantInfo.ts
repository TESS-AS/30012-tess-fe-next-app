"use client";

import { useEffect, useState } from "react";

import { getItemCard } from "@/services/product.service";

interface VariantInfo {
	itemNumber: string;
	productName?: string;
	price?: number;
	balance?: number;
	[key: string]: any;
}

export function useGetVariantInfo(
	items: { itemNumber: string }[] = [],
	selectedItemNumber?: string,
) {
	const [data, setData] = useState<VariantInfo | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!items || items.length === 0) return;
		const itemNumber = selectedItemNumber || items[0].itemNumber;
		setIsLoading(true);

		getItemCard(itemNumber)
			.then((res) => {
				setData(res);
				setError(null);
			})
			.catch((err) => {
				console.error("Failed to fetch variant:", err);
				setData(null);
				setError("Failed to load variant info");
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [items, selectedItemNumber]);

	return { data, isLoading, error };
}
