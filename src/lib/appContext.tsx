"use client";

import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

import { SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER } from "@/constants/checkout";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import {
	getCart,
	updateCart,
	removeFromCart,
	archiveCart as svcArchiveCart,
	updateWarehouseForCart,
	clearCart,
} from "@/services/carts.service";
import {
	calculateItemPrice,
	getProductPrice,
} from "@/services/product.service";
import { AddressFormState } from "@/types/address";
import { CartKitResponse, CartLine } from "@/types/carts.types";
import { Order } from "@/types/orders.types";
import { PriceResponse } from "@/types/search.types";
import { usePathname, useRouter } from "next/navigation";

interface AppContextType {
	isCartChanging: boolean;
	setIsCartChanging: (value: boolean) => void;

	cartItems: CartKitResponse | undefined;
	setCartItems: (value: CartKitResponse) => void;

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

	removeItemOptimistic: (cartLine: number | string) => Promise<void>;

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

	handleClearCart: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
	const { data: profile } = useGetProfileData();

	const [isAuthOpen, setIsAuthOpen] = useState(false);
	const [currentStep, setCurrentStep] = useState(0);
	const [isCartChanging, setIsCartChanging] = useState(false);

	const [cartItems, setCartItems] = useState<CartKitResponse>();
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

	const pathname = usePathname();
	const router = useRouter();

	useEffect(() => {
		if (
			profile?.defaultCustomerNumber ===
			SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER
		) {
			const isProfile = pathname.includes("/profile");
			const isCheckout = pathname.includes("/checkout");
			const isCart = pathname.includes("/cart");

			if (!isProfile && !isCheckout && !isCart) {
				router.replace("/profile");
			}
		}
	}, [profile, pathname, router]);

	const loadCartData = async () => {
		try {
			const cart = await getCart();
			if (!cart) return;

			setCartItems(cart);

			for (const item of cart.cart) {
				const priceData = await getProductPrice(
					profile?.defaultCustomerNumber,
					profile?.defaultCompanyNumber,
					item.productNumber,
					item.warehouseNumber,
				);
				setPrices((prev) => ({
					...prev,
					[item.itemNumber]:
						priceData?.find(
							(p: PriceResponse) => p.itemNumber === String(item.itemNumber),
						)?.basePrice || 0,
				}));
			}

			const priceRequests =
				cart.cart?.map((item) => ({
					itemNumber: item.itemNumber,
					quantity: item.quantity,
					warehouseNumber: profile?.defaultWarehouseNumber || "",
				})) ?? [];

			const cartKitPriceRequests =
				cart.cartKit?.flatMap((item) => [
					{
						itemNumber: item.hose.itemNumber,
						quantity: item.hose.quantity || 1,
						warehouseNumber: profile?.defaultWarehouseNumber || "",
					},
					{
						itemNumber: item.ferrule1.itemNumber,
						quantity: item.hose.quantity || 1, // Each hose needs a set of ferrules and inserts
						warehouseNumber: profile?.defaultWarehouseNumber || "",
					},
					{
						itemNumber: item.ferrule2.itemNumber,
						quantity: item.hose.quantity || 1,
						warehouseNumber: profile?.defaultWarehouseNumber || "",
					},
					{
						itemNumber: item.insert1.itemNumber,
						quantity: item.hose.quantity || 1,
						warehouseNumber: profile?.defaultWarehouseNumber || "",
					},
					{
						itemNumber: item.insert2.itemNumber,
						quantity: item.hose.quantity || 1,
						warehouseNumber: profile?.defaultWarehouseNumber || "",
					},
				]) ?? [];

			const allPriceRequests = [...priceRequests, ...cartKitPriceRequests];

			if (allPriceRequests.length > 0) {
				const priceResults = await calculateItemPrice(
					allPriceRequests,
					profile?.defaultCustomerNumber,
					profile?.defaultCompanyNumber,
				);

				const initialPrices: Record<string, number> = {};
				const calculatedPrices: Record<string, number> = {};

				for (const item of priceResults) {
					initialPrices[item.itemNumber] = item.basePrice || 0;

					calculatedPrices[item.itemNumber] =
						item.bestPrice || item.basePrice || 0;
				}

				setPrices((prev) => ({
					...prev,
					...initialPrices,
				}));
				setCalculatedPrices((prev) => ({
					...prev,
					...calculatedPrices,
				}));

				const newSummary = priceResults.reduce(
					(acc: Record<string, number>, it: PriceResponse) => {
						acc[it.itemNumber] = it.basePriceTotal || it.bestPrice || 0;
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
				cartLines: cartItems?.cart.map((i) => Number(i.cartLine)) || [],
			});
			await loadCartData();
		} catch (error) {
			console.error("Error updating warehouse for all items:", error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const removeItemOptimistic = async (cartLine: number | string) => {
		const numericLine = Number(cartLine);

		// Check if it's a cart kit item (hexagonId)
		if (isNaN(numericLine)) {
			const hexagonId = cartLine;
			const backup = cartItems?.cartKit?.find((i) => i.hexagonId === hexagonId);

			setCartItems((prev) => {
				if (!prev?.cartKit) return prev;
				return {
					...prev,
					cartKit: prev.cartKit.filter((i) => i.hexagonId !== hexagonId),
				};
			});

			try {
				await removeFromCart(hexagonId);
				setIsCartChanging((v) => !v);
			} catch (error) {
				if (backup) {
					setCartItems((prev) => {
						if (!prev?.cartKit) return prev;
						return {
							...prev,
							cartKit: [...prev.cartKit, backup],
						};
					});
				}
				console.error("Error removing cart kit item:", error);
				throw error;
			}
			return;
		}

		// Regular cart item
		const backup = cartItems?.cart?.find(
			(i) => Number(i.cartLine) === numericLine,
		);

		setCartItems((prev) => {
			if (!prev?.cart) return prev;
			return {
				...prev,
				cart: prev.cart.filter((i) => Number(i.cartLine) !== numericLine),
			};
		});

		try {
			await removeFromCart(numericLine);
			setIsCartChanging((v) => !v);
		} catch (error) {
			if (backup) {
				setCartItems((prev) => {
					if (!prev?.cart) return prev;
					const updatedCart = [...prev.cart, backup].sort(
						(a, b) => (Number(a.cartLine) || 0) - (Number(b.cartLine) || 0),
					);
					return {
						...prev,
						cart: updatedCart,
					};
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

	const handleClearCart = async () => {
		try {
			await clearCart();
			setCartItems({
				cart: [],
				cartKit: [],
			});
			setPrices({});
			setCalculatedPrices({});
			setSurChargePrices({});
			setRabatterPrices({});
			setOrderSummaryTotalPrice({});
			setIsCartChanging((v) => !v);
		} catch (error) {
			console.error("Error clearing cart:", error);
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

				handleClearCart,
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
