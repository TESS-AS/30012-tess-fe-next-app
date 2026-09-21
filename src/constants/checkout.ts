import { FormFieldProps } from "@/components/checkout/form-field";

// Form field configurations
export const companyFields: Omit<FormFieldProps, "value" | "onChange">[] = [
	{
		id: "companyCode",
		label: "Company",
		placeholder: "",
		field: "companyCode",
		disabled: true,
	},
	{
		id: "defaultWarehouseNumber",
		label: "Warehouse",
		placeholder: "",
		field: "defaultWarehouseNumber",
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

export const HIDE_CHECKOUT_FOR_SPECIFIC_CUSTOMER_NUMBER = "169999";
//this is Equinor
export const SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER = "184200";
// Halliburton has multiple customer accounts in `customer.customer` (per legal
// entity / region / contract). Membership in this list is what gates the
// Halliburton-specific welcome content on the homepage — add new numbers here
// rather than duplicating the check.
export const HALLIBURTON_CUSTOMER_NUMBERS: readonly string[] = [
	"221443",
	"297511",
];

// Halliburton-only downloads surfaced on the welcome page. Files live under
// `public/halliburton/` so they ship with the app; swap either file in place
// (same filename) and redeploy to publish a revision.
export const HALLIBURTON_GLOVES_GUIDE_URL =
	"/halliburton/working-gloves-guide.xlsx";
export const HALLIBURTON_PPE_CATALOG_URL = "/halliburton/ppe-catalog.pdf";
export const SHOW_EXCEL_EXPORT_CUSTOMER_NUMBER = [
	"116476",
	"163269",
	"215923",
	"227513",
	"242510",
	"258746",
	"264866",
	"274379",
	"221443",
];
export const SAP_CUSTOMER = [
	"116476",
	"163269",
	"215923",
	"227513",
	"242510",
	"258746",
	"264866",
	"274379",
];
