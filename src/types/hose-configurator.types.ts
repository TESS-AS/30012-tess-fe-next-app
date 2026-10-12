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
	medium: string | null;
	temperature: [number, number] | null;
	pressure: number | null;
	dimension: string | null;
};

export type HoseSelectionPage = {
	items: HoseSelectionItem[];
	page: number;
	pageSize: number;
	totalCount: number | null;
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

export type HoseAssemblyEnd = {
	fittingType: string | null;
	gender: string | null;
	fittingEndDimension: string | null;
	angle: string | null;
	material: string | null;
};

export type HoseAssemblyRequest = {
	hose: {
		itemNumber: string;
		dimension: string | null;
		temperature: number | null;
		pressure: number | null;
		medium: string | null;
		lengthMeters: number | null;
		quantity: number;
		otherRequirments: string | null;
	};
	end1: HoseAssemblyEnd;
	end2: HoseAssemblyEnd;
	orientationAngle: string | null;
	service: {
		pressureTesting: boolean;
		dataSheet: boolean;
		specialMarking: string | null;
		spiralGuard: boolean;
	};
};

export type HoseAssemblyHose = {
	itemNumber: string;
	productNumber: string;
	productNameNo: string;
	productNameEn: string;
	itemName: string;
	dimension: string | null;
	temperature: number | null;
	pressure: number | null;
	medium: string | null;
	lengthMeters: number | null;
	quantity: number;
	otherRequirments: string | null;
};

export type HoseAssemblyFerrule = {
	dimension: string | null;
	material: string | null;
	itemNumber: string | null;
	productNumber: string | null;
	productNameNo: string | null;
	productNameEn: string | null;
	amn: string | null;
	quantity: number | null;
};

export type HoseAssemblyInsertMatch = {
	itemNumber: string;
	productNumber: string;
	product_name_en?: string;
	product_name_no?: string;
	productNameEn?: string;
	productNameNo?: string;
	fittingType: string | null;
	gender: string | null;
	angle: string | null;
	quantity: number;
	OrientationAngle?: string | null;
};

export type HoseAssemblyInsert = HoseAssemblyInsertMatch | string;

export type HoseAssemblyService = {
	itemNumber: string;
	serviceType: string;
	description?: string;
	itemName?: string;
	quantity: number;
	guardRange?: string;
};

export type HoseAssemblyResponse = {
	hose: HoseAssemblyHose[];
	ferrule1: HoseAssemblyFerrule[];
	ferrule2: HoseAssemblyFerrule[];
	insert1: HoseAssemblyInsert[];
	insert2: HoseAssemblyInsert[];
	service: HoseAssemblyService[];
};

export type HoseSelectionResponse = HoseSelectionItem[] | {
	items?: HoseSelectionItem[];
	data?: HoseSelectionItem[];
	results?: HoseSelectionItem[];
	hoses?: HoseSelectionItem[];
	products?: HoseSelectionItem[];
	totalCount?: number;
	total?: number;
	totalItems?: number;
	count?: number;
};
