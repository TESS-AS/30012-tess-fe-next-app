export interface IItem {
    content_unit: string;
    item_id: number;
    item_number: string;
    media_id: IMedia[];
    parent_prod_number: string;
    unspsc: string;
}
  
export interface IProduct {
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
    usp: IUsp;
    bvp: number;
    media_id: IMedia[];
    attributes: IAttributes[];
    items: IItem[];
}
  
export interface IMedia {
    filename: string;
    picture_type: string;
    thumbnail_url: string;
    url: string;
}
  
export interface IUsp {
    usp1: string;
    usp2: string;
    usp3: string;
    usp4: string;
    usp5: string;
    usp6: string;
}
  
export interface IAttributes {
    name: string;
    language: string;
    data_type: string;
    value_def: string;
    value_max: string;
    name_key_language: string;
    attribute_identifier: string;
}