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
	archiveCart as svcArchiveCart,
	updateWarehouseForCart,
} from "@/services/carts.service";
import {
	calculateItemPrice,
	getProductPrice,
} from "@/services/product.service";
import { AddressFormState } from "@/types/address";
import { CartLine } from "@/types/carts.types";
import { Order } from "@/types/orders.types";
import { PriceResponse } from "@/types/search.types";

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

	updateWarehouseForAllItems: (warehouseNumber: string) => Promise<void>;

	removeItem: (cartLine: number) => Promise<void>;
	removeItemOptimistic: (cartLine: number) => Promise<void>; // NEW

	handleArchiveCart: () => Promise<void>;

	currentStep: number;
	setCurrentStep: (value: number) => void;

	totalPrice: number;
	surChargeTotalPrice: number;

	isAuthOpen: boolean;
	setIsAuthOpen: (value: boolean) => void;

	showFeedbackModal: boolean;
	setShowFeedbackModal: (value: boolean) => void;

	submittedOrder: Order | null;
	setSubmittedOrder: (value: Order | null) => void;

	showOrderConfirmation: boolean;
	setShowOrderConfirmation: (value: boolean) => void;

	updatedAddress: AddressFormState | null;
	setUpdatedAddress: (addr: AddressFormState | null) => void;

	orderSummaryTotalPriceFinal: number;
	rabatterTotalPrice: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
	const { data: profile } = useGetProfileData();

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
	const [rabatterPrices, setRabatterPrices] = useState<Record<string, number>>(
		{},
	);
	const [orderSummaryTotalPrice, setOrderSummaryTotalPrice] = useState<
		Record<string, number>
	>({});

	const [isLoading, setIsLoading] = useState(false);
	const [showFeedbackModal, setShowFeedbackModal] = useState(false);
	const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);
	const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
	const [updatedAddress, setUpdatedAddress] = useState<AddressFormState | null>(
		null,
	);

	const loadCartData = async () => {
		try {
			const cart = await getCart();
			if (!cart) return;

			setCartItems(cart);

			// Base prices (per item)
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

			// Initial calculation for all items
			const priceRequests =
				cart?.map((item) => ({
					itemNumber: item.itemNumber,
					quantity: item.quantity,
					warehouseNumber: profile?.defaultWarehouseNumber || "",
				})) ?? [];

			if (priceRequests.length > 0) {
				const priceResults = await calculateItemPrice(
					priceRequests,
					profile?.defaultCustomerNumber,
					profile?.defaultCompanyNumber,
				);
				console.log(priceResults, "priceresults");

				const newSummary = priceResults.reduce(
					(acc: Record<string, number>, it: PriceResponse) => {
						acc[it.itemNumber] = it.basePriceTotal || 0;
						return acc;
					},
					{},
				);
				const newCalculated = priceResults.reduce(
					(acc: Record<string, number>, it: PriceResponse) => {
						acc[it.itemNumber] = it.bestPrice || 0;
						return acc;
					},
					{},
				);
				const newSurcharges = priceResults.reduce(
					(acc: Record<string, number>, it: PriceResponse) => {
						acc[it.itemNumber] = it.surCharge || 0;
						return acc;
					},
					{},
				);
				const newRabatter = priceResults.reduce(
					(acc: Record<string, number>, it: PriceResponse) => {
						acc[it.itemNumber] = it.flatDiscount || 0;
						return acc;
					},
					{},
				);

				setOrderSummaryTotalPrice(newSummary);
				setCalculatedPrices(newCalculated);
				setSurChargePrices(newSurcharges);
				setRabatterPrices(newRabatter);
			}
		} catch (error) {
			console.error("Error fetching cart:", error);
		}
	};

	useEffect(() => {
		if (profile) loadCartData();
	}, [profile, isCartChanging]);

	const totalPrice = useMemo(
		() => Object.values(calculatedPrices).reduce((sum, v) => sum + v, 0),
		[calculatedPrices],
	);

	const surChargeTotalPrice = useMemo(
		() => Object.values(surChargePrices).reduce((sum, v) => sum + v, 0),
		[surChargePrices],
	);

	const rabatterTotalPrice = useMemo(
		() => Object.values(rabatterPrices).reduce((sum, v) => sum + v, 0),
		[rabatterPrices],
	);

	const orderSummaryTotalPriceFinal = useMemo(
		() => Object.values(orderSummaryTotalPrice).reduce((sum, v) => sum + v, 0),
		[orderSummaryTotalPrice],
	);

	const updateQuantity = async (
		cartLine: number,
		itemNumber: string,
		newQuantity: number,
	) => {
		try {
			await updateCart(cartLine, { itemNumber, quantity: newQuantity });
			setIsCartChanging((v) => !v);
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
			await updateCart(cartLine, { itemNumber, warehouseNumber });
			setIsCartChanging((v) => !v);
		} catch (error) {
			console.error("Error updating cart warehouse:", error);
			throw error;
		}
	};

	const updateWarehouseForAllItems = async (warehouseNumber: string) => {
		try {
			setIsLoading(true);
			await updateWarehouseForCart({
				warehouseNumber,
				companyNumber: String(profile?.defaultCompanyNumber) || "",
				cartLines: cartItems.map((i) => Number(i.cartLine)),
			});
			await loadCartData();
		} catch (error) {
			console.error("Error updating warehouse for all items:", error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const removeItem = async (cartLine: number) => {
		try {
			await removeFromCart(cartLine);
			setIsCartChanging((v) => !v);
		} catch (error) {
			console.error("Error removing item from cart:", error);
			throw error;
		}
	};

	const removeItemOptimistic = async (cartLine: number) => {
		const numericLine = Number(cartLine);
		const backup = cartItems.find((i) => Number(i.cartLine) === numericLine);

		setCartItems((prev) =>
			prev.filter((i) => Number(i.cartLine) !== numericLine),
		);

		try {
			await removeFromCart(cartLine);

			setIsCartChanging((v) => !v);
		} catch (error) {
			if (backup) {
				setCartItems((prev) => {
					const next = [...prev, backup];
					return next.sort(
						(a, b) => (Number(a.cartLine) || 0) - (Number(b.cartLine) || 0),
					);
				});
			}
			console.error("Error removing item (optimistic) from cart:", error);
			throw error;
		}
	};

	const handleArchiveCart = async () => {
		try {
			await svcArchiveCart();
			setIsCartChanging((v) => !v);
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
				updateWarehouseForAllItems,

				removeItem,
				removeItemOptimistic,

				handleArchiveCart,

				currentStep,
				setCurrentStep,

				totalPrice,
				surChargeTotalPrice,

				isAuthOpen,
				setIsAuthOpen,

				showFeedbackModal,
				setShowFeedbackModal,

				submittedOrder,
				setSubmittedOrder,

				showOrderConfirmation,
				setShowOrderConfirmation,

				updatedAddress,
				setUpdatedAddress,

				rabatterTotalPrice,
				orderSummaryTotalPriceFinal,
			}}>
			{children}
		</AppContext.Provider>
	);
};

export const useAppContext = (): AppContextType => {
	const ctx = useContext(AppContext);
	if (!ctx)
		throw new Error("useAppContext must be used within an AppContextProvider");
	return ctx;
};
