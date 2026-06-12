"use client";

import { useEffect, useState } from "react";

import {
	getRecentlyVisited,
	THM_RECENTLY_VISITED_EVENT,
	THM_RECENTLY_VISITED_STORAGE_KEY,
} from "@/lib/thm-recently-visited-storage";
import type { ThmRecentlyVisitedResponse } from "@/types/thm-projects.types";

const EMPTY: ThmRecentlyVisitedResponse = {
	data: [],
	meta: { totalItems: 0 },
};

export function useThmRecentlyVisited() {
	const [data, setData] = useState<ThmRecentlyVisitedResponse>(EMPTY);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const sync = () => {
			const items = getRecentlyVisited();
			setData({ data: items, meta: { totalItems: items.length } });
			setIsLoading(false);
		};
		sync();

		const onChange = () => sync();
		const onStorage = (e: StorageEvent) => {
			if (e.key === THM_RECENTLY_VISITED_STORAGE_KEY) sync();
		};

		window.addEventListener(THM_RECENTLY_VISITED_EVENT, onChange);
		window.addEventListener("storage", onStorage);
		return () => {
			window.removeEventListener(THM_RECENTLY_VISITED_EVENT, onChange);
			window.removeEventListener("storage", onStorage);
		};
	}, []);

	return { data, isLoading };
}
