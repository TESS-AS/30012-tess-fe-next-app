import { useCallback, useRef, useState } from "react";

import {
	HOSE_SELECTION_PAGE_SIZE,
	hoseSelectionHasMore,
	postHoseSelection,
} from "@/services/hose-configurator.service";
import type {
	HoseSelectionItem,
	HoseSelectionRequest,
} from "@/types/hose-configurator.types";

export const useHoseSelection = () => {
	const [items, setItems] = useState<HoseSelectionItem[]>([]);
	const [page, setPage] = useState(0);
	const [hasMore, setHasMore] = useState(false);
	const [hasResult, setHasResult] = useState(false);
	const [isSearching, setIsSearching] = useState(false);
	const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
	const [isError, setIsError] = useState(false);
	const criteriaRef = useRef<HoseSelectionRequest | null>(null);
	const requestIdRef = useRef(0);

	const search = useCallback(async (payload: HoseSelectionRequest) => {
		const requestId = ++requestIdRef.current;
		criteriaRef.current = payload;
		setIsSearching(true);
		setIsError(false);
		setHasMore(false);

		try {
			const result = await postHoseSelection(
				payload,
				1,
				HOSE_SELECTION_PAGE_SIZE,
			);
			if (requestId !== requestIdRef.current) return null;
			setItems(result.items);
			setPage(result.page);
			setHasMore(hoseSelectionHasMore(result));
			setHasResult(true);
			return result.items;
		} catch {
			if (requestId !== requestIdRef.current) return null;
			setIsError(true);
			setHasResult(true);
			setItems([]);
			return null;
		} finally {
			if (requestId === requestIdRef.current) {
				setIsSearching(false);
			}
		}
	}, []);

	const loadMore = useCallback(async () => {
		const criteria = criteriaRef.current;
		if (!criteria || isSearching || isFetchingNextPage || !hasMore) return null;

		const requestId = requestIdRef.current;
		const nextPage = page + 1;
		setIsFetchingNextPage(true);

		try {
			const result = await postHoseSelection(
				criteria,
				nextPage,
				HOSE_SELECTION_PAGE_SIZE,
			);
			if (requestId !== requestIdRef.current) return null;
			let nextItems: HoseSelectionItem[] = [];
			setItems((current) => {
				const seen = new Set(current.map((item) => item.itemNumber));
				const appended = result.items.filter(
					(item) => !seen.has(item.itemNumber),
				);
				nextItems = [...current, ...appended];
				return nextItems;
			});
			setPage(result.page);
			setHasMore(hoseSelectionHasMore(result));
			return nextItems;
		} catch {
			return null;
		} finally {
			if (requestId === requestIdRef.current) {
				setIsFetchingNextPage(false);
			}
		}
	}, [hasMore, isFetchingNextPage, isSearching, page]);

	return {
		items,
		hasMore,
		hasResult,
		isSearching,
		isFetchingNextPage,
		isError,
		search,
		loadMore,
	};
};
