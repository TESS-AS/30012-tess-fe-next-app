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
	cartKitTotals: Record<string, number>;
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
						)?.basePriceTotal || 0,
				}));
			}

			const priceRequests =
				cart.cart?.map((item) => ({
					itemNumber: item.itemNumber,
					quantity: item.quantity,
					warehouseNumber:
						item.warehouseNumber || profile?.defaultWarehouseNumber || "",
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
						quantity: item.ferrule1.quantity || 1,
						warehouseNumber: profile?.defaultWarehouseNumber || "",
					},
					{
						itemNumber: item.ferrule2.itemNumber,
						quantity: item.ferrule2.quantity || 1,
						warehouseNumber: profile?.defaultWarehouseNumber || "",
					},
					{
						itemNumber: item.insert1.itemNumber,
						quantity: item.insert1.quantity || 1,
						warehouseNumber: profile?.defaultWarehouseNumber || "",
					},
					{
						itemNumber: item.insert2.itemNumber,
						quantity: item.insert2.quantity || 1,
						warehouseNumber: profile?.defaultWarehouseNumber || "",
					},
				]) ?? [];
			console.log(cartKitPriceRequests, "cartKitPriceRequests");

			const allPriceRequests = [...priceRequests, ...cartKitPriceRequests];

			if (allPriceRequests.length > 0) {
				const priceResults = await calculateItemPrice(
					allPriceRequests,
					profile?.defaultCustomerNumber,
					profile?.defaultCompanyNumber,
				);

				console.log(priceResults, "priceresults");

				const initialPrices: Record<string, number> = {};
				const calculatedPrices: Record<string, number> = {};

				for (const item of priceResults) {
					initialPrices[item.itemNumber] = item.basePriceTotal || 0;

					calculatedPrices[item.itemNumber] = item.bestPrice || 0;
				}

				console.log(initialPrices, calculatedPrices, "inital");

				setPrices((prev) => ({
					...prev,
					...initialPrices,
				}));
				setCalculatedPrices((prev) => ({
					...prev,
					...calculatedPrices,
				}));

				const allItemsForPricing: Array<{
					itemNumber: string;
					quantity: number;
					warehouseNumber: string;
				}> = [
					...(cart.cart ?? []).map((i) => ({
						itemNumber: i.itemNumber,
						quantity: i.quantity,
						warehouseNumber:
							i.warehouseNumber || profile?.defaultWarehouseNumber || "",
					})),
					...(cart.cartKit ?? []).flatMap((k) => [
						{
							itemNumber: k.hose.itemNumber,
							quantity: k.hose.quantity || 1,
							warehouseNumber: profile?.defaultWarehouseNumber || "",
						},
						{
							itemNumber: k.ferrule1.itemNumber,
							quantity: k.ferrule1.quantity || 1,
							warehouseNumber: profile?.defaultWarehouseNumber || "",
						},
						{
							itemNumber: k.ferrule2.itemNumber,
							quantity: k.ferrule2.quantity || 1,
							warehouseNumber: profile?.defaultWarehouseNumber || "",
						},
						{
							itemNumber: k.insert1.itemNumber,
							quantity: k.insert1.quantity || 1,
							warehouseNumber: profile?.defaultWarehouseNumber || "",
						},
						{
							itemNumber: k.insert2.itemNumber,
							quantity: k.insert2.quantity || 1,
							warehouseNumber: profile?.defaultWarehouseNumber || "",
						},
					]),
				];

				const currentCalculated = new Set(Object.keys(calculatedPrices));
				const missingItems = allItemsForPricing.filter(
					(it) => !currentCalculated.has(it.itemNumber),
				);
				if (missingItems.length > 0) {
					try {
						const fallbackResults = await calculateItemPrice(
							missingItems,
							profile?.defaultCustomerNumber,
							profile?.defaultCompanyNumber,
						);
						const fallbackCalculated: Record<string, number> = {};
						const fallbackInitial: Record<string, number> = {};
						for (const item of fallbackResults) {
							fallbackInitial[item.itemNumber] = item.basePriceTotal || 0;
							fallbackCalculated[item.itemNumber] = item.bestPrice || 0;
						}
						setPrices((prev) => ({ ...prev, ...fallbackInitial }));
						setCalculatedPrices((prev) => ({ ...prev, ...fallbackCalculated }));
					} catch (e) {
						console.warn("Fallback batch pricing failed", e);
					}
				}

				const newSummary = priceResults.reduce(
					(acc: Record<string, number>, it: PriceResponse) => {
						acc[it.itemNumber] =
							(acc[it.itemNumber] || 0) + (it.basePriceTotal || 0);
						return acc;
					},
					{},
				);

				const newSurcharges = priceResults.reduce(
					(acc: Record<string, number>, it: PriceResponse) => {
						acc[it.itemNumber] =
							(acc[it.itemNumber] || 0) + (it.surCharge || 0);
						return acc;
					},
					{},
				);
				const newRabatter = priceResults.reduce(
					(acc: Record<string, number>, it: PriceResponse) => {
						acc[it.itemNumber] =
							(acc[it.itemNumber] || 0) + (it.flatDiscount || 0);
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

	const totalPrice = useMemo(() => {
		const regularTotal = (cartItems?.cart ?? []).reduce((sum, line) => {
			const unit = calculatedPrices[line.itemNumber] ?? 0;
			return sum + unit * (line.quantity || 1);
		}, 0);

		const kitsTotal = (cartItems?.cartKit ?? []).reduce((sum, kit) => {
			const unitSum =
				(calculatedPrices[kit.hose.itemNumber] ?? 0) +
				(calculatedPrices[kit.ferrule1.itemNumber] ?? 0) +
				(calculatedPrices[kit.ferrule2.itemNumber] ?? 0) +
				(calculatedPrices[kit.insert1.itemNumber] ?? 0) +
				(calculatedPrices[kit.insert2.itemNumber] ?? 0);
			const qty = kit.hose.quantity || 1;
			return sum + unitSum * qty;
		}, 0);

		return regularTotal + kitsTotal;
	}, [cartItems?.cart, cartItems?.cartKit, calculatedPrices]);

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

	const cartKitTotals = useMemo(() => {
		const totals: Record<string, number> = {};
		for (const kit of cartItems?.cartKit ?? []) {
			const unitSum =
				(calculatedPrices[kit.hose.itemNumber] ?? 0) +
				(calculatedPrices[kit.ferrule1.itemNumber] ?? 0) +
				(calculatedPrices[kit.ferrule2.itemNumber] ?? 0) +
				(calculatedPrices[kit.insert1.itemNumber] ?? 0) +
				(calculatedPrices[kit.insert2.itemNumber] ?? 0);
			const qty = kit.hose.quantity || 1;
			totals[kit.hexagonId] = unitSum * qty;
		}
		return totals;
	}, [cartItems?.cartKit, calculatedPrices]);

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

	console.log(calculatedPrices, prices, "prices and cal");
	const removeItemOptimistic = async (cartLine: number | string) => {
		const numericLine = Number(cartLine);

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

		const backup = cartItems?.cart?.find(
			(i) => Number(i.cartLine) === numericLine,
		);

		setCartItems((prev) => {
			if (!prev?.cart) return prev;
			return {
				...prev,
				cart: prev.cart.filter((i) => Number(i.cartLine) !== numericLine),
				cartKit: prev.cartKit,
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
				cartKitTotals,
				isLoading,

				updateQuantity,
				updateWarehouse,
				updateWarehouseForAllItems,

				removeItemOptimistic,

				handleArchiveCart,

				handleClearCart,

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
