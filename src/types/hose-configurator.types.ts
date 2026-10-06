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

export type HoseSelectionItem = {
	itemNumber: string;
	productNameNo: string;
	productNameEn: string;
};

export type HoseSelectionResponse = HoseSelectionItem[];
