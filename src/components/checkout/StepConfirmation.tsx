import { ConfirmationCard } from "@/components/checkout/confirmation-card";
import { EditAddressModal } from "@/components/checkout/edit-address-modal";
import { EditContactModal } from "@/components/checkout/edit-contact-modal";
import { EditDeliveryModal } from "@/components/checkout/edit-delivery-modal";
import { EditPaymentModal } from "@/components/checkout/edit-payment-modal";
import { useAppContext } from "@/lib/appContext";
import { MapPin, Truck, User2, Wallet } from "lucide-react";
import Image from "next/image";

import { Card } from "../ui/card";

export default function StepConfirmation({
	contactPerson,
	selectedAddress,
	orderData,
	modals,
	paymentMethod,
	setPaymentMethod,
	setOrderData,
	dimensionInputMode,
	setDimensionInputMode,
	handleContactPersonSave,
}: any) {
	const { cartItems, calculatedPrices } = useAppContext();

	return (
		<div className="grid grid-cols-4 gap-6">
			<ConfirmationCard
				title="Kontaktperson"
				icon={<User2 className="h-5 w-5" />}
				onEdit={() => modals.setContactOpen(true)}>
				<p>
					{contactPerson.firstName} {contactPerson.lastName}
				</p>
				<p>{contactPerson.email}</p>
				<p>{contactPerson.phone}</p>
			</ConfirmationCard>

			<ConfirmationCard
				title="Adresse"
				icon={<MapPin className="h-5 w-5" />}
				onEdit={() => modals.setAddressOpen(true)}>
				<p>{selectedAddress?.addressName}</p>
				<p>
					{selectedAddress?.addressLine1} {selectedAddress?.addressLine2}
				</p>
				<p>
					{selectedAddress?.postalCode} {selectedAddress?.city}
				</p>
			</ConfirmationCard>

			<ConfirmationCard
				title="Levering"
				icon={<Truck className="h-5 w-5" />}
				onEdit={() => modals.setDeliveryOpen(true)}>
				<p>Levering til adresse</p>
				<p>Estimert leveringstid: 2 til 7 virkedager</p>
			</ConfirmationCard>

			<ConfirmationCard
				title="Betaling"
				icon={<Wallet className="h-5 w-5" />}
				onEdit={() => modals.setPaymentOpen(true)}>
				<p>{paymentMethod === "faktura" ? "Faktura" : "Kortbetaling"}</p>
				<p>
					Prosjekt: {orderData.salesOrderHeader.customersOrderReference || "–"}
				</p>
				<p>Avdeling: {orderData.salesOrderHeader.customerReference || "–"}</p>
				<p>Kategori: {orderData.salesOrderLines[0]?.accountPart3 || "–"}</p>
			</ConfirmationCard>

			{/* Modals */}
			<EditContactModal
				open={modals.contactOpen}
				onClose={() => modals.setContactOpen(false)}
				onSave={handleContactPersonSave}
				initialData={contactPerson}
			/>
			<EditAddressModal
				open={modals.addressOpen}
				onClose={() => modals.setAddressOpen(false)}
				onSave={() => {}}
				initialData={selectedAddress}
			/>
			<EditDeliveryModal
				open={modals.deliveryOpen}
				onClose={() => modals.setDeliveryOpen(false)}
				onSave={() => modals.setDeliveryOpen(false)}
				initialData={{ method: "address" }}
			/>
			<EditPaymentModal
				open={modals.paymentOpen}
				onClose={() => modals.setPaymentOpen(false)}
				onSave={() => modals.setPaymentOpen(false)}
				initialData={{
					method: paymentMethod,
					project: orderData.salesOrderHeader.customersOrderReference,
					department: orderData.salesOrderHeader.customerReference,
					category: orderData.salesOrderLines[0]?.accountPart3,
				}}
				paymentMethod={paymentMethod}
				setPaymentMethod={setPaymentMethod}
				orderData={orderData}
				setOrderData={setOrderData}
				dimensionInputMode={dimensionInputMode}
				setDimensionInputMode={setDimensionInputMode}
			/>

			<div className="col-span-4 flex flex-col">
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
										<p className="text-sm text-[#5A615D]">{item.itemNumber}</p>
									</div>
								</div>
								<div className="flex items-center gap-50">
									<p className="font-medium text-[#0F1912]">x{item.quantity}</p>
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
}
