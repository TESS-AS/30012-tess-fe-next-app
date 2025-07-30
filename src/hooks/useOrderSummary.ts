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
  const { totalPrice, surChargeTotalPrice, rabatterTotalPrice } = useAppContext();

  const originalPrice = totalPrice;
  const discounts = rabatterTotalPrice;
  const sumAfterDiscount = totalPrice;
  const deliverySurcharge = surChargeTotalPrice;
  const vat = totalPrice + surChargeTotalPrice - rabatterTotalPrice;
  const totalIncVat = totalPrice + surChargeTotalPrice - rabatterTotalPrice;

  return {
    originalPrice,
    discounts,
    sumAfterDiscount,
    deliverySurcharge,
    vat,
    totalIncVat,
  };
};
