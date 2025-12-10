export interface SavedAddress {
	id: string;
	type: "bruker" | "kunde" | "organisasjon";
	name: string;
	street: string;
	houseNumber: string;
	postalCode: string;
	city: string;
	extraInfo?: string;
	countryCode?: string;
}

export interface AddressFormState {
	addressName: string;
	street: string;
	houseNumber: string;
	extraInfo?: string;
	postalCode: string;
	city: string;
	isUserAddress: boolean;
	countryCode?: string;
}

export interface CreateNewUserAddress {
	addressLine1: string;
	addressLine2: string;
	addressLine3: string;
	city: string;
	postalCode: number;
	addressName: string;
	countryCode: string;
}
