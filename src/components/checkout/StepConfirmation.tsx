import { ConfirmationCard } from "@/components/checkout/confirmation-card";
import { EditAddressModal } from "@/components/checkout/edit-address-modal";
import { EditContactModal } from "@/components/checkout/edit-contact-modal";
import { EditDeliveryModal } from "@/components/checkout/edit-delivery-modal";
import { EditPaymentModal } from "@/components/checkout/edit-payment-modal";
import { useAppContext } from "@/lib/appContext";
import { MapPin, Truck, User2, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";

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
	const { setUpdatedAddress } = useAppContext();
	const t = useTranslations("Checkout.confirmation");

	return (
		<div className="grid grid-cols-4 gap-6">
			<ConfirmationCard
				title={t("contactPerson")}
				icon={<User2 className="h-5 w-5" />}
				onEdit={() => modals.setContactOpen(true)}>
				<p>
					{contactPerson.firstName} {contactPerson.lastName}
				</p>
				<p>{contactPerson.email}</p>
				<p>{contactPerson.phone}</p>
			</ConfirmationCard>

			<ConfirmationCard
				title={t("address")}
				icon={<MapPin className="h-5 w-5" />}
				onEdit={() => modals.setAddressOpen(true)}>
				<p>{selectedAddress?.addressName}</p>
				<p>
					{selectedAddress?.street} {selectedAddress?.houseNumber}
				</p>
				<p>
					{selectedAddress?.postalCode} {selectedAddress?.city}
				</p>
			</ConfirmationCard>

			<ConfirmationCard
				title={t("delivery")}
				icon={<Truck className="h-5 w-5" />}
				onEdit={() => modals.setDeliveryOpen(true)}>
				<p>{t("deliveryMethod")}</p>
				<p>{t("deliveryTime")}</p>
			</ConfirmationCard>

			<ConfirmationCard
				title={t("payment")}
				icon={<Wallet className="h-5 w-5" />}
				onEdit={() => modals.setPaymentOpen(true)}>
				<p>{paymentMethod === "faktura" ? t("invoice") : t("cardPayment")}</p>
				<p>
					{t("project")}:{" "}
					{orderData.salesOrderHeader.customersOrderReference ||
						t("notSpecified")}
				</p>
				<p>
					{t("department")}:{" "}
					{orderData.salesOrderHeader.customerReference || t("notSpecified")}
				</p>
				<p>
					{t("category")}:{" "}
					{orderData.salesOrderLines[0]?.accountPart3 || t("notSpecified")}
				</p>
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
				onSave={setUpdatedAddress}
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
		</div>
	);
}
