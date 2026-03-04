import type { OrderLineField } from "@/app/[locale]/profile/(components)/order-line-table";
import { getOpenOrderLines } from "@/services/orders.service";
import type { OpenOrderLineItemResponse } from "@/types/orders.types";
import { useQuery } from "@tanstack/react-query";

export const openOrderLinesKeys = {
	all: ["openOrderLines"] as const,
	detail: (orderNumber: string) =>
		[...openOrderLinesKeys.all, "detail", orderNumber] as const,
};

/** Parse differences string (JSON) into fields for the UI */
function parseDifferencesToFields(differences: string): OrderLineField[] {
	if (!differences || typeof differences !== "string") return [];
	const trimmed = differences.trim();
	if (!trimmed) return [];
	try {
		const parsed = JSON.parse(trimmed) as unknown;
		// Array of { field/label, ordered/bestilt, confirmed/bekreftet }
		if (Array.isArray(parsed)) {
			return parsed.map((item: Record<string, unknown>) => {
				const key = String(item.field ?? item.key ?? item.label ?? "");
				const label =
					key.charAt(0).toUpperCase() +
					key
						.slice(1)
						.replace(/([A-Z])/g, " $1")
						.trim();
				const bestilt = String(
					item.ordered ?? item.bestilt ?? item.requested ?? "",
				);
				const bekreftet = String(
					item.confirmed ?? item.bekreftet ?? item.received ?? "",
				);
				return { key: key || label, label: label || key, bestilt, bekreftet };
			});
		}
		// Object: key -> { ordered, confirmed } or { bestilt, bekreftet }
		if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
			return Object.entries(
				parsed as Record<string, Record<string, unknown>>,
			).map(([key, val]) => {
				const obj = val && typeof val === "object" ? val : {};
				const bestilt = String(
					obj.ordered ?? obj.bestilt ?? obj.requested ?? "",
				);
				const bekreftet = String(
					obj.confirmed ?? obj.bekreftet ?? obj.received ?? "",
				);
				const label =
					key.charAt(0).toUpperCase() +
					key
						.slice(1)
						.replace(/([A-Z])/g, " $1")
						.trim();
				return { key, label, bestilt, bekreftet };
			});
		}
	} catch {
		// ignore parse errors
	}
	return [];
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
): OrderDetailView {
	const lines = rawLines.map((item, index) => {
		const lineNum =
			parseInt(String(item.dbOrderLine?.orderLineNumber ?? ""), 10) ||
			index + 1;
		const fields = parseDifferencesToFields(item.differences ?? "");
		// If differences string didn't parse, build fields from dbOrderLine vs incomingLines
		const fieldList =
			fields.length > 0
				? fields
				: buildFieldsFromDbOrderLine(item.dbOrderLine, item.incomingLines);
		return {
			lineNumber: lineNum,
			deviationCount: Math.max(1, fieldList.length),
			fields: fieldList,
		};
	});
	return {
		orderId: orderNumber,
		supplier: "—",
		date: "—",
		lines,
	};
}

/** Fallback: build fields from dbOrderLine keys when differences is empty or not parseable */
function buildFieldsFromDbOrderLine(
	dbOrderLine: OpenOrderLineItemResponse["dbOrderLine"],
	incomingLines: string,
): OrderLineField[] {
	if (!dbOrderLine) return [];
	let incoming: Record<string, string> = {};
	try {
		if (incomingLines?.trim()) {
			const parsed = JSON.parse(incomingLines) as unknown;
			if (parsed && typeof parsed === "object")
				incoming = parsed as Record<string, string>;
		}
	} catch {
		// ignore
	}
	const labels: Record<string, string> = {
		orderLineNumber: "Linjenummer",
		quantity: "Antall",
		unit: "Enhet",
		netPrice: "Nettopris",
		lineStatus: "Linjestatus",
		lineSum: "Linesum",
		shipmentDate: "Leveringsdato",
		arrivalDate: "Ankomstdato",
		itemNumber: "Varenummer",
	};
	return Object.entries(dbOrderLine).map(([key, value]) => ({
		key,
		label: labels[key] ?? key,
		bestilt: String(value ?? ""),
		bekreftet: String(incoming[key] ?? ""),
	}));
}

export function useGetOpenOrderLines(
	orderNumber: string | undefined,
	enabled = true,
) {
	const {
		data: rawLines,
		isLoading,
		error,
	} = useQuery({
		queryKey: openOrderLinesKeys.detail(orderNumber ?? ""),
		queryFn: () => getOpenOrderLines(orderNumber!),
		enabled: !!orderNumber && enabled,
		staleTime: 1000 * 60 * 2,
	});

	const order =
		rawLines !== undefined && orderNumber
			? transformToDetailView(orderNumber, rawLines)
			: null;

	return { data: order, raw: rawLines, isLoading, error };
}
