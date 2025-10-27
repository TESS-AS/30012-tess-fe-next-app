import { useEffect, useState } from "react";

import { CartKitResponse } from "@/types/carts.types";
import { Order, OrderLines } from "@/types/orders.types";

export function useCheckoutOrderData(
	cartItems: CartKitResponse,
	profile: any,
	calculatedPrices: Record<string, number>,
): [Order, React.Dispatch<React.SetStateAction<Order>>] {
	const cart = cartItems?.cart;
	const cartKit = cartItems?.cartKit;
	const companyNumber = profile?.defaultCompanyNumber;
	const warehouseNumber = profile?.defaultWarehouseNumber;
	const userId = profile?.userId;
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
			// termsOfPayment: "",
			paidAmount: 0,
			cashRegister: "",
			text: "",
		},
		salesOrderAddresses: [],
		salesOrderLines: [],
	});

	useEffect(() => {
		if (!companyNumber || !warehouseNumber || !userId) return;

		const companyCode = companyNumber
			? Number(companyNumber) < 10
				? `0${companyNumber}`
				: companyNumber.toString()
			: "";

		let salesOrderLines: OrderLines[] = [];
		let lineCounter = 1;

		// Handle regular cart items
		if (cart?.length) {
			salesOrderLines = cart.map((item) => ({
				customerOrderLine: lineCounter++,
				warehouseNumber: warehouseNumber,
				orderType: "S2",
				itemCode: item.itemNumber,
				orderedQuantity: item.quantity,
				salesPrice: calculatedPrices[item.itemNumber] || 0,
				requestedDeliveryDate: new Date().toISOString().split("T")[0],
				accountPart3: "",
				accountPart4: String(profile.userId || ""),
				accountPart5: "",
				text: "",
			}));
		}

		// Handle cartKit items
		if (cartKit?.length) {
			cartKit.forEach((kitItem) => {
				console.log(kitItem, "kiteitem");
				// Add each component of the kit with its hexagonId
				const kitComponents = [
					{
						itemNumber: kitItem.hose.itemNumber,
						quantity: kitItem.hose.quantity,
					},
					{
						itemNumber: kitItem.ferrule1.itemNumber,
						quantity: kitItem.ferrule1.quantity,
					},
					{
						itemNumber: kitItem.ferrule2.itemNumber,
						quantity: kitItem.ferrule2.quantity,
					},
					{
						itemNumber: kitItem.insert1.itemNumber,
						quantity: kitItem.insert1.quantity,
					},
					{
						itemNumber: kitItem.insert2.itemNumber,
						quantity: kitItem.insert2.quantity,
					},
				];

				const kitLines = kitComponents.map((component) => ({
					customerOrderLine: lineCounter++,
					warehouseNumber: warehouseNumber,
					orderType: "S2",
					itemCode: component.itemNumber,
					orderedQuantity: component.quantity,
					salesPrice: calculatedPrices[component.itemNumber] || 0,
					requestedDeliveryDate: new Date().toISOString().split("T")[0],
					accountPart3: "",
					accountPart4: String(userId || ""),
					accountPart5: "",
					text: `${kitItem.hexagonId};${kitItem.hose.itemDescription}`,
				}));

				salesOrderLines = [...salesOrderLines, ...kitLines];
			});
		}

		setOrderData((prev) => ({
			...prev,
			documentControl: { companyCode },
			salesOrderLines,
		}));
	}, [cart, cartKit, companyNumber, warehouseNumber, userId, calculatedPrices]);

	return [orderData, setOrderData] as const;
}
