import { getRequisition } from "@/services/requisitions.service";
import type {
	PlacerAddress,
	RequisitionResponse,
	RequisitionType,
} from "@/types/requisitions";
import { formatNorwegianCurrency } from "@/utils/formatCurrency";
import { useQuery } from "@tanstack/react-query";

export type RequisitionStatus =
	| "Alle"
	| "Venter godkjenning"
	| "Godkjent"
	| "Avvist";

type Status = RequisitionStatus;

interface OrderItem {
	name: string;
	itemNumber: string;
	productNumber: string;
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
	requisitionType: RequisitionType | null;
	placerUserId: number | null;
	placerAddresses: PlacerAddress[];
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
	list: (
		customerNumber: string,
		status?: string,
		page?: number,
		pageSize?: number,
	) =>
		[
			...requisitionsKeys.lists(),
			customerNumber,
			status,
			page,
			pageSize,
		] as const,
};

interface UseRequisitionsResult {
	requisitions: Rekvisisjon[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

export const useRequisitions = (
	customerNumber: string,
	status?: string,
	page = 1,
	pageSize = 20,
) => {
	const {
		data,
		isLoading: loading,
		error,
		refetch: getRequisitions,
	} = useQuery<UseRequisitionsResult>({
		queryKey: requisitionsKeys.list(customerNumber, status, page, pageSize),
		queryFn: async () => {
			const apiStatus = mapStatusToApi(status || "Alle");
			const response = await getRequisition(
				customerNumber,
				apiStatus,
				page,
				pageSize,
			);
			const transformedRequisitions = response.requisitions.map(
				(req: RequisitionResponse) => ({
					orderId: req.description,
					bestiller: req.fullName,
					fullName: req.fullName,
					opprettet: req.requestDate,
					pris: formatNorwegianCurrency(req.totalPrice) || "N/A",
					status: mapApiStatus(req.status),
					items: req.requisitionLines.map(
						(line: RequisitionResponse["requisitionLines"][number]) => ({
							name: `${line.productName}`,
							itemNumber: line.itemNumber,
							productNumber: line.productNumber,
							sku: line.itemId.toString(),
							quantity: line.quantity,
							price: formatNorwegianCurrency(line.unitPrice) || "N/A",
						}),
					),
					requisitionId: req.requisitionId,
					requestDate: req.requestDate,
					requestTime: req.requestTime,
					description: req.description,
					requisitionType: req.requisitionType ?? null,
					placerUserId: req.placerUserId ?? null,
					placerAddresses: req.placerAddress ?? [],
				}),
			);
			return {
				requisitions: transformedRequisitions,
				total: response.total,
				page: response.page,
				pageSize: response.pageSize,
				totalPages: response.totalPages,
			};
		},
		enabled: !!customerNumber,
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 10,
	});

	return {
		requisitions: data?.requisitions ?? [],
		total: data?.total ?? 0,
		page: data?.page ?? page,
		pageSize: data?.pageSize ?? pageSize,
		totalPages: data?.totalPages ?? 0,
		loading,
		error,
		getRequisitions,
	};
};
