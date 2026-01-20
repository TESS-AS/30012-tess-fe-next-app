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
	role: string;
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
	countryCode?: string;
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

export interface User {
	userId: number;
	firstName: string;
	lastName: string;
	email: string;
	role: string;
	accessLevel: string;
	customerAccess: {
		name: string;
		number: string;
	}[];
	warehouse: {
		name: string;
		number: string;
	}[];
	catalog: {
		name: string;
		number: string;
	}[];
	company: {
		name: string;
		number: string;
	}[];
	phone?: string;
	firma?: string[];
}

export interface EditableUser {
	success: boolean;
	users: User[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

export interface UserDomainConfig {
	success: boolean;
	domainConfig: [
		{
			domain: string;
			customers: [
				{
					customerId: number;
					customerNumber: string;
					customerName: string;
				},
			];
			companies: [
				{
					companyId: number;
					companyNumber: number;
					companyName: string;
				},
			];
			warehouses: [
				{
					warehouseId: number;
					companyNumber: number;
					warehouseNumber: string;
					warehouseName: string;
				},
			];
			assortments: [
				{
					assortmentId: number;
					assortmentNumber: string;
					assortmentName: string;
					nameEn: string;
					nameNo: string;
				},
			];
		},
	];
}

export interface UpdateUserRelationsPayload {
	userId: number[];
	assortments: string[];
	customers: string[];
	warehouses: {
		warehouseNumber: string;
		companyNumber: string;
		isDefault: boolean;
	}[];
	companies: string[];
}

export interface UpdateUserRelationsResponse {
	message: string;
	results: {
		assortments: [
			{
				assortmentNumber: string;
				userId: number;
				status: string;
			},
		];
		customers: [
			{
				customerNumber: string;
				customerName: string;
				userId: number;
				status: string;
			},
		];
		warehouses: [
			{
				warehouseNumber: string;
				companyNumber: string;
				isDefault: boolean;
				status: string;
				message: string;
				defaultWarehouseUpdate: boolean;
				defaultWarehouseId: number;
			},
		];
		companies: [
			{
				companyId: number;
				companyName: string;
				companyNumber: string;
				status: string;
			},
		];
	};
}

export interface FetchUserDataBrukereResponse {
	success: boolean;
	result: [
		{
			customerId?: number;
			customerNumber?: string;
			customerName?: string;
			companyId?: number;
			companyNumber?: number | string;
			companyName?: string;
			warehouseId?: number;
			warehouseNumber?: string;
			warehouseName?: string;
			assortmentId?: number;
			assortmentNumber?: string;
			assortmentName?: string;
			nameEn?: string;
			nameNo?: string;
		},
	];
}

export interface BulkEditConfirmationModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedUsers: User[];
	onConfirm: (changes: BulkEditChanges) => void;
	removeUser?: (user: User) => void;
}

export interface BulkEditChanges {
	customerAccess?: string[];
	catalogs?: string[];
	warehouses?: { warehouseNumber: string; companyNumber: string }[];
	companies?: string[];
}
