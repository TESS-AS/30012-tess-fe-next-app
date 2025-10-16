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
	image: "Bilde",
	itemNumber: "Varenummer",
	unspsc: "UNSPSC",
	contentUnit: "Enhet",
	price: "Pris",
	quantity: "Antall",
	warehouse: "Lager",
	cart: "Handlekurv",
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
