"use client";

import { AddressCard } from "@/components/checkout/address-contact-card";
import CheckoutSteps from "@/components/checkout/checkout-steps";
import { ConfirmationCard } from "@/components/checkout/confirmation-card";
import { ContactPerson } from "@/components/checkout/contact-person";
import { DeliveryMethodCard } from "@/components/checkout/delivery-method-card";
import { PaymentMethodCard } from "@/components/checkout/payment-method-card";
import { InvoiceInfoCard } from "@/components/checkout/invoice-info-card";
import OrderSummary from "@/components/checkout/order-summary";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import Stepper from "@/components/ui/stepper";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import {
	PayPalScriptProvider,
	ReactPayPalScriptOptions,
} from "@paypal/react-paypal-js";
import { useState } from "react";
import { MapPin, Truck, User2, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAppContext } from "@/lib/appContext";
import Image from "next/image";

const initialOptions: ReactPayPalScriptOptions = {
	clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
	components: "buttons",
	currency: "USD",
};

const steps: string[] = ["Levering", "Betaling", "Bekreft"];


export default function CheckoutPage() {
	
	const { cartItems, calculatedPrices } = useAppContext();
	const { data: profile } = useGetProfileData();
	const [currentStep, setCurrentStep] = useState<number>(0);
	const [showWarning, setShowWarning] = useState(true);

	const renderStepContent = () => {
	  switch (currentStep) {
		case 0:
		  return <div className="flex flex-col gap-4">
			<ContactPerson firstName={profile?.firstName || ""} lastName={profile?.lastName || ""} email={profile?.email || ""} phone={profile?.phoneNumber || "+47 123 45 678"}/>
			<AddressCard label="Leveringsadresse" street={"Storgata"} postalCode={"15"} city={"Oslo"} addressName={"Hjem"} houseNumber={"15"} extraInfo={""} isUserAddress={false}/>
			<DeliveryMethodCard
				showWarning={showWarning}
				onDismissWarning={() => setShowWarning(false)}
			/>
		  </div>
		case 1:
		  return <div className="flex flex-col gap-4">
        <PaymentMethodCard />
        <InvoiceInfoCard />
      </div>;
		case 2:

			return (
				<div className="grid grid-cols-4 gap-6">
					<ConfirmationCard 
						title="Kontaktperson" 
						icon={<User2 className="w-5 h-5" />}
						onEdit={() => setCurrentStep(0)}
					>
						<p className="text-[#5A615D]">Ola Nordmann</p>
						<p className="text-[#5A615D]">ola.nordmann@bedrift.no</p>
						<p className="text-[#5A615D]">+47 123 45 678</p>
					</ConfirmationCard>

					<ConfirmationCard 
						title="Adresse" 
						icon={<MapPin className="w-5 h-5 " />}
						onEdit={() => setCurrentStep(0)}
					>
						<p className="text-[#5A615D]">Hjemmeadresse</p>
						<p className="text-[#5A615D]">Storgata 15</p>
						<p className="text-[#5A615D]">0155 Oslo</p>
					</ConfirmationCard>

					<ConfirmationCard 
						title="Levering" 
						icon={<Truck className="w-5 h-5" />}
						onEdit={() => setCurrentStep(0)}
					>
						<p className="text-[#5A615D]">Levering til adresse</p>
						<p className="text-[#5A615D]">Estimert leveringstid: 2 til 7 virkedager</p>
					</ConfirmationCard>

					<ConfirmationCard 
						title="Betaling" 
						icon={<Wallet className="w-5 h-5" />}
						onEdit={() => setCurrentStep(1)}
					>
						<p className="text-[#5A615D]">Faktura</p>
						<p className="text-[#5A615D]">Prosjekt: Prosjekt 123</p>
						<p className="text-[#5A615D]">Avdeling: Salg</p>
						<p className="text-[#5A615D]">Kategori: Kontor</p>
					</ConfirmationCard>

					<div className="flex flex-col col-span-4 mt-8">
						<h2 className="text-xl font-semibold mb-4">Dine varer</h2>
						<div className="flex flex-col space-y-4">
							{cartItems?.map((item) => (
								<Card key={item.itemNumber} className="p-6 rounded-lg border border-gray-200 shadow-none">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-6">
											<div className="relative h-16 w-16 bg-[#F7F7F7] rounded p-2">
												{item.mediaId?.[0]?.url ? (
													<Image
														src={item.mediaId[0].url}
														alt={item.mediaId[0].filename || ""}
														fill
														className="object-contain p-1"
													/>
												) : (
													<div className="h-full w-full bg-gray-100 rounded" />
												)}
											</div>
											<div className="flex flex-col gap-0.5">
												<p className="text-base text-[#0F1912]">{item.productNumber}</p>
												<p className="text-sm text-[#5A615D]">{item.itemNumber}</p>
											</div>
										</div>
										<div className="flex items-center gap-50">
											<p className="font-medium text-[#0F1912]">x{item.quantity}</p>
											<p className="font-bold text-lg whitespace-nowrap">
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
  
	return (
		<PayPalScriptProvider options={initialOptions}>
			<main className="container min-h-screen py-10 mx-auto">
				<Breadcrumb items={[{ href: "/", label: "Home" }, { href: "/checkout", label: "Checkout" }]} />
				<Stepper steps={steps} currentStep={currentStep} onStepClick={setCurrentStep} />
				<div className="grid grid-cols-12 items-start gap-10 pt-6 pb-4">
					<div className={`${currentStep !== 2 ? "col-span-8" : "col-span-12"}`}>
						{renderStepContent()}
					</div>
					{currentStep !== 2 && <div className="col-span-4">
						<OrderSummary />
					</div>}
					{/* <CheckoutSteps /> */}
				</div>
				{currentStep === 2 && <div className={`${currentStep !== 2 ? "col-span-8" : "col-span-12"}`}>
					<OrderSummary />
				</div>}
			</main>
		</PayPalScriptProvider>
	);
}
