import type { OrderLineField } from "@/app/[locale]/profile/(components)/order-line-table";
import type {
	IncomingLineItem,
	OpenOrderLineItemResponse,
	OrderLineMismatch,
} from "@/types/orders.types";

export type OrderDetailLine = {
	lineNumber: number;
	deviationCount: number;
	fields: OrderLineField[];
	kind: "fieldMismatch" | "extraLine";
};

export type OrderDetailView = {
	orderId: string;
	supplier: string;
	date: string;
	lines: OrderDetailLine[];
};

const humanizeKey = (key: string) =>
	key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1").trim();

/** Convert a mismatches map (field -> {database, incoming}) into UI fields. */
export function mismatchesToFields(
	mismatches: Record<string, OrderLineMismatch>,
): OrderLineField[] {
	const fields: OrderLineField[] = [];
	for (const [key, val] of Object.entries(mismatches)) {
		fields.push({
			key,
			label: humanizeKey(key),
			bestilt: String(val?.database ?? ""),
			bekreftet: String(val?.incoming ?? ""),
		});
	}
	return fields;
}

/** Convert an "extra line" incoming payload into UI fields with an empty Bestilt side. */
function incomingLineToFields(incoming: Record<string, unknown>): OrderLineField[] {
	const skip = new Set(["orderLineNumber"]);
	const fields: OrderLineField[] = [];
	for (const [key, val] of Object.entries(incoming)) {
		if (skip.has(key)) continue;
		fields.push({
			key,
			label: humanizeKey(key),
			bestilt: "—",
			bekreftet: val == null ? "" : String(val),
		});
	}
	return fields;
}

const isFieldMismatch = (val: unknown): val is OrderLineMismatch =>
	typeof val === "object" &&
	val !== null &&
	"database" in val &&
	"incoming" in val;

const isIncomingLine = (val: unknown): val is IncomingLineItem =>
	typeof val === "object" && val !== null && !Array.isArray(val);

/**
 * Build a per-line view from raw EDI open-order response items.
 *
 * Why: the API may return either one entry per dbOrderLine, or a single object
 * whose `differences` array spans every orderLineNumber for the order. Either
 * way the source of truth for which line a mismatch belongs to is the
 * mismatch's own `orderLineNumber` — group by it.
 *
 * A line can be flagged as an "extra line" (present in the incoming EDI but
 * not in the original PO) when the mismatch payload carries an `incomingLine`
 * object instead of `{database, incoming}` field diffs.
 */
export function buildOrderDetailView(
	orderNumber: string,
	rawLines: OpenOrderLineItemResponse[],
	options?: { supplier?: string; date?: string },
): OrderDetailView {
	const mismatchesByLine = new Map<number, Record<string, OrderLineMismatch>>();
	const extraLineByLine = new Map<number, Record<string, unknown>>();
	const lineNumbers = new Set<number>();

	for (const item of rawLines) {
		const dbLineNum = Number(item.dbOrderLine?.orderLineNumber);
		if (Number.isFinite(dbLineNum)) lineNumbers.add(dbLineNum);

		for (const diff of item.differences ?? []) {
			const num = Number(diff?.orderLineNumber);
			if (!Number.isFinite(num)) continue;
			if (!diff.mismatches || typeof diff.mismatches !== "object") continue;
			lineNumbers.add(num);

			const incoming = (diff.mismatches as Record<string, unknown>).incomingLine;
			if (isIncomingLine(incoming)) {
				extraLineByLine.set(num, incoming as unknown as Record<string, unknown>);
				continue;
			}

			const fieldMismatches: Record<string, OrderLineMismatch> = {};
			for (const [key, val] of Object.entries(diff.mismatches)) {
				if (isFieldMismatch(val)) fieldMismatches[key] = val;
			}
			if (Object.keys(fieldMismatches).length === 0) continue;
			const existing = mismatchesByLine.get(num) ?? {};
			mismatchesByLine.set(num, { ...existing, ...fieldMismatches });
		}
	}

	const lines: OrderDetailLine[] = Array.from(lineNumbers)
		.sort((a, b) => a - b)
		.map((lineNumber) => {
			const extra = extraLineByLine.get(lineNumber);
			if (extra) {
				const fieldList = incomingLineToFields(extra);
				return {
					lineNumber,
					deviationCount: fieldList.length,
					fields: fieldList,
					kind: "extraLine" as const,
				};
			}
			const fieldList = mismatchesToFields(mismatchesByLine.get(lineNumber) ?? {});
			return {
				lineNumber,
				deviationCount: fieldList.length,
				fields: fieldList,
				kind: "fieldMismatch" as const,
			};
		});

	const firstDb = rawLines[0]?.dbOrderLine;
	const dateFallback = firstDb?.shipmentDate || firstDb?.arrivalDate || "—";

	return {
		orderId: orderNumber,
		supplier: options?.supplier ?? "—",
		date: options?.date ?? dateFallback,
		lines,
	};
}
