import { useAppContext } from "@/lib/appContext";

export interface OrderSummaryPrices {
	originalPrice: number;
	discounts: number;
	sumAfterDiscount: number;
	deliverySurcharge: number;
	vat: number;
	totalIncVat: number;
}

export const useOrderSummary = (): OrderSummaryPrices => {
	const { totalPrice, surChargeTotalPrice, rabatterTotalPrice } =
		useAppContext();

	const originalPrice = totalPrice; // basePriceTotal
	const discounts = -rabatterTotalPrice; // -flatDiscount
	const sumAfterDiscount = totalPrice - rabatterTotalPrice; // bestPrice - flatDiscount
	const deliverySurcharge = surChargeTotalPrice; // surcharge
	const vat = (totalPrice - rabatterTotalPrice) * 0.25; // (Sum etter rabatt)*0,25
	const totalIncVat = totalPrice - rabatterTotalPrice + ((totalPrice - rabatterTotalPrice) * 0.25) + surChargeTotalPrice; // bestPrice+MVA(25%)+Surcharge

	return {
		originalPrice,
		discounts,
		sumAfterDiscount,
		deliverySurcharge,
		vat,
		totalIncVat,
	};
};
