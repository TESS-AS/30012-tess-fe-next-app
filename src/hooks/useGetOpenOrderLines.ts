import type { OrderLineField } from "@/app/[locale]/profile/(components)/order-line-table";
import { getOpenOrderLines } from "@/services/orders.service";
import type {
	OpenOrderLineItemResponse,
	OrderLineMismatch,
} from "@/types/orders.types";
import { useQuery } from "@tanstack/react-query";

export const openOrderLinesKeys = {
	all: ["openOrderLines"] as const,
	detail: (orderNumber: string) =>
		[...openOrderLinesKeys.all, "detail", orderNumber] as const,
};

/** Convert a mismatches map (field -> {database, incoming}) into UI fields. */
function mismatchesToFields(
	mismatches: Record<string, OrderLineMismatch>,
): OrderLineField[] {
	const fields: OrderLineField[] = [];
	for (const [key, val] of Object.entries(mismatches)) {
		const label =
			key.charAt(0).toUpperCase() +
			key.slice(1).replace(/([A-Z])/g, " $1").trim();
		fields.push({
			key,
			label,
			bestilt: String(val?.database ?? ""),
			bekreftet: String(val?.incoming ?? ""),
		});
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
	// The API may return either one entry per dbOrderLine or a single object whose
	// `differences` array spans every orderLineNumber for the order. Either way, the
	// mismatches' own `orderLineNumber` is the source of truth — group by it.
	const mismatchesByLine = new Map<number, Record<string, OrderLineMismatch>>();
	const lineNumbers = new Set<number>();

	for (const item of rawLines) {
		const dbLineNum = Number(item.dbOrderLine?.orderLineNumber);
		if (Number.isFinite(dbLineNum)) lineNumbers.add(dbLineNum);

		for (const diff of item.differences ?? []) {
			const num = Number(diff?.orderLineNumber);
			if (!Number.isFinite(num)) continue;
			if (!diff.mismatches || typeof diff.mismatches !== "object") continue;
			lineNumbers.add(num);
			const existing = mismatchesByLine.get(num) ?? {};
			mismatchesByLine.set(num, { ...existing, ...diff.mismatches });
		}
	}

	const lines = Array.from(lineNumbers)
		.sort((a, b) => a - b)
		.map((lineNumber) => {
			const fieldList = mismatchesToFields(mismatchesByLine.get(lineNumber) ?? {});
			return {
				lineNumber,
				deviationCount: fieldList.length,
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
