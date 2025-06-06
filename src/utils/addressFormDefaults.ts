// utils/addressFormDefaults.ts

import { AddressFormValues } from "@/lib/validation/addressSchema";
import { UserAddress } from "@/types/user.types";

export const getDefaultAddressFormValues = (
	address: UserAddress | null,
	defaultType: "personal" | "business",
): AddressFormValues => {
	if (address) {
		return {
			type: address.type ?? "personal",
			addressName: address.addressName,
			addressLine1: address.addressLine1,
			addressLine2: address.addressLine2 ?? "",
			addressLine3: address.addressLine3 ?? "",
			postalCode: address.postalCode,
			city: address.city,
		};
	}

	return {
		type: defaultType,
		addressName: "",
		addressLine1: "",
		addressLine2: "",
		addressLine3: "",
		postalCode: "",
		city: "",
	};
};
