export type HoseDiameterMeta = {
	minInnerDiameterTomme: string;
	maxInnerDiameterTomme: string;
	count: number;
};

export type HoseDiameterResponse = {
	innerDiameterTomme: string[];
	metaInnerDiameterTomme: HoseDiameterMeta;
};

export type HoseMediumResponse = string[];

export type HosePressureResponse = {
	minPressure: number;
	maxPressure: number;
};

export type HoseTemperatureResponse = {
	minTemperature: string;
	maxTemperature: string;
};

export type HoseSelectionRequest = {
	medium?: string;
	temperature?: number;
	pressure?: number;
	dimension?: string;
};

export type HoseSelectionMedia = {
	url: string;
	filename: string;
	picture_type: string;
	thumbnail_url: string;
};

export type HoseSelectionItem = {
	itemNumber: string;
	productNameNo: string;
	productNameEn: string;
	productNumber: string;
	mediaId: HoseSelectionMedia[];
	shortDescNo: string | null;
};

export type HoseSelectionResponse = HoseSelectionItem[];
