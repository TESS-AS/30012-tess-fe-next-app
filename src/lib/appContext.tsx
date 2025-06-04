"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { CartLine } from "@/types/carts.types";
import { getCart } from "@/services/carts.service";
import { useSession } from "next-auth/react";
interface AppContextType {
	isCartChanging: boolean;
	setIsCartChanging: (value: boolean) => void;
	cartItems: CartLine[];
	setCartItems: (value: CartLine[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
	const [isCartChanging, setIsCartChanging] = useState(false);
	const [cartItems, setCartItems] = useState<CartLine[]>([]);
	const { status } = useSession() as {
		data: any;
		status: "loading" | "authenticated" | "unauthenticated";
	};

	useEffect(() => {
		const loadCartData = async () => {
			try {
				const cart = await getCart();
				setCartItems(cart);
			} catch (error) {
				console.error("Error loading cart data:", error);
			}
		};
		if (status === "authenticated") {
			loadCartData();
		}
	}, [status]);

	return (
		<AppContext.Provider value={{ isCartChanging, setIsCartChanging, cartItems, setCartItems }}>
			{children}
		</AppContext.Provider>
	);
};

export const useAppContext = (): AppContextType => {
	const context = useContext(AppContext);
	if (context === undefined) {
		throw new Error("useAppContext must be used within an AppContextProvider");
	}
	return context;
};
