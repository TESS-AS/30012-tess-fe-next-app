import { getProductPrice } from "@/services/product.service";
import { useQueries } from "@tanstack/react-query";

interface UseProductPricesProps {
	productNumbers: string[];
	customerNumber?: string;
	companyNumber?: string;
	warehouseNumber?: string;
	enabled?: boolean;
}

export function useProductPrices({
	productNumbers,
	customerNumber = "169999",
	companyNumber = "01",
	warehouseNumber = "L01",
	enabled = true,
}: UseProductPricesProps) {
	const queries = useQueries({
		queries: (productNumbers.length > 0 ? productNumbers : []).map(
			(productNumber) => ({
				queryKey: [
					"productPrice",
					productNumber,
					customerNumber,
					companyNumber,
					warehouseNumber,
				],
				queryFn: async () => {
					const priceData = await getProductPrice(
						customerNumber,
						companyNumber,
						productNumber,
						warehouseNumber,
					);
					// Get the minimum price from all variants (bestPrice)
					const prices = priceData.map(
						(p: any) => p.bestPrice || p.basePriceTotal || 0,
					);
					const minPrice =
						prices.length > 0
							? Math.min(...prices.filter((p: number) => p > 0))
							: undefined;
					return {
						productNumber,
						price: minPrice as number | undefined,
					};
				},
				enabled: enabled && !!productNumber,
				staleTime: 5 * 60 * 1000, // 5 minutes
				gcTime: 10 * 60 * 1000, // 10 minutes
				retry: 1,
			}),
		),
	});

	const pricesMap: Record<string, number> = {};
	const isLoading = queries.some((query) => query.isLoading);
	const isFetching = queries.some((query) => query.isFetching);

	queries.forEach((query) => {
		if (query.data) {
			pricesMap[query.data.productNumber] = query.data.price!;
		}
	});

	return {
		prices: pricesMap,
		isLoading,
		isFetching,
	};
}
