import { searchProducts } from "@/services/product.service";
import { FilterValues } from "@/types/filter.types";
import { IProduct } from "@/types/product.types";
import { useInfiniteQuery } from "@tanstack/react-query";

interface UseProductInfiniteQueryProps {
	categoryNumber: string | null;
	query: string | null;
	filters: FilterValues[] | null;
	sort: string | null;
	pageSize?: number;
	enabled?: boolean;
}

interface ProductPage {
	products: IProduct[];
	hasMore: boolean;
	page: number;
}

export function useProductInfiniteQuery({
	categoryNumber,
	query,
	filters,
	sort,
	pageSize = 9,
	enabled = true,
}: UseProductInfiniteQueryProps) {
	const infiniteQuery = useInfiniteQuery({
		queryKey: ["products", categoryNumber, query, filters, sort, pageSize],
		queryFn: async ({ pageParam = 1 }): Promise<ProductPage> => {
			const response = await searchProducts(
				pageParam,
				pageSize,
				query,
				categoryNumber,
				filters,
				sort,
			);

			return {
				products: response.product || [],
				hasMore: (response.product?.length || 0) === pageSize,
				page: pageParam,
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

	return {
		products: uniqueProducts,
		isLoading: infiniteQuery.isLoading && !infiniteQuery.data,
		isFetching: infiniteQuery.isFetching,
		isFetchingNextPage: infiniteQuery.isFetchingNextPage,
		hasNextPage: infiniteQuery.hasNextPage,
		fetchNextPage: infiniteQuery.fetchNextPage,
		refetch: infiniteQuery.refetch,
		error: infiniteQuery.error,
	};
}
