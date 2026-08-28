import type { OrderLineField } from "@/app/[locale]/profile/(components)/order-line-table";
import type {
	IncomingLineItem,
	OpenOrderLineItemResponse,
	OrderLineMismatch,
} from "@/types/orders.types";

export type OrderDetailLine = {
	/** Unique per row. Same `lineNumber` may appear multiple times when the
	 *  incoming EDI splits one PO line across multiple shipments — each carries
	 *  its own differences entry and must render as its own card. */
	id: string;
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
 * The API may emit multiple `differences[]` entries for the same
 * `orderLineNumber` when the supplier splits one PO line across several
 * shipments — each carries its own mismatches (e.g. two different
 * `shipmentDate` values). Emit one row per differences entry so they render
 * as separate cards; merging them by lineNumber would silently drop the
 * second shipment's data.
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
	const emitted: OrderDetailLine[] = [];
	const dbLineNumbers = new Set<number>();
	const seenLineNumbers = new Set<number>();
	const counters = new Map<number, number>();

	const nextId = (lineNumber: number) => {
		const n = (counters.get(lineNumber) ?? 0) + 1;
		counters.set(lineNumber, n);
		return `${lineNumber}-${n}`;
	};

	for (const item of rawLines) {
		const dbLineNum = Number(item.dbOrderLine?.orderLineNumber);
		if (Number.isFinite(dbLineNum)) dbLineNumbers.add(dbLineNum);

		for (const diff of item.differences ?? []) {
			const lineNumber = Number(diff?.orderLineNumber);
			if (!Number.isFinite(lineNumber)) continue;
			if (!diff.mismatches || typeof diff.mismatches !== "object") continue;

			const incoming = (diff.mismatches as Record<string, unknown>).incomingLine;
			if (isIncomingLine(incoming)) {
				const fieldList = incomingLineToFields(
					incoming as unknown as Record<string, unknown>,
				);
				emitted.push({
					id: nextId(lineNumber),
					lineNumber,
					deviationCount: fieldList.length,
					fields: fieldList,
					kind: "extraLine",
				});
				seenLineNumbers.add(lineNumber);
				continue;
			}

			const fieldMismatches: Record<string, OrderLineMismatch> = {};
			for (const [key, val] of Object.entries(diff.mismatches)) {
				if (isFieldMismatch(val)) fieldMismatches[key] = val;
			}
			if (Object.keys(fieldMismatches).length === 0) continue;

			const fieldList = mismatchesToFields(fieldMismatches);
			emitted.push({
				id: nextId(lineNumber),
				lineNumber,
				deviationCount: fieldList.length,
				fields: fieldList,
				kind: "fieldMismatch",
			});
			seenLineNumbers.add(lineNumber);
		}
	}

	for (const lineNumber of dbLineNumbers) {
		if (seenLineNumbers.has(lineNumber)) continue;
		emitted.push({
			id: nextId(lineNumber),
			lineNumber,
			deviationCount: 0,
			fields: [],
			kind: "fieldMismatch",
		});
	}

	emitted.sort((a, b) => {
		if (a.lineNumber !== b.lineNumber) return a.lineNumber - b.lineNumber;
		return a.id.localeCompare(b.id);
	});

	const firstDb = rawLines[0]?.dbOrderLine;
	const dateFallback = firstDb?.shipmentDate || firstDb?.arrivalDate || "—";

	return {
		orderId: orderNumber,
		supplier: options?.supplier ?? "—",
		date: options?.date ?? dateFallback,
		lines: emitted,
	};
}
