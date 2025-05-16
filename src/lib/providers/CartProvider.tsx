"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface CartItem {
	name: string;
	price: number;
	quantity: number;
	currency: string;
	image?: string;
	product_number: string;
}

interface CartContextType {
	items: CartItem[];
	addItem: (item: CartItem) => void;
	removeItem: (index: number) => void;
	isOpen: boolean;
	openCart: () => void;
	closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
	const [items, setItems] = useState<CartItem[]>([
		{
			name: "Protective Gloves",
			price: 29.99,
			quantity: 1,
			currency: "$",
			image: "/images/gloves.jpg",
			product_number: "P_31950",
		},
		{
			name: "Building block",
			price: 49.99,
			quantity: 2,
			currency: "$",
			image: "/images/96701_kvadrat.png",
			product_number: "P_96701",
		},
	]);

	const [isOpen, setIsOpen] = useState(false);

	const addItem = (item: CartItem) => {
		setItems((prevItems) => [...prevItems, item]);
	};

	const openCart = () => setIsOpen(true);
	const closeCart = () => setIsOpen(false);

	const removeItem = (index: number) => {
		setItems((prevItems) => prevItems.filter((_, i) => i !== index));
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
