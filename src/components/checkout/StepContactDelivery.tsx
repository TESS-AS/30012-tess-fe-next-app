import { AddressCard } from "@/components/checkout/address-contact-card";
import { ContactPerson } from "@/components/checkout/contact-person";
import { DeliveryMethodCard } from "@/components/checkout/delivery-method-card";

export default function StepContactDelivery({
	contactPerson,
	handleContactPersonSave,
	selectedAddress,
	showWarning,
	setShowWarning,
}: any) {
	return (
		<div className="flex flex-col gap-4">
			<ContactPerson
				{...contactPerson}
				onSave={handleContactPersonSave}
			/>
			<AddressCard
				{...selectedAddress}
				label="Leveringsadresse"
				isUserAddress={false}
				onSave={() => {}}
			/>
			<DeliveryMethodCard
				showWarning={showWarning}
				onDismissWarning={() => setShowWarning(false)}
			/>
		</div>
	);
}
