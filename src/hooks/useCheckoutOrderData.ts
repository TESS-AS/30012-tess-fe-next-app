import { useEffect, useState } from "react";

import { CartKitResponse } from "@/types/carts.types";
import { Order, OrderLines } from "@/types/orders.types";

export function useCheckoutOrderData(
	cartItems: CartKitResponse,
	profile: any,
	unitPrices: Record<string, number>,
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
			text: profile?.email,
		},
		salesOrderAddresses: [],
		salesOrderLines: [],
	});

	useEffect(() => {
		if (!companyNumber || !warehouseNumber || !userId) return;

		const companyCode = companyNumber ? String(companyNumber).trim() : "";

		let salesOrderLines: OrderLines[] = [];
		let lineCounter = 1;

		// Handle regular cart items
		if (cart?.length) {
			salesOrderLines = cart.map((item) => {
				const unitPrice = unitPrices[item.itemNumber] || 0;
				return {
					customerOrderLine: lineCounter++,
					warehouseNumber: warehouseNumber,
					orderType: "S2",
					itemCode: item.itemNumber,
					orderedQuantity: item.quantity,
					salesPrice: unitPrice,
					requestedDeliveryDate: new Date().toISOString().split("T")[0],
					accountPart3: "",
					accountPart4: String(profile.userId || ""),
					accountPart5: "",
					text: "",
				};
			});
		}

		// Handle cartKit items
		if (cartKit?.length) {
			cartKit.forEach((kitItem) => {
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

				const serviceItemNumbers = Object.values(kitItem.services ?? {}).filter(
					(v): v is string => typeof v === "string" && v.trim().length > 0,
				);

				const kitLines = kitComponents.map((component) => ({
					customerOrderLine: lineCounter++,
					warehouseNumber: warehouseNumber,
					orderType: "S2",
					itemCode: component.itemNumber,
					orderedQuantity: component.quantity,
					salesPrice: unitPrices[component.itemNumber] || 0,
					requestedDeliveryDate: new Date().toISOString().split("T")[0],
					accountPart3: "",
					accountPart4: String(userId || ""),
					accountPart5: "",
					text: `${kitItem.hexagonId};${kitItem.hose.itemDescription}`,
				}));

				const serviceLines = serviceItemNumbers.map((itemNumber) => ({
					customerOrderLine: lineCounter++,
					warehouseNumber: warehouseNumber,
					orderType: "S2",
					itemCode: itemNumber,
					orderedQuantity: 1,
					salesPrice: unitPrices[itemNumber] || 0,
					requestedDeliveryDate: new Date().toISOString().split("T")[0],
					accountPart3: "",
					accountPart4: String(userId || ""),
					accountPart5: "",
					text: `${kitItem.hexagonId};${kitItem.hose.itemDescription}`,
				}));

				salesOrderLines = [...salesOrderLines, ...kitLines, ...serviceLines];
			});
		}

		setOrderData((prev) => ({
			...prev,
			documentControl: { companyCode },
			salesOrderLines,
		}));
	}, [cart, cartKit, companyNumber, warehouseNumber, userId, unitPrices]);

	return [orderData, setOrderData] as const;
}
