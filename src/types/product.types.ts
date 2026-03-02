import { Media } from "./carts.types";

export interface IProduct {
	productName: string;
	mediaM: string;
	productNumber: string;
	shortDesc?: string;
	price?: number;
	searchAttribute1?: string | null;
	searchAttribute2?: string | null;
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
