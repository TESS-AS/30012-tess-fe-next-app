export type ColumnKey =
	| "image"
	| "itemNumber"
	| "unspsc"
	| "contentUnit"
	| "price"
	| "quantity"
	| "warehouse"
	| "cart";

export const lockedCols: ColumnKey[] = ["itemNumber", "quantity", "cart"];

export const columnLabels: Record<ColumnKey, string> = {
	image: "BILDE",
	itemNumber: "VARENUMMER",
	unspsc: "UNSPSC",
	contentUnit: "ENHET",
	price: "PRIS",
	quantity: "ANTALL",
	warehouse: "TILGJENGELIGHET",
	cart: "HANDLEKURV",
};

export const dropdownOrder: ColumnKey[] = [
	"itemNumber",
	"quantity",
	"cart",
	"price",
	"image",
	"unspsc",
	"contentUnit",
	"warehouse",
];
