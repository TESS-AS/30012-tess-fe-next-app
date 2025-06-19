export interface ProfileUser {
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
	defaultCompanyNumber: number;
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
