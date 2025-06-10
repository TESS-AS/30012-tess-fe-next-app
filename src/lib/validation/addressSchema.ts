import { z } from "zod";

export const addressSchema = z.object({
	type: z.enum(["personal", "business", "organization"]),
	addressName: z.string().min(1, "Address name is required"),
	addressLine1: z.string().min(1, "Address Line 1 is required"),
	addressLine2: z.string().optional(),
	addressLine3: z.string().optional(),
	postalCode: z.string().min(1, "Postal code is required"),
	city: z.string().min(1, "City is required"),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
