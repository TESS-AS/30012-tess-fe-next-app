export interface CartLine {
	userId?: number;
	cartLine?: number;
	productNumber: string;
	itemName?: string;
	productName?: string;
	itemNumber: string;
	quantity: number;
	warehouseNumber: string;
	companyNumber: string;
	price?: number;
	mediaId?: Array<Media>;
	variants?: Array<{
		contentUnit: string;
		itemId: number;
		itemNumber: string;
		parentProdNumber: string;
		unspsc: string | null;
	}>;
}

export interface CartKitItem {
	hexagonId: string;
	assetId: number;
	cartLine: number;
	services?: Record<string, string>;
	hose: {
		itemName: string;
		itemNumber: string;
		dimension: string;
		lengthMm: number;
		lengthFtIn: string;
		itemDescription: string;
		genericHoseName: string;
		quantity: number;
	};
	ferrule1: HoseComponent;
	ferrule2: HoseComponent;
	insert1: HoseComponent;
	insert2: HoseComponent;
}

export interface CartKitResponse {
	cart: CartLine[];
	cartKit: CartKitItem[];
}

export interface HoseComponent {
	name: string;
	itemNumber: string;
	itemId: number;
	quantity: number;
}

export interface Media {
	filename: string;
	picture_type: string;
	thumbnail_url: string;
	url: string;
}

export interface CartResponse {
	message: string;
	data: CartLine[];
}

export interface ArchiveCart {
	cartLine: number;
	price: number;
}

export interface ArchiveCartResponse {
	currentPage: number;
	totalPages: number;
	data: {
		userId: number;
		date: string;
		cart: CartLine[];
	}[];
}

export interface WarehouseBatch {
	warehouseNumber: string;
	warehouseName: string;
	cartItemCount: number;
	inStockCount: number;
	allInStock: boolean;
	items: Array<{
		itemNumber: string;
		inStock: boolean;
	}>;
}
