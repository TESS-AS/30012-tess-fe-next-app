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
	name: string;
	street: string;
	houseNumber: string;
	extraInfo?: string;
	postalCode: string;
	city: string;
	isUserAddress: boolean;
}
