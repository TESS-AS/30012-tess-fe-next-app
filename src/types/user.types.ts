export interface ProfileUser {
	defaultCompanyName: string;
	userId: number;
	firstName: string;
	lastName: string;
	username: string | null;
	email: string;
	phoneNumber: string | null;
	defaultAddressId: number;
	defaultWarehouseId: string;
	assortmentIds: string[] | null;
	customerNumbers: string[];
	orgNumbers: string[];
	defaultCustomerNumber: string;
	defaultAssortmentNumber: string;
	defaultWarehosueName: string; // It's a typo on BE attribute
	defaultCompanyNumber: string;
	defaultWarehouseNumber: string;
	punchout: boolean;
}

export interface UserAddress {
	addressId: number;
	addressName: string;
	addressLine1: string;
	addressLine2: string;
	addressLine3: string;
	postalCode: string;
	city: string;
	deliveryCode: string;
	condition: string;
	type: "personal" | "business" | "organization";
}

export interface DefaultAddress {
	partyQualifier: string;
	addressId: number;
	name: string;
	country: string;
	addressName: string;
	addressLine1: string;
	addressLine2: string;
	addressLine3: string;
	deliveryId: number;
	postalCode: string;
	city: string;
	deliveryCode: string;
	condition: string;
}

export interface SalesOrderAddress {
	name: string;
	addressLine1: string;
	addressLine2: string;
	addressLine3: string;
	addressLine4: string;
	postalCode: string;
	partyQualifier: string;
	country: string;
}
