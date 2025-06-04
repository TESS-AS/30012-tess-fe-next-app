import { FormFieldProps } from "@/components/checkout/form-field";

// Form field configurations
export const companyFields: Omit<FormFieldProps, "value" | "onChange">[] = [
	{
		id: "companyName",
		label: "Company",
		placeholder: "",
		field: "companyName",
		disabled: true,
	},
	{
		id: "warehouseName",
		label: "Warehouse",
		placeholder: "",
		field: "warehouseName",
		disabled: true,
	},
];

export const shippingFields: Omit<FormFieldProps, "value" | "onChange">[] = [
	{
		id: "addressName",
		label: "Full Name",
		placeholder: "Enter full name",
		required: true,
		field: "addressName",
	},
	{
		id: "addressLine1",
		label: "Street Address",
		placeholder: "Enter street address",
		required: true,
		field: "addressLine1",
	},
	{
		id: "addressLine2",
		label: "Apartment/Suite",
		placeholder: "Enter apartment or suite number",
		field: "addressLine2",
	},
	{
		id: "city",
		label: "City",
		placeholder: "Enter city",
		required: true,
		field: "city",
	},
	{
		id: "postalCode",
		label: "Postal Code",
		placeholder: "Enter postal code",
		required: true,
		field: "postalCode",
	},
	{
		id: "countryCode",
		label: "Country Code",
		placeholder: "NO",
		required: true,
		field: "countryCode",
	},
];

export const referenceFields: Omit<FormFieldProps, "value" | "onChange">[] = [
	{
		id: "reference1",
		label: "Reference 1",
		placeholder: "Enter reference 1 (e.g., Project)",
		required: true,
		field: "reference1",
	},
	{
		id: "reference2",
		label: "Reference 2",
		placeholder: "Enter reference 2 (optional)",
		field: "reference2",
	},
	{
		id: "reference3",
		label: "Reference 3",
		placeholder: "Enter reference 3 (optional)",
		field: "reference3",
	},
];