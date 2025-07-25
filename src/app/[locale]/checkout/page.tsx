// === pages/CheckoutPage.tsx ===
"use client";

import { useState } from "react";

import { FeedbackModal } from "@/components/checkout/feedback-modal";
import OrderSummary from "@/components/checkout/order-summary";
import { OrderTrackingModal } from "@/components/checkout/order-tracking-modal";
import StepConfirmation from "@/components/checkout/StepConfirmation";
import StepContactDelivery from "@/components/checkout/StepContactDelivery";
import StepPayment from "@/components/checkout/StepPayment";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import Stepper from "@/components/ui/stepper";
import { useCheckoutOrderData } from "@/hooks/useCheckoutOrderData";
import { useContactPerson } from "@/hooks/useContactPerson";
import { useGetDefaultAddress } from "@/hooks/useGetDefaultAddress";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import { useModals } from "@/hooks/useModals";
import { useOrderStepper } from "@/hooks/useOrderStepper";
import { useSubmitOrder } from "@/hooks/useSubmitOrder";
import { useAppContext } from "@/lib/appContext";
import {
	PayPalScriptProvider,
	ReactPayPalScriptOptions,
} from "@paypal/react-paypal-js";
import { useRouter } from "next/navigation";

const initialOptions: ReactPayPalScriptOptions = {
	clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
	components: "buttons",
	currency: "USD",
};

const steps = ["Levering", "Betaling", "Bekreft"];

export default function CheckoutPage() {
	const router = useRouter();
	const { cartItems, calculatedPrices, handleArchiveCart } = useAppContext();
	const { data: profile } = useGetProfileData();
	const { data: defaultAddress } = useGetDefaultAddress();
	const selectedAddress = defaultAddress?.[0];

	const { contactPerson, handleSave: handleContactPersonSave } =
		useContactPerson();
	const modals = useModals();
	const { currentStep, setCurrentStep, goToNext } = useOrderStepper();

	const [paymentMethod, setPaymentMethod] = useState("faktura");
	const [dimensionInputMode, setDimensionInputMode] = useState("select");
	const [showWarning, setShowWarning] = useState(true);
	const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
	const [showFeedbackModal, setShowFeedbackModal] = useState(false);
	const [submittedOrder, setSubmittedOrder] = useState(null);

	const [orderData, setOrderData] = useCheckoutOrderData(
		cartItems,
		profile,
		calculatedPrices,
	);
	const submitOrder = useSubmitOrder(
		profile?.punchout || false,
		profile,
		selectedAddress,
		handleArchiveCart,
	);

	const renderStepContent = () => {
		switch (currentStep) {
			case 0:
				return (
					<StepContactDelivery
						contactPerson={contactPerson}
						handleContactPersonSave={handleContactPersonSave}
						selectedAddress={selectedAddress}
						showWarning={showWarning}
						setShowWarning={setShowWarning}
					/>
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
						selectedAddress={selectedAddress}
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
		if (currentStep < 2) {
			goToNext();
			return;
		}

		try {
			const result = await submitOrder(orderData);
			if (result) {
				setSubmittedOrder(result);
				setShowOrderConfirmation(true);
				setTimeout(() => setShowFeedbackModal(true), 2000);
			}
		} catch (error) {
			console.error("Order submission failed:", error);
		}
	};

	return (
		<PayPalScriptProvider options={initialOptions}>
			<main className="container mx-auto min-h-screen py-10">
				{!showOrderConfirmation ? (
					<>
						<Breadcrumb
							items={[
								{ href: "/", label: "Home" },
								{ href: "/checkout", label: "Checkout" },
							]}
						/>
						<Stepper
							steps={steps}
							currentStep={currentStep}
							onStepClick={setCurrentStep}
						/>

						<div className="grid grid-cols-12 items-start gap-10 pt-6 pb-4">
							<div
								className={`${currentStep !== 2 ? "col-span-8" : "col-span-12"}`}>
								{renderStepContent()}
							</div>
							{currentStep !== 2 && (
								<div className="col-span-4">
									<OrderSummary handleCheckout={handleCheckout} />
								</div>
							)}
						</div>

						{currentStep === 2 && (
							<div className="col-span-12">
								<OrderSummary handleCheckout={handleCheckout} />
							</div>
						)}
					</>
				) : (
					<>
						<pre className="max-h-[500px] overflow-auto rounded-lg bg-gray-50 p-4 text-sm">
							{JSON.stringify(submittedOrder, null, 2)}
						</pre>
						<FeedbackModal
							open={showFeedbackModal}
							onClose={() => setShowFeedbackModal(false)}
							onSubmit={(rating, comment) => {
								console.log("Feedback:", { rating, comment });
								setShowFeedbackModal(false);
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
			</main>
		</PayPalScriptProvider>
	);
}
