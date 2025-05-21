import { Media } from "./carts.types";

export interface IProduct {
	productName: string;
	mediaM: string;
	productNumber: string;
	shortDesc?: string;
}

export interface IVariation {
	itemId: number;
	itemNumber: string;
	parentProdNumber: string;
	mediaId: Media[];
	contentUnit: string;
	unspsc: string;
}

export interface IAttribute {
	attributeIdentifier: string;
	dataType: string;
	language: string;
	name: string;
	nameKeyLanguage: string;
	valueDef: string;
	value_max: string;
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
