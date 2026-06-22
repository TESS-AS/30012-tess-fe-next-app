import { buildOrderDetailView } from "@/lib/open-order-lines";
import { getOpenOrderLines } from "@/services/orders.service";
import { useQuery } from "@tanstack/react-query";

export type { OrderDetailView } from "@/lib/open-order-lines";

export const openOrderLinesKeys = {
	all: ["openOrderLines"] as const,
	detail: (orderNumber: string) =>
		[...openOrderLinesKeys.all, "detail", orderNumber] as const,
};

export function useGetOpenOrderLines(
	orderNumber: string | undefined,
	enabled = true,
) {
	const {
		data: rawData,
		isLoading,
		error,
	} = useQuery({
		queryKey: openOrderLinesKeys.detail(orderNumber ?? ""),
		queryFn: () => getOpenOrderLines(orderNumber!),
		enabled: !!orderNumber && enabled,
		staleTime: 1000 * 60 * 2,
	});

	const order =
		rawData !== undefined && orderNumber
			? buildOrderDetailView(orderNumber, rawData.lines, {
					supplier: rawData.supplier,
					date: rawData.date,
				})
			: null;

	return { data: order, raw: rawData, isLoading, error };
}
