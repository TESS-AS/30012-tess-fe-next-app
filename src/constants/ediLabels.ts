/**
 * Norwegian labels for EDI open-order field keys.
 *
 * The BE (`/edi/order/openOrders/lines/...`) emits camelCase keys on both
 * `differences[].mismatches` and `incomingLines[]`. Add new keys here as they
 * appear — unknown keys fall through to the auto-humanize path in
 * `buildOrderDetailView` and render in English (`netPrice` → "Net Price").
 *
 * Owner: check with Mathias when introducing new labels for consistency.
 */
export const EDI_FIELD_LABELS_NO: Record<string, string> = {
	unit: "Enhet",
	lineSum: "Linjesum",
	netPrice: "Nettopris",
	quantity: "Antall",
	lineStatus: "Linjestatus",
	arrivalDate: "Ankomstdato",
	shipmentDate: "Forsendelsesdato",
	globalItemNumber: "GTIN",
	supplierItemNumber: "Leverandørens varenummer",
	// Mismatches use `itemCode`; incoming lines use `itemNumber` — both are the
	// TESS item number, so map both to the same label.
	itemNumber: "TESS varenummer",
	itemCode: "TESS varenummer",
};
