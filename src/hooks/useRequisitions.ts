import { useEffect, useState } from "react";

import { getRequisition } from "@/services/requisitions.service";
import { formatNorwegianCurrency } from "@/utils/formatCurrency";

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
		case "pending":
			return "Venter godkjenning";
		case "approved":
			return "Godkjent";
		case "rejected":
			return "Avvist";
		default:
			return "Venter godkjenning";
	}
};

export const useRequisitions = (customerNumber: string) => {
	const [requisitions, setRequisitions] = useState<Rekvisisjon[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const getRequisitions = async () => {
		setLoading(true);
		try {
			const response = await getRequisition(customerNumber);
			const transformedRequisitions = response.map((req) => ({
				orderId: req.requisitionId.toString(),
				bestiller: req.description,
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
			setRequisitions(transformedRequisitions);
		} catch (error) {
			setError(error as string);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getRequisitions();
	}, [customerNumber]);

	return { requisitions, loading, error, getRequisitions };
};
