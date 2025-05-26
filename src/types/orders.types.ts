interface Address {
	addressName: string;
	addressLine1: string;
	addressLine2: string;
	addressLine3: string;
	city: string;
	postalCode: string;
	countryCode: string;
}

interface OrderHeader {
	orderType?: string;
	customerNo: string;
	warehouseNumber: string;
	customerReference1?: string;
	customerReference2?: string;
	deliveryTerms: string;
	paymentTerms: string;
}

interface OrderLines {
	orderLineType: string;
	itemNumber: string;
	unit: string;
	quantity: number;
	salesPrice: number;
	customerReference3: string;
	customerReference4: string;
	customerReference5: string;
}

export interface Order {
	source: string;
	companyNumber: string;
	sequenceNo: string;
	orderDate: string;
	orderTime: string;
	header: OrderHeader;
	address: Address;
	lines: OrderLines[];
}

export type PaymentMethod = "card" | "paypal";
