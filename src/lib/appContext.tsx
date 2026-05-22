"use client";

import {
	createContext,
	Dispatch,
	ReactNode,
	useContext,
	useEffect,
	useMemo,
	SetStateAction,
	useState,
} from "react";

import {
	CartAddedNotification,
	CartNotificationData,
} from "@/components/ui/cart-added-notification";
import { SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER } from "@/constants/checkout";
import {
	EQUINOR_WELCOME_DISMISSED_KEY,
	EQUINOR_WELCOME_SEEN_THIS_SESSION_KEY,
} from "@/constants/equinorWelcome";
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
import type { PlacerAddress } from "@/types/requisitions";
import { PriceResponse } from "@/types/search.types";
import { usePathname, useRouter } from "next/navigation";

export interface RequisitionPlacerInfo {
	requisitionId: number;
	placerUserId: number | null;
	placerAddresses: PlacerAddress[];
	selectedPlacerAddressId: number | null;
	placerName: string;
}

const PLACER_INFO_STORAGE_KEY = "requisitionPlacerInfo_v2";

interface AppContextType {
	isCartChanging: boolean;
	setIsCartChanging: Dispatch<SetStateAction<boolean>>;

	cartItems: CartKitResponse | undefined;
	setCartItems: (value: CartKitResponse) => void;

	prices: Record<string, number>;
	calculatedPrices: Record<string, number>;
	unitPrices: Record<string, number>;
	cartKitTotals: Record<string, number>;
	getCalculatedPrice: (itemNumber: string, quantity: number) => number;
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

	requisitionPlacerInfo: RequisitionPlacerInfo | null;
	setRequisitionPlacerInfo: (info: RequisitionPlacerInfo | null) => void;
	setSelectedPlacerAddress: (addressId: number) => void;

	orderSummaryTotalPriceFinal: number;
	rabatterTotalPrice: number;

	handleClearCart: () => Promise<void>;

	showCartNotification: (data: CartNotificationData) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
	const { data: profile } = useGetProfileData();

	const [isAuthOpen, setIsAuthOpen] = useState(false);
	const [currentStep, setCurrentStep] = useState(0);
	const [isCartChanging, setIsCartChanging] = useState(false);
	const [cartNotification, setCartNotification] =
		useState<CartNotificationData | null>(null);

	const showCartNotification = (data: CartNotificationData) => {
		setCartNotification(data);
	};

	const [cartItems, setCartItems] = useState<CartKitResponse>();
	const [prices, setPrices] = useState<Record<string, number>>({});
	const [calculatedPrices, setCalculatedPrices] = useState<
		Record<string, number>
	>({});
	const [calculatedPricesByQuantity, setCalculatedPricesByQuantity] = useState<
		Record<string, number>
	>({});
	const [unitPrices, setUnitPrices] = useState<Record<string, number>>({});
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
	const [requisitionPlacerInfo, setRequisitionPlacerInfoState] =
		useState<RequisitionPlacerInfo | null>(() => {
			if (typeof window === "undefined") return null;
			try {
				const raw = window.sessionStorage.getItem(PLACER_INFO_STORAGE_KEY);
				return raw ? (JSON.parse(raw) as RequisitionPlacerInfo) : null;
			} catch {
				return null;
			}
		});

	const setRequisitionPlacerInfo = (info: RequisitionPlacerInfo | null) => {
		setRequisitionPlacerInfoState(info);
		if (typeof window === "undefined") return;
		if (info) {
			window.sessionStorage.setItem(
				PLACER_INFO_STORAGE_KEY,
				JSON.stringify(info),
			);
		} else {
			window.sessionStorage.removeItem(PLACER_INFO_STORAGE_KEY);
		}
	};

	const setSelectedPlacerAddress = (addressId: number) => {
		setRequisitionPlacerInfoState((prev) => {
			if (!prev) return prev;
			const next: RequisitionPlacerInfo = {
				...prev,
				selectedPlacerAddressId: addressId,
			};
			if (typeof window !== "undefined") {
				window.sessionStorage.setItem(
					PLACER_INFO_STORAGE_KEY,
					JSON.stringify(next),
				);
			}
			return next;
		});
	};

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
			const isWelcome = pathname.includes("/welcome");

