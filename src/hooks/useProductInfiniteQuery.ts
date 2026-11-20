import {
	searchProducts,
	type InferredCategory,
} from "@/services/product.service";
import { FilterValues, SliderValues } from "@/types/filter.types";
import { IProduct } from "@/types/product.types";
import { useInfiniteQuery } from "@tanstack/react-query";

interface UseProductInfiniteQueryProps {
	categoryNumber: string | string[] | null;
	query: string | null;
	filters: FilterValues[] | null;
	sliders?: SliderValues[] | null;
	sort: string | null;
	pageSize?: number;
	enabled?: boolean;
}

interface ProductPage {
	products: IProduct[];
	hasMore: boolean;
	page: number;
	totalPages: number;
	totalFamilies?: number;
	totalItems?: number;
	/** PBI2940: BE-inferred categories with a `flag` marking the ones that
	 *  are pre-filtered/active for the current search. Only populated on the
	 *  first page since categories are query-scoped, not page-scoped. */
	categories?: InferredCategory[];
}

export function useProductInfiniteQuery({
	categoryNumber,
	query,
	filters,
	sliders = null,
	sort,
	pageSize = 9,
	enabled = true,
}: UseProductInfiniteQueryProps) {
	const infiniteQuery = useInfiniteQuery({
		queryKey: [
			"products",
			categoryNumber,
			query,
			filters,
			sliders,
			sort,
			pageSize,
		],
		queryFn: async ({ pageParam = 1 }): Promise<ProductPage> => {
			const response = await searchProducts(
				pageParam,
				pageSize,
				query,
				categoryNumber,
				filters,
				sort,
				undefined,
				sliders,
			);

			return {
				products: response.product || [],
				hasMore: (response.product?.length || 0) === pageSize,
				page: pageParam,
				totalPages: response.totalPages ?? 0,
				totalFamilies: response.totalFamilies,
				totalItems: response.totalItems,
				categories: response.categories,
			};
		},
		getNextPageParam: (lastPage, allPages) => {
			if (!lastPage.hasMore) return undefined;
			return allPages.length + 1;
		},
		initialPageParam: 1,
		enabled: enabled && (!!categoryNumber || !!query),
		staleTime: 1 * 60 * 1000, // 1 minute
		gcTime: 5 * 60 * 1000, // 5 minutes
	});

	// Flatten all pages into a single array of products
	const products: IProduct[] =
		infiniteQuery.data?.pages.flatMap((page) => page.products) || [];

	// Deduplicate by productNumber
	const uniqueProducts = products.filter(
		(product, index, self) =>
			index ===
			self.findIndex((p) => p.productNumber === product.productNumber),
	);

	// Categories are query-scoped, so we take them from the first loaded page.
	// Empty array (not undefined) once data has arrived, to distinguish
	// "loaded with no categories" from "still loading".
	const categories: InferredCategory[] =
		infiniteQuery.data?.pages[0]?.categories ?? [];

	// First-page metrics are authoritative for the current query; later pages
	// echo the same values. Prefer BE-supplied `totalFamilies` / `totalItems`
	// (exact) over `totalPages * pageSize` (ceiling approximation).
	const firstPage = infiniteQuery.data?.pages[0];
	const totalPages = firstPage?.totalPages ?? 0;
	const totalFamilies = firstPage?.totalFamilies;
	const totalItems = firstPage?.totalItems;

	return {
		products: uniqueProducts,
		categories,
		totalPages,
		totalFamilies,
		totalItems,
		pageSize,
		isLoading: infiniteQuery.isLoading && !infiniteQuery.data,
		isFetching: infiniteQuery.isFetching,
		isFetchingNextPage: infiniteQuery.isFetchingNextPage,
		hasNextPage: infiniteQuery.hasNextPage,
		fetchNextPage: infiniteQuery.fetchNextPage,
		refetch: infiniteQuery.refetch,
		error: infiniteQuery.error,
	};
}
