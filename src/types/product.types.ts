import { Media } from "./carts.types";

export interface IProduct {
	productName: string;
	/** Specific variant name when BE has narrowed to one (e.g. via a query
	 *  that matched a particular item). Shown in the Varenavn row on product
	 *  cards; falls back to productName when absent. */
	itemName?: string | null;
	/** Specific variant number for the narrowed item. Mirrors the itemNumber
	 *  inside the `redirect` URL. Shown in the Varenummer row on product
	 *  cards; falls back to productNumber when absent. */
	itemNumber?: string | null;
	mediaM: string;
	productNumber: string;
	shortDesc?: string;
	price?: number;
	searchAttribute1?: string | null;
	searchAttribute2?: string | null;
	/** BE-supplied variant hint on /searchList results. When the user's
	 *  search/filter narrows to a specific variant within a parent product,
	 *  BE returns a relative URL string like `/P_1907361?itemNumber=AK7012205-L`
	 *  so the FE can navigate straight to that variant on the product detail
	 *  page. Parse via `new URL(redirect, origin)` — we only consume the
	 *  `?itemNumber` param, not the path (we already have the product's
	 *  canonical route from the current listing context). `null` / absent =
	 *  no specific variant matched, land on the product's default variant. */
	redirect?: string | null;
}

export interface IVariation {
	itemId: number;
	itemNumber: string;
	parentProdNumber: string;
	mediaId: Media[];
	contentUnit: string;
	unspsc: string;
}

/** API (columnAttributes itemRelatedProducts) uses camelCase; other sources may use snake_case */
export interface IRelatedProductRaw {
	product_name_no?: string;
	product_number?: string;
	productName?: string;
	productNumber?: string;
	short_desc_no?: string;
	media_id?: {
		url: string;
		filename: string;
		picture_type: string;
		thumbnail_url?: string;
	}[];
	mediaId?: {
		url: string;
		filename: string;
		picture_type: string;
		thumbnail_url?: string;
	}[];
}

export interface IAttribute {
	attributeIdentifier: string;
	dataType: string;
	language: string;
	name: string;
	nameKeyLanguage: string;
	valueDef: string;
	value_max: string;
	value_def?: string;
}

export interface IProductDetails {
	productNumber: string;
	productName: string;
	productNameEn: string;
	applicationEn: string;
	applicationNo: string;
	usersEn: string;
	usersNo: string;
	technicalInfoEn: string;
	technicalInfoNo: string;
	remarksEn: string;
	remarksNo: string;
	shortDescEn: string;
	shortDescNo: string;
	usp: string[];
	bvp: string[];
	mediaId: string[];
	attributes: IAttribute[];
	productToProductReference: string | [];
	items: IVariation[];
}
