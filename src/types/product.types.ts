export interface IProduct {
	product_name: string;
	media_m: string;
	product_number: string;
}

export interface IVariation {
	item_id: number;
	item_number: string;
	parent_prod_number: string;
	media_id: string;
	content_unit: string;
	unspsc: string;
}

export interface IAttribute {
	attribute_identifier: string;
	data_type: string;
	language: string;
	name: string;
	name_key_language: string;
	value_def: string;
	value_max: string;
}

export interface IProductDetails {
	product_number: string;
	product_name: string;
	product_name_en: string;
	application_en: string;
	application_no: string;
	users_en: string;
	users_no: string;
	technical_info_en: string;
	technical_info_no: string;
	remarks_en: string;
	remarks_no: string;
	short_desc_en: string;
	short_desc_no: string;
	usp: string[];
	bvp: string[];
	media_id: string[];
	attributes: IAttribute[];
	product_to_product_reference: string | [];
	items: IVariation[];
}
