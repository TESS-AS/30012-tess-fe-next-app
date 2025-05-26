"use client";

import {
	createContext,
	useContext,
	useState,
	ReactNode,
	useEffect,
} from "react";

import { getCart } from "@/services/carts.service";
import { CartLine } from "@/types/carts.types";
import { CartItem } from "@/types/store.types";

interface CartContextType {
	items: CartLine[];
	addItem: (item: CartLine) => void;
	removeItem: (index: number) => void;
	isOpen: boolean;
	openCart: () => void;
	closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
	const [items, setItems] = useState<CartLine[]>([]);

	useEffect(() => {
		const fetchCart = async () => {
			const cart = await getCart();
			setItems(cart);
		};
		fetchCart();
	}, []);

	const [isOpen, setIsOpen] = useState(false);

	const addItem = (item: CartLine) => {
		setItems((prevItems) => [...prevItems, item]);
	};

	const openCart = () => setIsOpen(true);
	const closeCart = () => setIsOpen(false);

	const removeItem = (index: number) => {
		setItems((prevItems) => prevItems!.filter((_, i) => i !== index));
	};

	return (
		<CartContext.Provider
			value={{ items, addItem, isOpen, openCart, closeCart, removeItem }}>
			{children}
		</CartContext.Provider>
	);
}

export function useCart() {
	const context = useContext(CartContext);
	if (!context) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
}
