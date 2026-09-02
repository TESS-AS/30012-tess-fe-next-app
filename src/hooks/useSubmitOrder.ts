import {
	SHOW_EXCEL_EXPORT_CUSTOMER_NUMBER,
	SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER,
} from "@/constants/checkout";
import { useAppContext } from "@/lib/appContext";
import { salesOrder, excelOrderConfirmation } from "@/services/orders.service";
import { Order } from "@/types/orders.types";
import { ProfileUser, SalesOrderAddress } from "@/types/user.types";
import axios from "axios";

export interface SubmitOrderContact {
	phone?: string;
	email?: string;
}

export const useSubmitOrder = (
	isPunchoutUser: boolean,
	profile: ProfileUser | null,
	selectedAddress: SalesOrderAddress,
	handleArchiveCart: () => Promise<void>,
	contact?: SubmitOrderContact,
) => {
	const { requisitionPlacerInfo } = useAppContext();
	const formatDate = (d: Date) => d.toISOString().split("T")[0];
	const submitOrder = async (
		orderData: Order,
		options?: { archiveCartAfterExcelExport?: boolean },
	): Promise<Order | null> => {
		const baseDispatchDate = new Date();
		if (
			String(profile?.defaultCustomerNumber ?? "") ===
			SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER
		) {
			baseDispatchDate.setDate(baseDispatchDate.getDate() + 14);
		}
		const dispatchDate = formatDate(baseDispatchDate);

		const deliveryPhone = (contact?.phone ?? profile?.phoneNumber ?? "").trim();
		const deliveryEmail = (contact?.email ?? profile?.email ?? "").trim();

		const payload: Order = {
			...orderData,
			salesOrderHeader: {
				...orderData.salesOrderHeader,
				customersOrderNumberEdifact: "EDIFACT123",
				orderType: profile?.defaultWarehosueName === "L01" ? "ED" : "KM",
				customerNumber: profile?.defaultCustomerNumber ?? "",
				warehouseNumber: String(profile?.defaultWarehouseNumber ?? ""),
				termsOfDelivery: "DAP",
				// termsOfPayment: "NET",
				dispatchDate,
				// Attribute the budget_transaction to the placer, not the
				// approver. BE reads this via `orderBody.salesOrderHeader
				// ?.requisitionId` in `consumeForRequisition`.
				...(requisitionPlacerInfo
					? { requisitionId: requisitionPlacerInfo.requisitionId }
					: {}),
			},
			salesOrderAddresses: [selectedAddress],
			...(deliveryPhone || deliveryEmail
				? {
						salesOrderAddressesDeliveryInfo: {
							phone: deliveryPhone,
							email: deliveryEmail,
							addressType: "D",
						},
					}
				: {}),
		};

		try {
			const customerNumber = profile?.defaultCustomerNumber;
			const isExcelCustomer = SHOW_EXCEL_EXPORT_CUSTOMER_NUMBER.includes(
				profile?.defaultCustomerNumber ?? "",
			);

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
				if (options?.archiveCartAfterExcelExport) {
					await handleArchiveCart();
				}
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
			// BE returns 409 with { annualAmount, used, available, orderTotal }
			// when a direct (non-requisition) order exceeds the user's remaining
			// budget. Re-throw a friendlier Error so callers can toast with the
			// actual numbers.
			if (
				axios.isAxiosError(err) &&
				err.response?.status === 409 &&
				err.response?.data?.error === "Order exceeds available budget"
			) {
				const { available, orderTotal } = err.response.data as {
					available?: number;
					orderTotal?: number;
				};
				const nf = new Intl.NumberFormat("nb-NO");
				const availableStr =
					typeof available === "number" ? `${nf.format(Math.round(available))} kr` : "—";
				const orderTotalStr =
					typeof orderTotal === "number"
						? `${nf.format(Math.round(orderTotal))} kr`
						: "—";
				const budgetError = new Error(
					`Ordren overskrider tilgjengelig budsjett. Tilgjengelig: ${availableStr}, ordretotal: ${orderTotalStr}.`,
				);
				(budgetError as Error & { code?: string }).code = "BUDGET_EXCEEDED";
				console.error("Order submission blocked by budget:", err.response.data);
				throw budgetError;
			}
			console.error("Order submission failed:", err);
			throw err;
		}
	};

	return submitOrder;
};
