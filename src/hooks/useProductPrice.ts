import { getProductPrice } from "@/services/product.service";
import { useQuery } from "@tanstack/react-query";

interface UseProductPriceProps {
	productNumber: string;
	customerNumber?: string;
	companyNumber?: string;
	warehouseNumber?: string;
	enabled?: boolean;
}

export function useProductPrice({
	productNumber,
	customerNumber = "169999",
	companyNumber = "01",
	warehouseNumber = "L01",
	enabled = true,
}: UseProductPriceProps) {
	const query = useQuery({
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
			return minPrice as number | undefined;
		},
		enabled: enabled && !!productNumber,
		staleTime: 5 * 60 * 1000, // 5 minutes - prices don't change often
		gcTime: 10 * 60 * 1000, // 10 minutes
		retry: 1,
	});

	return {
		price: query.data,
		isLoading: query.isLoading,
		isFetching: query.isFetching,
		error: query.error,
	};
}
