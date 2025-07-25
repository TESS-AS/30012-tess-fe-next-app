"use client";

import { useState, useEffect } from "react";

import { AddressCard } from "@/components/checkout/address-contact-card";
import { ConfirmationCard } from "@/components/checkout/confirmation-card";
import { ContactPerson } from "@/components/checkout/contact-person";
import { DeliveryMethodCard } from "@/components/checkout/delivery-method-card";
import { EditAddressModal } from "@/components/checkout/edit-address-modal";
import { EditContactModal } from "@/components/checkout/edit-contact-modal";
import { EditDeliveryModal } from "@/components/checkout/edit-delivery-modal";
import { EditPaymentModal } from "@/components/checkout/edit-payment-modal";
import { FeedbackModal } from "@/components/checkout/feedback-modal";
import { InvoiceInfoCard } from "@/components/checkout/invoice-info-card";
import { OrderConfirmation } from "@/components/checkout/order-confirmation";
import OrderSummary from "@/components/checkout/order-summary";
import { OrderTrackingModal } from "@/components/checkout/order-tracking-modal";
import { PaymentMethodCard } from "@/components/checkout/payment-method-card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Stepper from "@/components/ui/stepper";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import {
	PayPalScriptProvider,
	ReactPayPalScriptOptions,
} from "@paypal/react-paypal-js";
import { FileDown, MapPin, Truck, User2, Wallet } from "lucide-react";
import { useAppContext } from "@/lib/appContext";
import Image from "next/image";
import { Order } from "@/types/orders.types";
import { salesOrder } from "@/services/orders.service";
import { Modal, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { useRouter } from "@/i18n/navigation";
import { useContactPerson } from "@/hooks/useContactPerson";
import { useGetDefaultAddress } from "@/hooks/useGetDefaultAddress";

const initialOptions: ReactPayPalScriptOptions = {
	clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
	components: "buttons",
	currency: "USD",
};

const steps: string[] = ["Levering", "Betaling", "Bekreft"];

function CheckoutPage() {
	const router = useRouter();
	const {
		cartItems,
		calculatedPrices,
		currentStep,
		setCurrentStep,
		handleArchiveCart,
	} = useAppContext();
	const { data: profile } = useGetProfileData();
	const {
		contactPerson,
		handleSave: handleContactPersonSave,
	} = useContactPerson();
  const {
    data: defaultAddress,
    isLoading: loadingDefaultAddress,
    error: errorDefaultAddress,
  } = useGetDefaultAddress();

  const selectedAddress = defaultAddress?.[0];
	const [dimensionInputMode, setDimensionInputMode] = useState<"select" | "search" | "manual">("select");
	const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
	const [showTrackingModal, setShowTrackingModal] = useState(false);
	const [showFeedbackModal, setShowFeedbackModal] = useState(false);
	const [showWarning, setShowWarning] = useState(true);
  const [submittedOrder, setSubmittedOrder] = useState<Order>({
    documentControl: {
      companyCode: "",
    },
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
  const [paymentMethod, setPaymentMethod] = useState("faktura");


	const [orderData, setOrderData] = useState<Order>({
		documentControl: {
			companyCode: "",
		},
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

	// Modal states
	const [contactModalOpen, setContactModalOpen] = useState(false);
	const [addressModalOpen, setAddressModalOpen] = useState(false);
	const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
	const [paymentModalOpen, setPaymentModalOpen] = useState(false);

	const isPunchoutUser = profile?.punchout;

	useEffect(() => {
		if (cartItems?.length && profile) {
			setOrderData((prev) => ({
				...prev,
				documentControl: {
					companyCode:
						Number(profile?.defaultCompanyNumber) < 10
							? `0${profile?.defaultCompanyNumber}`
							: profile?.defaultCompanyNumber?.toString(),
				},
				salesOrderLines: cartItems.map((item, idx) => ({
					customerOrderLine: idx + 1,
					warehouseNumber: `${profile?.defaultWarehouseNumber}` || "",
					orderType: "S2",
					itemCode: item?.itemNumber || "",
					orderedQuantity: item.quantity,
					salesPrice: calculatedPrices[item.itemNumber] || 0,
					requestedDeliveryDate: new Date().toISOString().split("T")[0],
					accountPart3: "", // Dimension 3
					accountPart4: String(profile?.userId || ""), // userId
					accountPart5: "",
					text: "",
				})),
			}));
		}
		console.log(orderData, "orderData");
	}, [cartItems, profile]);

	const renderStepContent = () => {
		switch (currentStep) {
			case 0:
				return (
					<div className="flex flex-col gap-4">
						<ContactPerson
							{...contactPerson}
							onSave={handleContactPersonSave}
						/>
            <AddressCard
              label="Leveringsadresse"
              name={selectedAddress?.addressName || ""}
              street={selectedAddress?.addressLine1 || ""}
              postalCode={selectedAddress?.postalCode || ""}
              city={selectedAddress?.city || ""}
              addressName={selectedAddress?.addressName || ""}
              houseNumber={selectedAddress?.addressLine2 || ""}
              extraInfo={selectedAddress?.addressLine3}
              isUserAddress={false}
              onSave={() => {}}
            />
						<DeliveryMethodCard
							showWarning={showWarning}
							onDismissWarning={() => setShowWarning(false)}
						/>
					</div>
				);
			case 1:
				return (
					<div className="flex flex-col gap-4">
						<PaymentMethodCard value={paymentMethod} onChange={setPaymentMethod} />
						<InvoiceInfoCard 
              orderData={orderData} 
              setOrderData={setOrderData}
              dimensionInputMode={dimensionInputMode}
              setDimensionInputMode={setDimensionInputMode}
            />
					</div>
				);
			case 2:
				return (
					<div>
						<div className="grid grid-cols-4 gap-6">
							<ConfirmationCard
								title="Kontaktperson"
								icon={<User2 className="h-5 w-5" />}
								onEdit={() => setContactModalOpen(true)}>
								<p className="text-[#5A615D]">
									{contactPerson.firstName} {contactPerson.lastName}
								</p>
								<p className="text-[#5A615D]">{contactPerson.email}</p>
								<p className="text-[#5A615D]">{contactPerson.phone}</p>
							</ConfirmationCard>

              <ConfirmationCard
                title="Adresse"
                icon={<MapPin className="h-5 w-5" />}
                onEdit={() => setAddressModalOpen(true)}
              >
                <p className="text-[#5A615D]">{selectedAddress?.addressName}</p>
                <p className="text-[#5A615D]">
                  {selectedAddress?.addressLine1} {selectedAddress?.addressLine2}
                </p>
                <p className="text-[#5A615D]">
                  {selectedAddress?.postalCode} {selectedAddress?.city}
                </p>
              </ConfirmationCard>

							<ConfirmationCard
								title="Levering"
								icon={<Truck className="h-5 w-5" />}
								onEdit={() => setDeliveryModalOpen(true)}>
								<p className="text-[#5A615D]">Levering til adresse</p>
								<p className="text-[#5A615D]">
									Estimert leveringstid: 2 til 7 virkedager
								</p>
							</ConfirmationCard>

              <ConfirmationCard
                title="Betaling"
                icon={<Wallet className="h-5 w-5" />}
                onEdit={() => setPaymentModalOpen(true)}
              >
                <p className="text-[#5A615D]">
                  {paymentMethod === "faktura" ? "Faktura" : "Kortbetaling"}
                </p>
                <p className="text-[#5A615D]">
                  Prosjekt: {orderData.salesOrderHeader.customersOrderReference || "–"}
                </p>
                <p className="text-[#5A615D]">
                  Avdeling: {orderData.salesOrderHeader.customerReference || "–"}
                </p>
                <p className="text-[#5A615D]">
                  Kategori: {orderData.salesOrderLines[0]?.accountPart3 || "–"}
                </p>
              </ConfirmationCard>

							{/* Edit Modals */}
							<EditContactModal
								open={contactModalOpen}
								onClose={() => setContactModalOpen(false)}
								onSave={async (data) => {
									await handleContactPersonSave(data);
									setContactModalOpen(false);
								}}
								initialData={contactPerson}
							/>

              <EditAddressModal
                open={addressModalOpen}
                onClose={() => setAddressModalOpen(false)}
                onSave={(data) => {}}
                initialData={{
                  addressName: selectedAddress?.addressName,
                  street: selectedAddress?.addressLine1,
                  houseNumber: selectedAddress?.addressLine2,
                  postalCode: selectedAddress?.postalCode,
                  city: selectedAddress?.city,
                  extraInfo: selectedAddress?.addressLine3,
                  isUserAddress: false,
                }}
              />


							<EditDeliveryModal
								open={deliveryModalOpen}
								onClose={() => setDeliveryModalOpen(false)}
								onSave={(data) => {
									console.log("Delivery data:", data);
									setDeliveryModalOpen(false);
								}}
								initialData={{
									method: "address",
								}}
							/>

              <EditPaymentModal
                open={paymentModalOpen}
                onClose={() => setPaymentModalOpen(false)}
                onSave={(data) => {
                  console.log("Payment data:", data);
                  setPaymentModalOpen(false);
                }}
                initialData={{
                  method: paymentMethod as 'invoice' | 'card',
                  project: orderData.salesOrderHeader.customersOrderReference || "",
                  department: orderData.salesOrderHeader.customerReference || "",
                  category: orderData.salesOrderLines[0]?.accountPart3 || "",
                }}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                orderData={orderData}
                setOrderData={setOrderData}
                dimensionInputMode={dimensionInputMode}
                setDimensionInputMode={setDimensionInputMode}
              />
						</div>
						<div className="col-span-4 mt-8 flex flex-col">
							<h2 className="mb-4 text-xl font-semibold">Dine varer</h2>
							<div className="flex flex-col space-y-4">
								{cartItems?.map((item: any) => (
									<Card
										key={item.itemNumber}
										className="rounded-lg border border-gray-200 p-6 shadow-none">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-6">
												<div className="relative h-16 w-16 rounded bg-[#F7F7F7] p-2">
													{item.mediaId?.[0]?.url ? (
														<Image
															src={item.mediaId[0].url}
															alt={item.mediaId[0].filename || ""}
															fill
															className="object-contain p-1"
														/>
													) : (
														<div className="h-full w-full rounded bg-gray-100" />
													)}
												</div>
												<div className="flex flex-col gap-0.5">
													<p className="text-base text-[#0F1912]">
														{item.productNumber}
													</p>
													<p className="text-sm text-[#5A615D]">
														{item.itemNumber}
													</p>
												</div>
											</div>
											<div className="flex items-center gap-50">
												<p className="font-medium text-[#0F1912]">
													x{item.quantity}
												</p>
												<p className="text-lg font-bold whitespace-nowrap">
													{calculatedPrices[item.itemNumber].toFixed(2)},–
												</p>
											</div>
										</div>
									</Card>
								))}
							</div>
						</div>
					</div>
				);
			default:
				return null;
		}
	};

	const handleSubmit = async () => {
		const payload: Order = {
			...orderData,
			salesOrderHeader: {
				...orderData.salesOrderHeader,
				customersOrderNumberEdifact: "EDIFACT123",
				orderType: "zz",
				customerNumber: "169999",
				warehouseNumber: String(profile?.defaultWarehouseNumber),
				termsOfDelivery: "DAP",
				termsOfPayment: "NET",
				dispatchDate: new Date().toISOString().split("T")[0],
			},
			salesOrderAddresses: [selectedAddress!!],
			salesOrderLines: orderData.salesOrderLines,
		};
		try {
			const response = await salesOrder(payload);

			if (!isPunchoutUser) {
        if (response && typeof response !== 'string' && response?.order) {
          setSubmittedOrder(response.order)
          await handleArchiveCart();
        }
			} else {
				const parser = new DOMParser();
				const doc = parser.parseFromString(response as string, "text/html");

				const form = doc.getElementById("punchoutForm") as HTMLFormElement;

				if (form) {
					const actionUrl = form.action;
					const { method } = form;

					const submitForm = document.createElement("form");
					submitForm.method = method;
					submitForm.action = actionUrl;

					Array.from(form.getElementsByTagName("input")).forEach((input) => {
						const newInput = document.createElement("input");
						newInput.type = "hidden";
						newInput.name = input.name;
						newInput.value = input.value;
						submitForm.appendChild(newInput);
					});
					document.body.appendChild(submitForm);
					submitForm.submit();
					document.body.removeChild(submitForm);
				} else {
					console.error("Punchout form not found in response");
				}
			}
		} catch (error) {
			console.error("Order submission failed:", error);
		}
	};

	const handleCheckout = () => {
		if (currentStep === 0) {
			setCurrentStep(1);
		} else if (currentStep === 1) {
			setCurrentStep(2);
		} else {
			handleSubmit()
			.then(() => {
				setShowOrderConfirmation(true);
				setTimeout(() => {
          console.log("comming here")
					setShowFeedbackModal(true);
				}, 2000);
			})
			.catch((error) => {
				console.error('Failed to submit order:', error);
			});
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
							{/* <CheckoutSteps /> */}
						</div>
						{currentStep === 2 && (
							<div
								className={`${currentStep !== 2 ? "col-span-8" : "col-span-12"}`}>
								<OrderSummary handleCheckout={handleCheckout} />
							</div>
						)}
						<OrderTrackingModal
							open={showTrackingModal}
							onClose={() => setShowTrackingModal(false)}
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
							paymentReceived={true}
							orderReceived={true}
							invoiceSent={true}
						/>
					</>
				) : (
          <>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-[500px] text-sm">
              {JSON.stringify(submittedOrder, null, 2)}
            </pre>
          {/* <OrderConfirmation
              orderNumber={submittedOrder.documentControl?.extDocSequenceId ?? "–"}
              date={submittedOrder.documentControl?.requestDate ?? "–"}
              paymentMethod={paymentMethod}
              name={contactPerson.firstName + " " + contactPerson.lastName}
              company={submittedOrder.documentControl?.companyCode ?? "–"}
              address={
                `${submittedOrder.salesOrderAddresses?.[0]?.addressLine1 ?? ""}, ` +
                `${submittedOrder.salesOrderAddresses?.[0]?.addressLine2 ?? ""}, ` +
                `${submittedOrder.salesOrderAddresses?.[0]?.postalCode ?? ""}`  
              }
              phone={contactPerson.phone ?? "–"}
              email={contactPerson.email ?? "–"}
              onTrackOrder={() => setShowTrackingModal(true)}
            /> */}
              <FeedbackModal
                open={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
                onSubmit={(rating: number, comment?: string) => {
                  console.log("Feedback:", { rating, comment });
                  setShowFeedbackModal(false);
                }}
              />
          </>
				)}
			</main>
		</PayPalScriptProvider>
	);
}

export default CheckoutPage;
