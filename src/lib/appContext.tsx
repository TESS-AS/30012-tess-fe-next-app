"use client";

import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

import { useGetProfileData } from "@/hooks/useGetProfileData";
import {
	getCart,
	updateCart,
	removeFromCart,
	archiveCart,
} from "@/services/carts.service";
import {
	calculateItemPrice,
	getProductPrice,
} from "@/services/product.service";
import { CartLine } from "@/types/carts.types";
import { PriceResponse } from "@/types/search.types";
import { useSession } from "next-auth/react";

interface AppContextType {
	isCartChanging: boolean;
	setIsCartChanging: (value: boolean) => void;
	cartItems: CartLine[];
	setCartItems: (value: CartLine[]) => void;
	prices: Record<string, number>;
	calculatedPrices: Record<string, number>;
	isLoading: boolean;
	updateQuantity: (
		cartLine: number,
		itemNumber: string,
		newQuantity: number,
	) => Promise<void>;
	updateWarehouse: (
		cartLine: number,
		itemNumber: string,
		warehouseNumber: string,
	) => Promise<void>;
	removeItem: (cartLine: number) => Promise<void>;
	handleArchiveCart: () => Promise<void>;
	currentStep: number;
	setCurrentStep: (value: number) => void;
	totalPrice: number;
	surChargeTotalPrice: number;
	isAuthOpen: boolean;
	setIsAuthOpen: (value: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
	const [isAuthOpen, setIsAuthOpen] = useState(false);
	const [currentStep, setCurrentStep] = useState(0);
	const [isCartChanging, setIsCartChanging] = useState(false);
	const [cartItems, setCartItems] = useState<CartLine[]>([]);
	const [prices, setPrices] = useState<Record<string, number>>({});
	const [calculatedPrices, setCalculatedPrices] = useState<
		Record<string, number>
	>({});
	const [surChargePrices, setSurChargePrices] = useState<
		Record<string, number>
	>({});
	const [isLoading, setIsLoading] = useState(false);
	const { data: profile } = useGetProfileData();

	const { status } = useSession();

	const loadCartData = async () => {
		try {
			const cart = await getCart();
			if (!cart) {
				return;
			}
			setIsLoading(true);
			setCartItems(cart);

			// Get base prices
			for (const item of cart) {
				const priceData = await getProductPrice(
					profile?.defaultCustomerNumber,
					profile?.defaultCompanyNumber,
					item.productNumber,
				);
				setPrices((prev) => ({
					...prev,
					[item.itemNumber]:
						priceData?.find(
							(p: PriceResponse) => p.itemNumber === String(item.itemNumber),
						)?.basePrice || 0,
				}));
			}

			// Calculate initial prices for all items
			const priceRequests = cart?.map((item) => ({
				itemNumber: item.itemNumber,
				quantity: item.quantity,
				warehouseNumber: profile?.defaultWarehouseNumber || "",
			}));

			if (priceRequests.length > 0) {
				const priceResults = await calculateItemPrice(
					priceRequests,
					profile?.defaultCustomerNumber,
					profile?.defaultCompanyNumber,
				);
				console.log(priceResults, "priceResults");

				const newPrices = priceResults.reduce(
					(acc: Record<string, number>, item: PriceResponse) => ({
						...acc,
						[item.itemNumber]: item.bestPrice || 0,
					}),
					{} as Record<string, number>,
				);

				const surChargePrices = priceResults.reduce(
					(acc: Record<string, number>, item: PriceResponse) => ({
						...acc,
						[item.itemNumber]: item.surCharge || 0,
					}),
					{} as Record<string, number>,
				);

				// const rabatterprices = priceResults.reduce(
				// 	(acc: Record<string, number>, item: PriceResponse) => ({
				// 		...acc,
				// 		[item.itemNumber]: item.discount || 0,
				// 	}),
				// 	{} as Record<string, number>,
				// );

				setSurChargePrices(surChargePrices);
				setCalculatedPrices(newPrices);
			}
		} catch (error) {
			console.error("Error fetching cart:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (status === "authenticated") {
			loadCartData();
		}
	}, [status, isCartChanging]);
	console.log(calculatedPrices, "prices");

	const totalPrice = useMemo(() => {
		return Object.values(calculatedPrices).reduce((sum, val) => sum + val, 0);
	}, [calculatedPrices]);

	const surChargeTotalPrice = useMemo(() => {
		return Object.values(surChargePrices).reduce((sum, val) => sum + val, 0);
	}, [surChargePrices]);

	console.log(surChargeTotalPrice, "surChargeTotalPrice");

	const updateQuantity = async (
		cartLine: number,
		itemNumber: string,
		newQuantity: number,
	) => {
		try {
			await updateCart(cartLine, {
				itemNumber,
				quantity: newQuantity,
			});
			setIsCartChanging(!isCartChanging);
		} catch (error) {
			console.error("Error updating cart quantity:", error);
			throw error;
		}
	};

	const updateWarehouse = async (
		cartLine: number,
		itemNumber: string,
		warehouseNumber: string,
	) => {
		try {
			await updateCart(cartLine, {
				itemNumber,
				warehouseNumber,
			});
			setIsCartChanging(!isCartChanging);
		} catch (error) {
			console.error("Error updating cart quantity:", error);
			throw error;
		}
	};

	const removeItem = async (cartLine: number) => {
		try {
			await removeFromCart(cartLine);
			setIsCartChanging(!isCartChanging);
		} catch (error) {
			console.error("Error removing item from cart:", error);
			throw error;
		}
	};

	const handleArchiveCart = async () => {
		try {
			await archiveCart();
			setIsCartChanging(!isCartChanging);
		} catch (error) {
			console.error("Error archiving cart:", error);
			throw error;
		}
	};

	return (
		<AppContext.Provider
			value={{
				isCartChanging,
				setIsCartChanging,
				cartItems,
				setCartItems,
				prices,
				calculatedPrices,
				isLoading,
				updateQuantity,
				updateWarehouse,
				removeItem,
				handleArchiveCart,
				currentStep,
				setCurrentStep,
				totalPrice,
				surChargeTotalPrice,
				isAuthOpen,
				setIsAuthOpen,
			}}>
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
