import { useState } from "react";

export const useModals = () => {
	const [contactOpen, setContactOpen] = useState(false);
	const [addressOpen, setAddressOpen] = useState(false);
	const [deliveryOpen, setDeliveryOpen] = useState(false);
	const [paymentOpen, setPaymentOpen] = useState(false);

	return {
		contactOpen,
		setContactOpen,
		addressOpen,
		setAddressOpen,
		deliveryOpen,
		setDeliveryOpen,
		paymentOpen,
		setPaymentOpen,
	};
};
