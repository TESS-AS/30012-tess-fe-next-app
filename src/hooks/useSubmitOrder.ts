import { salesOrder } from "@/services/orders.service";
import { Order } from "@/types/orders.types";

export const useSubmitOrder = (
	isPunchoutUser: boolean,
	profile: any,
	selectedAddress: any,
	handleArchiveCart: () => Promise<void>,
) => {
	const submitOrder = async (orderData: Order): Promise<Order | null> => {
		const payload: Order = {
			...orderData,
			salesOrderHeader: {
				...orderData.salesOrderHeader,
				customersOrderNumberEdifact: "EDIFACT123",
				orderType: "zz",
				customerNumber: "169999",
				warehouseNumber: String(profile.defaultWarehouseNumber),
				termsOfDelivery: "DAP",
				termsOfPayment: "NET",
				dispatchDate: new Date().toISOString().split("T")[0],
			},
			salesOrderAddresses: [selectedAddress],
		};

		try {
			const response = await salesOrder(payload);

			if (!isPunchoutUser && typeof response !== "string" && response?.order) {
				await handleArchiveCart();
				return response.order;
			} else {
				const parser = new DOMParser();
				const doc = parser.parseFromString(response as string, "text/html");
				const form = doc.getElementById("punchoutForm") as HTMLFormElement;

				if (form) {
					const actionUrl = form.action;
					const submitForm = document.createElement("form");
					submitForm.method = form.method;
					submitForm.action = actionUrl;

					Array.from(form.getElementsByTagName("input")).forEach((input) => {
						const hiddenInput = document.createElement("input");
						hiddenInput.type = "hidden";
						hiddenInput.name = input.name;
						hiddenInput.value = input.value;
						submitForm.appendChild(hiddenInput);
					});

					document.body.appendChild(submitForm);
					submitForm.submit();
					document.body.removeChild(submitForm);
				}

				return null;
			}
		} catch (err) {
			console.error("Order submission failed:", err);
			throw err;
		}
	};

	return submitOrder;
};
