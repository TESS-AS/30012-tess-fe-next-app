import { getOpenConfirmations } from "@/services/orders.service";
import {
	OpenOrderConfirmation,
	OpenOrderConfirmationRaw,
} from "@/types/orders.types";
import { useQuery } from "@tanstack/react-query";

export const openConfirmationsKeys = {
	all: ["openConfirmations"] as const,
	lists: () => [...openConfirmationsKeys.all, "list"] as const,
	list: () => [...openConfirmationsKeys.lists()] as const,
};

/**
 * Transforms raw API order data into the format expected by the component
 */
function transformOrderData(
	rawOrder: OpenOrderConfirmationRaw,
): OpenOrderConfirmation {
	// Count total differences across all difference entries
	const totalDifferences = rawOrder.differences.reduce(
		(acc, diff) => acc + (diff.differences?.length || 0),
		0,
	);

	// Determine status based on differences
	// If there are differences with status 400, it's "Venter godkjenning"
	// For now, we'll use "Venter godkjenning" if there are any differences
	// Note: The API doesn't provide explicit status, so we assume pending if differences exist
	let status: "Venter godkjenning" | "Godkjent" | "Avvist" =
		"Venter godkjenning";
	if (totalDifferences === 0) {
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

	// Get the most recent difference timestamp for the date, or use createDateTime
	const latestDifference = rawOrder.differences.sort(
		(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
	)[0];

	const date = latestDifference
		? formatDate(latestDifference.timestamp)
		: formatDate(rawOrder.createDateTime);

	// Use supplierNumber as supplier identifier
	// The API response shows supplierNumber like "738100", "741580", "755160"
	const supplier = `Leverandør ${rawOrder.supplierNumber}`;

	return {
		orderId: String(rawOrder.orderNumber),
		supplier,
		date,
		deviation: totalDifferences,
		status,
		handled: null, // API doesn't provide this field
	};
}

export function useGetOpenConfirmations(enabled: boolean = true) {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: openConfirmationsKeys.list(),
		queryFn: async () => {
			const response = await getOpenConfirmations();
			// Transform the raw orders array to match component expectations
			return (response.orders || []).map(transformOrderData);
		},
		enabled,
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10, // 10 minutes
		refetchOnWindowFocus: false,
		refetchOnMount: true,
	});

	return {
		data: (data as OpenOrderConfirmation[]) || [],
		isLoading,
		error,
		refetch,
	};
}
