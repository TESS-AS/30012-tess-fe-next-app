import { getOpenConfirmations } from "@/services/orders.service";
import {
	OpenOrderConfirmation,
	OpenOrderConfirmationRaw,
} from "@/types/orders.types";
import { useQuery } from "@tanstack/react-query";

export const openConfirmationsKeys = {
	all: ["openConfirmations"] as const,
	lists: () => [...openConfirmationsKeys.all, "list"] as const,
	list: (page: number, limit: number, search: string) =>
		[...openConfirmationsKeys.lists(), { page, limit, search }] as const,
};

/**
 * Transforms raw API order data into the format expected by the component
 */
function transformOrderData(
	rawOrder: OpenOrderConfirmationRaw,
): OpenOrderConfirmation {
	// Count total differences - now differences is a direct array
	const totalDifferences = rawOrder.differences?.length || 0;

	// Determine status based on differences and status field
	// status 400 means "Differences found during comparison" = "Venter godkjenning"
	let status: "Venter godkjenning" | "Godkjent" | "Avvist" =
		"Venter godkjenning";
	if (totalDifferences === 0 || rawOrder.status !== 400) {
		status = "Godkjent";
	}

	// Format date from ISO string to DD.MM.YYYY, HH:mm format
	const formatDate = (isoString: string): string => {
		const date = new Date(isoString);
		const day = String(date.getDate()).padStart(2, "0");
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const year = date.getFullYear();
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		return `${day}.${month}.${year}, ${hours}:${minutes}`;
	};

	// Use timestamp field for the date, or fallback to createDateTime
	const date = rawOrder.timestamp
		? formatDate(rawOrder.timestamp)
		: formatDate(rawOrder.createDateTime);

	// Use supplierNumber as supplier identifier
	const supplier = `Leverandør ${rawOrder.supplierNumber}`;

	return {
		orderId: String(rawOrder.orderNumber),
		openConfirmationId: rawOrder.openConfirmationId,
		supplier,
		date,
		deviation: totalDifferences,
		status,
		handled: rawOrder.handler || null,
	};
}

export function useGetOpenConfirmations(
	page: number = 1,
	limit: number = 25,
	enabled: boolean = true,
	search: string = "",
) {
	const trimmedSearch = search.trim();
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: openConfirmationsKeys.list(page, limit, trimmedSearch),
		queryFn: async () => {
			const response = await getOpenConfirmations(
				page,
				limit,
				trimmedSearch || undefined,
			);
			return {
				orders: (response.data || []).map(transformOrderData),
				totalCount: response.totalCount,
			};
		},
		enabled,
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10, // 10 minutes
		refetchOnWindowFocus: false,
		refetchOnMount: true,
		placeholderData: (previousData) => previousData,
	});

	return {
		data: data?.orders ?? [],
		totalCount: data?.totalCount,
		isLoading,
		error,
		refetch,
	};
}
