import { useAppContext } from "@/lib/appContext";

export interface OrderSummaryPrices {
	originalPrice: number;
	discounts: number;
	sumAfterDiscount: number;
	deliverySurcharge: number;
	vat: number;
	totalIncVat: number;
	orderSummaryTotalPriceFromAppContext: number;
}

export const useOrderSummary = (): OrderSummaryPrices => {
	const {
		totalPrice,
		surChargeTotalPrice,
		rabatterTotalPrice,
		orderSummaryTotalPriceFinal,
	} = useAppContext();

	const originalPrice = totalPrice;
	const discounts = rabatterTotalPrice;
	const sumAfterDiscount = totalPrice;
	const deliverySurcharge = surChargeTotalPrice;
	const vat = sumAfterDiscount*0.25;
	const totalIncVat = totalPrice + surChargeTotalPrice + vat - rabatterTotalPrice;
	const orderSummaryTotalPriceFromAppContext = orderSummaryTotalPriceFinal;

	return {
		originalPrice,
		discounts,
		sumAfterDiscount,
		deliverySurcharge,
		vat,
		totalIncVat,
		orderSummaryTotalPriceFromAppContext,
	};
};
