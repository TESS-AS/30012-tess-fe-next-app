import { useEffect, useState } from "react";

import { mergePageItems } from "@/utils/mergePageItems";

export function useMergedPagedItems<T, K extends keyof T>(
	pageItems: T[],
	key: K,
	isFirstPage: boolean,
): T[] {
	const [items, setItems] = useState<T[]>([]);

	const areSameByKey = (a: T[], b: T[]) => {
		if (a === b) return true;
		if (a.length !== b.length) return false;
		for (let i = 0; i < a.length; i++) {
			if (a[i]?.[key] !== b[i]?.[key]) return false;
		}
		return true;
	};

	useEffect(() => {
		setItems((prev) => {
			const next = mergePageItems(prev, pageItems, key, isFirstPage);
			return areSameByKey(prev, next) ? prev : next;
		});
	}, [pageItems, key, isFirstPage]);

	return items;
}
