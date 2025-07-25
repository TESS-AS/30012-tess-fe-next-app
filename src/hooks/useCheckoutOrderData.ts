import { useEffect, useState } from "react";

import { Order } from "@/types/orders.types";

export function useCheckoutOrderData(
	cartItems: any[],
	profile: any,
	calculatedPrices: Record<string, number>,
) {
	const [orderData, setOrderData] = useState<Order>({
		documentControl: { companyCode: "" },
		salesOrderHeader: {
			customerReference: "",
			customersOrderNumberEdifact: "",
			customerNumber: "",
			dispatchDate: "",
			orderType: "",
			customersOrderReference: "",
			warehouseNumber: "",
			termsOfDelivery: "",
			termsOfPayment: "",
			paidAmount: 0,
			cashRegister: "",
			text: "",
		},
		salesOrderAddresses: [],
		salesOrderLines: [],
	});

	useEffect(() => {
		if (!cartItems?.length || !profile) return;

		const companyCode =
			Number(profile.defaultCompanyNumber) < 10
				? `0${profile.defaultCompanyNumber}`
				: profile.defaultCompanyNumber?.toString();

		setOrderData((prev) => ({
			...prev,
			documentControl: { companyCode },
			salesOrderLines: cartItems.map((item, idx) => ({
				customerOrderLine: idx + 1,
				warehouseNumber: String(profile.defaultWarehouseNumber),
				orderType: "S2",
				itemCode: item.itemNumber,
				orderedQuantity: item.quantity,
				salesPrice: calculatedPrices[item.itemNumber] || 0,
				requestedDeliveryDate: new Date().toISOString().split("T")[0],
				accountPart3: "",
				accountPart4: String(profile.userId || ""),
				accountPart5: "",
				text: "",
			})),
		}));
	}, [cartItems, profile]);

	return [orderData, setOrderData] as const;
}
