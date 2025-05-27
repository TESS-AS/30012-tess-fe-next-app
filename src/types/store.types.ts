import { Category } from "./categories.types";

export interface Product {
	id: string;
	name: string;
	price: number;
	image: string;
	category: string;
	subcategory: string;
	description: string;
	// Add additional properties as needed
}

export interface CartItem extends Product {
	quantity: number;
}

export interface User {
	id: string;
	name: string;
	email: string;
	// Add additional properties as needed
}

export interface StoreState {
	// Cart slice
	cart: CartItem[];
	addToCart: (product: Product) => void;
	removeFromCart: (productId: string) => void;
	updateQuantity: (productId: string, quantity: number) => void;
	clearCart: () => void;

	// Product slice
	products: Product[];
	setProducts: (products: Product[]) => void;
	filterProducts: (criteria: any) => void; // Replace "any" with a stricter type if possible

	// User slice
	user: User | null;
	setUser: (user: User) => void;
	clearUser: () => void;

	// UI slice
	isLoading: boolean;
	setLoading: (loading: boolean) => void;

	//
	categories: Category[];
	setCategories: (categories: Category[]) => void;
}
