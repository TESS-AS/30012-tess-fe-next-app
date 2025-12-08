export interface SavedAddress {
	id: string;
	type: "bruker" | "kunde" | "organisasjon";
	name: string;
	street: string;
	houseNumber: string;
	postalCode: string;
	city: string;
	extraInfo?: string;
}

export interface AddressFormState {
	addressName: string;
	street: string;
	houseNumber: string;
	extraInfo?: string;
	postalCode: string;
	city: string;
	isUserAddress: boolean;
}

export interface CreateNewUserAddress {
	addressLine1: string;
	addressLine2: string;
	addressLine3: string;
	city: string;
	postal_code: number;
	addressName: string;
}