			if (!isProfile && !isCheckout && !isCart && !isWelcome) {
				const dismissed =
					typeof window !== "undefined" &&
					localStorage.getItem(EQUINOR_WELCOME_DISMISSED_KEY) === "true";
				const seenThisSession =
					typeof window !== "undefined" &&
					sessionStorage.getItem(EQUINOR_WELCOME_SEEN_THIS_SESSION_KEY) ===
						"true";

				if (dismissed || seenThisSession) {
					router.replace("/profile");
				} else {
					router.replace("/welcome");
				}
			}
		}
	}, [profile, pathname, router]);

	const loadCartData = async () => {
		try {
			const cart = await getCart();
			if (!cart) return;

			setCartItems(cart);

			const customerNumber = profile?.defaultCustomerNumber;
			const companyNumber = profile?.defaultCompanyNumber;
			if (!customerNumber || !companyNumber) return;

			for (const item of cart.cart) {
				const priceData = await getProductPrice(
					customerNumber,
					companyNumber,
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
				cart.cartKit?.flatMap((item) => {
					const serviceItems = (
						Object.values(item.services ?? {}) as unknown[]
					).filter(
						(
							v,
						): v is {
							itemNumber: string;
							quantity?: number;
						} => {
							if (v == null || typeof v !== "object") return false;
							const { itemNumber } = v as { itemNumber?: unknown };
							return (
								typeof itemNumber === "string" && itemNumber.trim().length > 0
							);
						},
					);

					return [
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
						...serviceItems.map((service) => ({
							itemNumber: service.itemNumber,
							quantity: service.quantity || 1,
							warehouseNumber: profile?.defaultWarehouseNumber || "",
						})),
					];
				}) ?? [];

			const allPriceRequests = [...priceRequests, ...cartKitPriceRequests];

			if (allPriceRequests.length > 0) {
				const priceResults = await calculateItemPrice(
					allPriceRequests,
					customerNumber,
					companyNumber,
				);

				const initialPrices: Record<string, number> = {};
				const calculatedPrices: Record<string, number> = {};
				const calculatedByQty: Record<string, number> = {};

				const unitPricesMap: Record<string, number> = {};

				for (const item of priceResults) {
					initialPrices[item.itemNumber] = item.basePriceTotal || 0;
					calculatedPrices[item.itemNumber] = item.bestPrice || 0;
					calculatedByQty[`${item.itemNumber}:${item.quantity}`] =
						item.bestPrice || 0;

					const unitPrice =
						item.quantity > 0
							? (item.bestPrice || 0) / item.quantity
							: item.bestPrice || 0;
					unitPricesMap[item.itemNumber] = unitPrice;
				}

				setPrices((prev) => ({
					...prev,
					...initialPrices,
				}));
				setCalculatedPrices((prev) => ({
					...prev,
					...calculatedPrices,
				}));
				setCalculatedPricesByQuantity((prev) => ({
					...prev,
					...calculatedByQty,
				}));
				setUnitPrices((prev) => {
					return {
						...prev,
						...unitPricesMap,
					};
				});

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
						...(Object.values(k.services ?? {}) as unknown[])
							.filter(
								(
									v,
								): v is {
									itemNumber: string;
									quantity?: number;
								} => {
									if (v == null || typeof v !== "object") return false;
									const { itemNumber } = v as { itemNumber?: unknown };
									return (
										typeof itemNumber === "string" &&
										itemNumber.trim().length > 0
									);
								},
							)
							.map((service) => ({
								itemNumber: service.itemNumber,
								quantity: service.quantity || 1,
								warehouseNumber: profile?.defaultWarehouseNumber || "",
							})),
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
							customerNumber,
							companyNumber,
						);
						const fallbackCalculated: Record<string, number> = {};
						const fallbackInitial: Record<string, number> = {};
						const fallbackUnitPrices: Record<string, number> = {};

						for (const item of fallbackResults) {
							fallbackInitial[item.itemNumber] = item.basePriceTotal || 0;
							fallbackCalculated[item.itemNumber] = item.bestPrice || 0;

							// Calculate unit price for fallback items
							const unitPrice =
								item.quantity > 0
									? (item.bestPrice || 0) / item.quantity
									: item.bestPrice || 0;
							fallbackUnitPrices[item.itemNumber] = unitPrice;
						}
						setPrices((prev) => ({ ...prev, ...fallbackInitial }));
						setCalculatedPrices((prev) => ({ ...prev, ...fallbackCalculated }));
						setCalculatedPricesByQuantity((prev) => {
							const next = { ...prev };
							for (const item of fallbackResults) {
								next[`${item.itemNumber}:${item.quantity}`] =
									item.bestPrice || 0;
							}
							return next;
						});
						setUnitPrices((prev) => ({ ...prev, ...fallbackUnitPrices }));
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

	const getCalculatedPrice = (itemNumber: string, quantity: number) => {
		return (
			calculatedPricesByQuantity[`${itemNumber}:${quantity}`] ??
			calculatedPrices[itemNumber] ??
			0
		);
	};

	const totalPrice = useMemo(() => {
		const regularTotal = (cartItems?.cart ?? []).reduce((sum, line) => {
			const unit = calculatedPrices[line.itemNumber] ?? 0;
			return sum + unit * (line.quantity || 1);
		}, 0);

		const kitsTotal = (cartItems?.cartKit ?? []).reduce((sum, kit) => {
			const hose = getCalculatedPrice(
				kit.hose.itemNumber,
				kit.hose.quantity || 1,
			);
			const ferrule1 = getCalculatedPrice(
				kit.ferrule1.itemNumber,
				kit.ferrule1.quantity || 1,
			);
			const ferrule2 = getCalculatedPrice(
				kit.ferrule2.itemNumber,
				kit.ferrule2.quantity || 1,
			);
			const insert1 = getCalculatedPrice(
				kit.insert1.itemNumber,
				kit.insert1.quantity || 1,
			);
			const insert2 = getCalculatedPrice(
				kit.insert2.itemNumber,
				kit.insert2.quantity || 1,
			);
			const servicesTotal = (Object.values(kit.services ?? {}) as unknown[])
				.filter(
					(
						v,
					): v is {
						itemNumber: string;
						quantity?: number;
					} => {
						if (v == null || typeof v !== "object") return false;
						const { itemNumber } = v as { itemNumber?: unknown };
						return (
							typeof itemNumber === "string" && itemNumber.trim().length > 0
						);
					},
				)
				.reduce(
					(acc, service) =>
						acc + getCalculatedPrice(service.itemNumber, service.quantity || 1),
					0,
				);
			return (
				sum + hose + ferrule1 + ferrule2 + insert1 + insert2 + servicesTotal
			);
		}, 0);

		return regularTotal + kitsTotal;
	}, [
		cartItems?.cart,
		cartItems?.cartKit,
		calculatedPrices,
		calculatedPricesByQuantity,
	]);

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
			// we may need these quantities when we implement quantity buttons to send to BE for ferrule 1&2 and insert 1&2 because HOSEQTY is calculated in BE
			const hoseQty = kit.hose?.quantity;
			const ferrule1Qty = kit.ferrule1?.quantity ?? 1;
			const ferrule2Qty = kit.ferrule2?.quantity ?? 1;
			const insert1Qty = kit.insert1?.quantity ?? 1;
			const insert2Qty = kit.insert2?.quantity ?? 1;

			const hosePrice = kit.hose?.itemNumber
				? getCalculatedPrice(kit.hose.itemNumber, kit.hose.quantity || 1)
				: 0;
			const ferrule1Price = kit.ferrule1?.itemNumber
				? getCalculatedPrice(
						kit.ferrule1.itemNumber,
						kit.ferrule1.quantity || 1,
					)
				: 0;
			const ferrule2Price = kit.ferrule2?.itemNumber
				? getCalculatedPrice(
						kit.ferrule2.itemNumber,
						kit.ferrule2.quantity || 1,
					)
				: 0;
			const insert1Price = kit.insert1?.itemNumber
				? getCalculatedPrice(kit.insert1.itemNumber, kit.insert1.quantity || 1)
				: 0;
			const insert2Price = kit.insert2?.itemNumber
				? getCalculatedPrice(kit.insert2.itemNumber, kit.insert2.quantity || 1)
				: 0;
			const serviceItems = (
				Object.values(kit.services ?? {}) as unknown[]
			).filter(
				(
					v,
				): v is {
					itemNumber: string;
					quantity?: number;
				} => {
					if (v == null || typeof v !== "object") return false;
					const { itemNumber } = v as { itemNumber?: unknown };
					return typeof itemNumber === "string" && itemNumber.trim().length > 0;
				},
			);

			const servicesTotal = serviceItems.reduce(
				(acc, service) =>
					acc + getCalculatedPrice(service.itemNumber, service.quantity || 1),
				0,
			);

			totals[kit.hexagonId] =
				hosePrice +
				ferrule1Price +
				ferrule2Price +
				insert1Price +
				insert2Price +
				servicesTotal;

			if (process.env.NODE_ENV !== "production") {
				console.log("[cartKitTotals] kit", {
					hexagonId: kit.hexagonId,
					hose: {
						itemNumber: kit.hose?.itemNumber,
						quantity: hoseQty,
						price: hosePrice,
					},
					ferrule1: {
						itemNumber: kit.ferrule1?.itemNumber,
						quantity: ferrule1Qty,
						price: ferrule1Price,
					},
					ferrule2: {
						itemNumber: kit.ferrule2?.itemNumber,
						quantity: ferrule2Qty,
						price: ferrule2Price,
					},
					insert1: {
						itemNumber: kit.insert1?.itemNumber,
						quantity: insert1Qty,
						price: insert1Price,
					},
					insert2: {
						itemNumber: kit.insert2?.itemNumber,
						quantity: insert2Qty,
						price: insert2Price,
					},
					services: serviceItems.map((s) => ({
						itemNumber: s.itemNumber,
						quantity: s.quantity,
						price: calculatedPrices[s.itemNumber] ?? 0,
					})),
					servicesTotal,
					total: totals[kit.hexagonId],
				});
			}
		}

		return totals;
	}, [cartItems?.cartKit, calculatedPrices, calculatedPricesByQuantity]);

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

		// Check if it's a kit item by looking in cartKit array
		const kitBackup = cartItems?.cartKit?.find(
			(i) => i.cartLine === numericLine,
		);

		if (kitBackup) {
			const itemNumbersToRemove = [
				kitBackup.hose.itemNumber,
				kitBackup.ferrule1.itemNumber,
				kitBackup.ferrule2.itemNumber,
				kitBackup.insert1.itemNumber,
				kitBackup.insert2.itemNumber,
				...(Object.values(kitBackup.services ?? {}) as unknown[])
					.filter(
						(
							v,
						): v is {
							itemNumber: string;
						} => {
							if (v == null || typeof v !== "object") return false;
							const { itemNumber } = v as { itemNumber?: unknown };
							return (
								typeof itemNumber === "string" && itemNumber.trim().length > 0
							);
						},
					)
					.map((s) => s.itemNumber),
			];

			setCartItems((prev) => {
				if (!prev?.cartKit) return prev;
				return {
					...prev,
					cartKit: prev.cartKit.filter((i) => i.cartLine !== numericLine),
				};
			});

			setPrices((prev) => {
				const updated = { ...prev };
				itemNumbersToRemove.forEach((itemNum) => delete updated[itemNum]);
				return updated;
			});
			setCalculatedPrices((prev) => {
				const updated = { ...prev };
				itemNumbersToRemove.forEach((itemNum) => delete updated[itemNum]);
				return updated;
			});
			setSurChargePrices((prev) => {
				const updated = { ...prev };
				itemNumbersToRemove.forEach((itemNum) => delete updated[itemNum]);
				return updated;
			});
			setRabatterPrices((prev) => {
				const updated = { ...prev };
				itemNumbersToRemove.forEach((itemNum) => delete updated[itemNum]);
				return updated;
			});
			setOrderSummaryTotalPrice((prev) => {
				const updated = { ...prev };
				itemNumbersToRemove.forEach((itemNum) => delete updated[itemNum]);
				return updated;
			});

			try {
				await removeFromCart(numericLine);
				setIsCartChanging((v) => !v);
			} catch (error) {
				setCartItems((prev) => {
					if (!prev?.cartKit) return prev;
					return {
						...prev,
						cartKit: [...prev.cartKit, kitBackup],
					};
				});
				console.error("Error removing cart kit item:", error);
				throw error;
			}
			return;
		}

		// Handle regular cart item removal
		const backup = cartItems?.cart?.find(
			(i) => Number(i.cartLine) === numericLine,
		);

		const itemNumberToRemove = backup?.itemNumber;

		setCartItems((prev) => {
			if (!prev?.cart) return prev;
			return {
				...prev,
				cart: prev.cart.filter((i) => Number(i.cartLine) !== numericLine),
				cartKit: prev.cartKit,
			};
		});

		if (itemNumberToRemove) {
			setPrices((prev) => {
				const updated = { ...prev };
				delete updated[itemNumberToRemove];
				return updated;
			});
			setCalculatedPrices((prev) => {
				const updated = { ...prev };
				delete updated[itemNumberToRemove];
				return updated;
			});
			setSurChargePrices((prev) => {
				const updated = { ...prev };
				delete updated[itemNumberToRemove];
				return updated;
			});
			setRabatterPrices((prev) => {
				const updated = { ...prev };
				delete updated[itemNumberToRemove];
				return updated;
			});
			setOrderSummaryTotalPrice((prev) => {
				const updated = { ...prev };
				delete updated[itemNumberToRemove];
				return updated;
			});
		}

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
			setRequisitionPlacerInfo(null);
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
			setRequisitionPlacerInfo(null);
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
				unitPrices,
				cartKitTotals,
				getCalculatedPrice,
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

				requisitionPlacerInfo,
				setRequisitionPlacerInfo,
				setSelectedPlacerAddress,

				rabatterTotalPrice,
				orderSummaryTotalPriceFinal,

				showCartNotification,
			}}>
			<CartAddedNotification
				data={cartNotification}
				onClose={() => setCartNotification(null)}
			/>
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
