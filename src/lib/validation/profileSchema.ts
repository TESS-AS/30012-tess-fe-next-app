import { z } from "zod";

export const profileSchema = z.object({
	firstName: z.string().min(1, "Required"),
	lastName: z.string().min(1, "Required"),
	email: z.string().email("Invalid email address"),
	gender: z.enum(["male", "female"]).optional(),
	dateOfBirth: z.string().optional(),
	phoneNumber: z
		.string()
		.regex(/^[+0-9\s\-()]*$/, "Invalid phone number")
		.optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
