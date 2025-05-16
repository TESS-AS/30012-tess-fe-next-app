export interface CartLine {
    user_id?: number;
    cart_line?: number;
    product_number: string;
    product_name?: string;
    item_number: string;
    quantity: number;
    warehouse_number: string;
    company_number: string;
    price?: number;
    media_url?: string;
    variants?: Array<{
        content_unit: string;
        item_id: number;
        item_number: string;
        parent_prod_number: string;
        unspsc: string | null;
    }>;
}

export interface CartResponse {
    message: string;
    data: CartLine[];
}

export interface ArchiveCart {
    cart_line: number;
    price: number;
}

export interface ArchiveCartResponse {
    currentPage: number;
    totalPages: number;
    data: {
        user_id: number;
        date: string;
        cart: CartLine[]
    }[]
}
