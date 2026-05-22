"use client";

import { useState } from "react";

import { FeedbackModal } from "@/components/checkout/feedback-modal";
import { OrderConfirmation } from "@/components/checkout/order-confirmation";
import OrderSummary from "@/components/checkout/order-summary";
import { OrderTrackingModal } from "@/components/checkout/order-tracking-modal";
import { PlacerAddressPicker } from "@/components/checkout/placer-address-picker";
import StepConfirmation from "@/components/checkout/StepConfirmation";
import StepContactDelivery from "@/components/checkout/StepContactDelivery";
import StepPayment from "@/components/checkout/StepPayment";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { FeedbackSideTab } from "@/components/ui/feedback-side-tab";
import {
	Modal,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from "@/components/ui/modal";
import Stepper from "@/components/ui/stepper";
import {
	HIDE_CHECKOUT_FOR_SPECIFIC_CUSTOMER_NUMBER,
	SHOW_EXCEL_EXPORT_CUSTOMER_NUMBER,
} from "@/constants/checkout";
import { useCheckoutOrderData } from "@/hooks/useCheckoutOrderData";
import { useContactPerson } from "@/hooks/useContactPerson";
import { useFeedback } from "@/hooks/useFeedback";
import { useGetDefaultAddress } from "@/hooks/useGetDefaultAddress";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import { useModals } from "@/hooks/useModals";
import { useOrderStepper } from "@/hooks/useOrderStepper";
import { useSubmitOrder } from "@/hooks/useSubmitOrder";
import { useAppContext } from "@/lib/appContext";
import { CartKitItem, CartLine } from "@/types/carts.types";
import { Order, OrderResponse } from "@/types/orders.types";
import type { PayPalScriptOptions } from "@paypal/paypal-js";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

const initialOptions: PayPalScriptOptions = {
	clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
	components: "buttons",
	currency: "USD",
};

export default function CheckoutPage() {
	const t = useTranslations("");
	const {
		cartItems,
		unitPrices,
		calculatedPrices,
		handleArchiveCart,
		updatedAddress,
		setUpdatedAddress,
		requisitionPlacerInfo,
		setSelectedPlacerAddress,
	} = useAppContext();

	const { data: profile, isLoading: isProfileLoading } = useGetProfileData();
	const { data: defaultAddress, isLoading: isAddressLoading } =
		useGetDefaultAddress();
	const { submitFeedback, loading } = useFeedback();

	const selectedPlacerAddress =
		requisitionPlacerInfo?.placerAddresses.find(
			(a) => a.addressId === requisitionPlacerInfo.selectedPlacerAddressId,
		) ?? requisitionPlacerInfo?.placerAddresses[0];

	const placerShippingOverride =
		requisitionPlacerInfo && selectedPlacerAddress
			? {
					name: requisitionPlacerInfo.placerName,
					addressLine1: selectedPlacerAddress.addressLine1 ?? "",
					addressLine2: selectedPlacerAddress.addressLine2 ?? "",
					addressLine3: selectedPlacerAddress.addressLine3 ?? "",
					addressLine4: selectedPlacerAddress.city ?? "",
					postalCode: selectedPlacerAddress.postalCode ?? "",
					partyQualifier: "DP",
					country: selectedPlacerAddress.countryCode ?? "NO",
				}
			: null;

	const placerAddressForCard =
		requisitionPlacerInfo && selectedPlacerAddress
			? {
					name: requisitionPlacerInfo.placerName,
					addressName: requisitionPlacerInfo.placerName,
					street: selectedPlacerAddress.addressLine1 ?? "",
					houseNumber: selectedPlacerAddress.addressLine2 ?? "",
					extraInfo: selectedPlacerAddress.addressLine3 ?? "",
					postalCode: selectedPlacerAddress.postalCode ?? "",
					city: selectedPlacerAddress.city ?? "",
					countryCode: selectedPlacerAddress.countryCode ?? "",
				}
			: null;

	const selectedAddress = defaultAddress?.[0];

	const { contactPerson, handleSave: handleContactPersonSave } =
		useContactPerson();
	const modals = useModals();
	const { currentStep, setCurrentStep, goToNext } = useOrderStepper();

	const [paymentMethod, setPaymentMethod] = useState("faktura");
	const [dimensionInputMode, setDimensionInputMode] = useState("manual");
	const [showFeedbackModal, setShowFeedbackModal] = useState(false);
	const [showTrackingModal, setShowTrackingModal] = useState(false);
	const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
	const [showWarning, setShowWarning] = useState(true);
	const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
	const [excelArchiveModalOpen, setExcelArchiveModalOpen] = useState(false);
	const [submittedOrder, setSubmittedOrder] = useState<OrderResponse | null>(
		null,
	);

	const [orderData, setOrderData] = useCheckoutOrderData(
		{
			cart: cartItems?.cart as CartLine[],
			cartKit: cartItems?.cartKit as CartKitItem[],
		},
		profile,
		unitPrices, //unitPrices or calculatedPrices
	);
	const submitOrder = useSubmitOrder(
		profile?.punchout || false,
		profile,
		placerShippingOverride ?? {
			name: updatedAddress?.addressName || selectedAddress?.addressName || "",
			addressLine1:
				`${updatedAddress?.street} ${updatedAddress?.houseNumber}` ||
				`${selectedAddress?.addressLine1} ${selectedAddress?.addressLine2}` ||
				"",
			addressLine2:
				updatedAddress?.houseNumber || selectedAddress?.addressLine2 || "",
			addressLine3:
				updatedAddress?.extraInfo || selectedAddress?.addressLine3 || "",
			addressLine4: updatedAddress?.city || selectedAddress?.city || "",
			postalCode:
				updatedAddress?.postalCode || selectedAddress?.postalCode || "",
			partyQualifier: "DP",
			country: "NO",
		},
		handleArchiveCart,
	);

	const steps = [
		t("Checkout.steps.delivery"),
		t("Checkout.steps.payment"),
		t("Checkout.steps.confirm"),
	];

	const renderStepContent = () => {
		switch (currentStep) {
			case 0:
				if (isProfileLoading || isAddressLoading) {
					return (
						<div className="flex h-[400px] items-center justify-center">
							<div className="h-8 w-8 animate-spin rounded-full border-4 border-[#009640] border-r-transparent" />
						</div>
					);
				}
				return (
					<>
						{requisitionPlacerInfo && (
							<PlacerAddressPicker
								placerName={requisitionPlacerInfo.placerName}
								addresses={requisitionPlacerInfo.placerAddresses}
								selectedAddressId={
									requisitionPlacerInfo.selectedPlacerAddressId
								}
								onSelect={setSelectedPlacerAddress}
							/>
						)}
						<StepContactDelivery
							contactPerson={contactPerson}
							handleContactPersonSave={handleContactPersonSave}
							selectedAddress={
								placerAddressForCard ?? updatedAddress ?? selectedAddress
							}
							showWarning={showWarning}
							setShowWarning={setShowWarning}
							onSave={setUpdatedAddress}
						/>
					</>
				);
			case 1:
				return (
					<StepPayment
						paymentMethod={paymentMethod}
						setPaymentMethod={setPaymentMethod}
						orderData={orderData}
						setOrderData={setOrderData}
						dimensionInputMode={dimensionInputMode}
						setDimensionInputMode={setDimensionInputMode}
					/>
				);
			case 2:
				return (
					<StepConfirmation
						contactPerson={contactPerson}
						selectedAddress={
							placerAddressForCard ?? updatedAddress ?? selectedAddress
						}
						orderData={orderData}
						modals={modals}
						paymentMethod={paymentMethod}
						setPaymentMethod={setPaymentMethod}
						setOrderData={setOrderData}
						dimensionInputMode={dimensionInputMode}
						setDimensionInputMode={setDimensionInputMode}
						handleContactPersonSave={handleContactPersonSave}
					/>
				);
			default:
				return null;
		}
	};

	const handleCheckout = async () => {
		if (!profile?.punchout) {
			if (currentStep < 2) {
				if (!selectedAddress?.addressLine1 && !updatedAddress?.street) {
					toast.error(t("Checkout.errors.selectAddress"));
					return;
				}

				// if (currentStep === 1) {
				// 	const { customersOrderReference, customerReference } =
				// 		orderData.salesOrderHeader;
				// 	const accountPart3 = orderData.salesOrderLines?.[0]?.accountPart3;

				// 	if (!customersOrderReference) {
				// 		toast.error(t("Checkout.errors.dimensionsRequired"));
				// 		return;
				// 	}
				// }
				goToNext();
				return;
			}

			const isExcelCustomer =
			 SHOW_EXCEL_EXPORT_CUSTOMER_NUMBER.includes(profile?.defaultCustomerNumber || "");			
			 if (isExcelCustomer) {
				setExcelArchiveModalOpen(true);
				return;
			}

			setIsCheckoutLoading(true);

			try {
				const result = await submitOrder(orderData);
				if (result) {
					const orderResponse: OrderResponse = {
						data: "",
						order: result as any,
					};
					setSubmittedOrder(orderResponse);
					setShowOrderConfirmation(true);
					setTimeout(() => setShowFeedbackModal(true), 1000);
				}
			} catch (error) {
				console.error("Order submission failed:", error);
				toast.error(t("Checkout.errors.orderSubmissionFailed"));
			} finally {
				setIsCheckoutLoading(false);
			}
		}
	};

	const confirmExcelCheckout = async (archiveCartAfterExcelExport: boolean) => {
		setExcelArchiveModalOpen(false);
		setIsCheckoutLoading(true);
		try {
			await submitOrder(orderData, { archiveCartAfterExcelExport });
			toast.success(t("Checkout.excelExportSuccess"));
		} catch (error) {
			console.error("Order submission failed:", error);
			toast.error(t("Checkout.errors.orderSubmissionFailed"));
		} finally {
			setIsCheckoutLoading(false);
		}
	};

	const ratingValues: Record<number, string> = {
		1: t("Checkout.feedback.ratings.1"),
		2: t("Checkout.feedback.ratings.2"),
		3: t("Checkout.feedback.ratings.3"),
		4: t("Checkout.feedback.ratings.4"),
		5: t("Checkout.feedback.ratings.5"),
	};

	if (
		profile?.defaultCustomerNumber ===
		HIDE_CHECKOUT_FOR_SPECIFIC_CUSTOMER_NUMBER
	) {
		return null;
	}

	return (
		<PayPalScriptProvider options={initialOptions}>
			<main className="container mx-auto min-h-screen px-4 py-6 md:px-0 md:py-10">
				<FeedbackSideTab />
				{!showOrderConfirmation ? (
					<>
						<Breadcrumb
							items={[
								{ href: "/", label: t("BreadCrumbs.home") },
								{ href: "/checkout", label: t("BreadCrumbs.checkout") },
							]}
						/>
						<Stepper
							steps={steps}
							currentStep={currentStep}
							onStepClick={setCurrentStep}
						/>

						{placerShippingOverride && (
							<div className="mt-4 rounded-md border border-[#C2E6CE] bg-[#DCF7E0] px-4 py-3 text-sm text-[#0F1912]">
								<span className="font-semibold">
									{t("Checkout.placerBanner.title")}:
								</span>{" "}
								{t("Checkout.placerBanner.body", {
									name: placerShippingOverride.name,
									address: [
										placerShippingOverride.addressLine1,
										placerShippingOverride.addressLine4,
										placerShippingOverride.postalCode,
									]
										.filter(Boolean)
										.join(", "),
								})}
							</div>
						)}

						<div className="grid grid-cols-1 items-start gap-6 pt-6 pb-4 lg:grid-cols-12 lg:gap-10">
							<div
								className={`${currentStep !== 2 ? "lg:col-span-8" : "lg:col-span-12"}`}>
								{renderStepContent()}
							</div>
							{currentStep !== 2 && (
								<div className="lg:col-span-4">
									<OrderSummary
										handleCheckout={handleCheckout}
										currentStep={currentStep}
									/>
								</div>
							)}
						</div>

						{currentStep === 2 && (
							<div>
								<OrderSummary
									handleCheckout={handleCheckout}
									isCheckoutLoading={isCheckoutLoading}
									currentStep={currentStep}
								/>
							</div>
						)}
					</>
				) : (
					<>
						<OrderConfirmation
							orderNumber={
								submittedOrder?.order?.Ordrebekreftelse?.Ordrenummer || ""
							}
							date={submittedOrder?.order?.Ordrebekreftelse?.Dato || ""}
							paymentMethod="Faktura"
							name={
								submittedOrder?.order?.Ordrebekreftelse?.[
									"Navn (Kontaktperson)"
								] || ""
							}
							company={submittedOrder?.order?.Ordrebekreftelse?.Firma || ""}
							address={
								submittedOrder?.order?.Ordrebekreftelse?.Addresse?.[0]
									?.addressLine1 || ""
							}
							phone=""
							email={submittedOrder?.order?.Ordrebekreftelse?.["E-post"] || ""}
							onTrackOrder={() => setShowTrackingModal(true)}
						/>
						<FeedbackModal
							open={showFeedbackModal}
							onClose={() => setShowFeedbackModal(false)}
							onSubmit={(rating, comment) => {
								setShowFeedbackModal(false);
								submitFeedback(
									"Checkout",
									`${t("Checkout.feedback.rating")}: ${ratingValues[rating]}, ${t("Checkout.feedback.comment")}: ${comment}`,
								);
							}}
						/>
						<OrderTrackingModal
							open={false}
							onClose={() => {}}
							{...{
								orderDate: "14 Mai 2025",
								orderNumber: "76453857",
								date: "14 Mai 2025",
								paymentMethod: "Faktura",
								name: "Ola Nordmann",
								company: "Selskapio Selskapsnavn",
								address: "Nedre Slottsgate 48, 3188, Oslo",
								phone: "+47 123 45 678",
								email: "ola.nordmann@bedrift.no",
								totalAmount: "2500,00",
							}}
						/>
					</>
				)}
				<Modal
					open={excelArchiveModalOpen}
					onOpenChange={setExcelArchiveModalOpen}>
					<ModalHeader>
						<ModalTitle>{t("Checkout.excelArchiveCartTitle")}</ModalTitle>
					</ModalHeader>
					<p className="text-sm text-[#5A615D]">
						{t("Checkout.excelArchiveCartDescription")}
					</p>
					<ModalFooter className="gap-2 sm:gap-0">
						<Button
							type="button"
							variant="outline"
							onClick={() => confirmExcelCheckout(false)}>
							{t("Checkout.excelArchiveCartNo")}
						</Button>
						<Button
							type="button"
							variant="greenSolid"
							onClick={() => confirmExcelCheckout(true)}>
							{t("Checkout.excelArchiveCartYes")}
						</Button>
					</ModalFooter>
				</Modal>
			</main>
		</PayPalScriptProvider>
	);
}
