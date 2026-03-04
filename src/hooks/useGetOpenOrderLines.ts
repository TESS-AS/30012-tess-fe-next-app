import type { OrderLineField } from "@/app/[locale]/profile/(components)/order-line-table";
import { getOpenOrderLines } from "@/services/orders.service";
import type {
	OpenOrderLineItemResponse,
	OrderLineDifference,
} from "@/types/orders.types";
import { useQuery } from "@tanstack/react-query";

export const openOrderLinesKeys = {
	all: ["openOrderLines"] as const,
	detail: (orderNumber: string) =>
		[...openOrderLinesKeys.all, "detail", orderNumber] as const,
};

/** Build UI fields from API differences array (mismatches: database -> bestilt, incoming -> bekreftet) */
function differencesToFields(differences: OrderLineDifference[]): OrderLineField[] {
	if (!Array.isArray(differences)) return [];
	const fields: OrderLineField[] = [];
	for (const diff of differences) {
		const mismatches = diff.mismatches;
		if (!mismatches || typeof mismatches !== "object") continue;
		for (const [key, val] of Object.entries(mismatches)) {
			const m = val as { database?: string; incoming?: string };
			const label =
				key.charAt(0).toUpperCase() +
				key.slice(1).replace(/([A-Z])/g, " $1").trim();
			fields.push({
				key,
				label,
				bestilt: String(m?.database ?? ""),
				bekreftet: String(m?.incoming ?? ""),
			});
		}
	}
	return fields;
}

export type OrderDetailView = {
	orderId: string;
	supplier: string;
	date: string;
	lines: Array<{
		lineNumber: number;
		deviationCount: number;
		fields: OrderLineField[];
	}>;
};

function transformToDetailView(
	orderNumber: string,
	rawLines: OpenOrderLineItemResponse[],
	options?: { supplier?: string; date?: string },
): OrderDetailView {
	const lines = rawLines.map((item, index) => {
		const db = item.dbOrderLine;
		const lineNum =
			typeof db?.orderLineNumber === "number"
				? db.orderLineNumber
				: parseInt(String(db?.orderLineNumber ?? ""), 10) || index + 1;
		const fieldList = differencesToFields(item.differences ?? []);
		return {
			lineNumber: lineNum,
			deviationCount: Math.max(1, fieldList.length),
			fields: fieldList,
		};
	});

	const firstDb = rawLines[0]?.dbOrderLine;
	const dateFallback =
		firstDb?.shipmentDate || firstDb?.arrivalDate || "—";

	return {
		orderId: orderNumber,
		supplier: options?.supplier ?? "—",
		date: options?.date ?? dateFallback,
		lines,
	};
}

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
			? transformToDetailView(orderNumber, rawData.lines, {
					supplier: rawData.supplier,
					date: rawData.date,
				})
			: null;

	return { data: order, raw: rawData, isLoading, error };
}
