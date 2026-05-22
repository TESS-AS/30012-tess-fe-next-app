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
	cart: "LEGG TIL I HANDLEKURV",
};

export const columnHeaderLabels: Record<ColumnKey, string> = {
	image: "BILDE",
	itemNumber: "VARE-\nNUMMER",
	unspsc: "UNSPSC",
	contentUnit: "ENHET",
	price: "PRIS",
	quantity: "ANTALL",
	warehouse: "TILGJENGE-\nLIGHET",
	cart: "LEGG TIL I\nHANDLEKURV",
};

export const dropdownOrder: ColumnKey[] = [
	"itemNumber",
	"image",
	"unspsc",
	"contentUnit",
	"price",
	"quantity",
	"cart",
	"warehouse",
];
