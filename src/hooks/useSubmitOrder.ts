import { SHOW_EXCEL_EXPORT_CUSTOMER_NUMBER } from "@/constants/checkout";
import { salesOrder, excelOrderConfirmation } from "@/services/orders.service";
import { Order } from "@/types/orders.types";
import { ProfileUser, SalesOrderAddress } from "@/types/user.types";

export const useSubmitOrder = (
	isPunchoutUser: boolean,
	profile: ProfileUser | null,
	selectedAddress: SalesOrderAddress,
	handleArchiveCart: () => Promise<void>,
) => {
	const submitOrder = async (orderData: Order): Promise<Order | null> => {
		const payload: Order = {
			...orderData,
			salesOrderHeader: {
				...orderData.salesOrderHeader,
				customersOrderNumberEdifact: "EDIFACT123",
				orderType: "KM",
				customerNumber: profile?.defaultCustomerNumber ?? "",
				warehouseNumber: String(profile?.defaultWarehouseNumber ?? ""),
				termsOfDelivery: "DAP",
				// termsOfPayment: "NET",
				dispatchDate: new Date().toISOString().split("T")[0],
			},
			salesOrderAddresses: [selectedAddress],
		};

		try {
			const customerNumber = profile?.defaultCustomerNumber;
			const isExcelCustomer =
				customerNumber === SHOW_EXCEL_EXPORT_CUSTOMER_NUMBER;

			if (isExcelCustomer) {
				const { blob, filename } = await excelOrderConfirmation(payload);

				// Create download link and trigger download
				const url = window.URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.href = url;
				link.download = filename;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				window.URL.revokeObjectURL(url);

				localStorage.removeItem("selectedHoseRows");
				// Don't clear cart when exporting to Excel
				// await handleArchiveCart();
				return null;
			} else {
				const updatedPayload = payload.salesOrderHeader.customerReference
					? payload
					: {
							...payload,
							salesOrderHeader: {
								...payload.salesOrderHeader,
								customerReference: `${profile?.firstName} ${profile?.lastName}`,
							},
						};

				const response = await salesOrder(updatedPayload);

				localStorage.removeItem("selectedHoseRows");

				if (
					!isPunchoutUser &&
					typeof response !== "string" &&
					response?.order
				) {
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
			}
		} catch (err) {
			console.error("Order submission failed:", err);
			throw err;
		}
	};

	return submitOrder;
};
