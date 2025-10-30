import { getRequisition } from "@/services/requisitions.service";
import { formatNorwegianCurrency } from "@/utils/formatCurrency";
import { useQuery } from "@tanstack/react-query";

type Status = "Alle" | "Venter godkjenning" | "Godkjent" | "Avvist";

interface OrderItem {
	name: string;
	sku: string;
	quantity: number;
	price: string;
}

export interface Rekvisisjon {
	orderId: string;
	bestiller: string;
	fullName: string;
	opprettet: string;
	pris: string;
	status: Status;
	items: OrderItem[];
	requisitionId: number;
	requestDate: string;
	requestTime: string;
	description: string;
}

const mapApiStatus = (apiStatus: string): Status => {
	switch (apiStatus.toLowerCase()) {
		case "awaiting":
			return "Venter godkjenning";
		case "closed":
			return "Godkjent";
		case "rejected":
			return "Avvist";
		default:
			return "Venter godkjenning";
	}
};

const mapStatusToApi = (status: string): string | undefined => {
	switch (status) {
		case "Alle":
			return undefined;
		case "Venter godkjenning":
			return "awaiting";
		case "Godkjent":
			return "approved";
		case "Avvist":
			return "rejected";
		default:
			return undefined;
	}
};

export const requisitionsKeys = {
	all: ["requisitions"] as const,
	lists: () => [...requisitionsKeys.all, "list"] as const,
	list: (customerNumber: string, status?: string) =>
		[...requisitionsKeys.lists(), customerNumber, status] as const,
};

export const useRequisitions = (customerNumber: string, status?: string) => {
	const {
		data: requisitions = [],
		isLoading: loading,
		error,
		refetch: getRequisitions,
	} = useQuery({
		queryKey: requisitionsKeys.list(customerNumber, status),
		queryFn: async () => {
			const apiStatus = mapStatusToApi(status || "Alle");
			const response = await getRequisition(customerNumber, apiStatus);
			const transformedRequisitions = response.map((req) => ({
				orderId: req.requisitionId.toString(),
				bestiller: req.fullName,
				opprettet: req.requestDate,
				pris: formatNorwegianCurrency(req.totalPrice) || "N/A",
				status: mapApiStatus(req.status),
				items: req.requisitionLines.map((line) => ({
					name: `Item ${line.itemId}`,
					sku: line.itemId.toString(),
					quantity: line.quantity,
					price: formatNorwegianCurrency(line.unitPrice) || "N/A",
				})),
				requisitionId: req.requisitionId,
				requestDate: req.requestDate,
				requestTime: req.requestTime,
				description: req.description,
			}));
			return transformedRequisitions;
		},
		enabled: !!customerNumber,
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 10,
	});

	return { requisitions, loading, error, getRequisitions };
};
