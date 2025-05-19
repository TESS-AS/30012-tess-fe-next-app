export interface CartLine {
    userId?: number;
    cartLine?: number;
    productNumber: string;
    productName?: string;
    itemNumber: string;
    quantity: number;
    warehouseNumber: string;
    companyNumber: string;
    price?: number;
    mediaUrl?: string;
    variants?: Array<{
        contentUnit: string;
        itemId: number;
        itemNumber: string;
        parentProdNumber: string;
        unspsc: string | null;
    }>;
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
        cart: CartLine[]
    }[]
}
