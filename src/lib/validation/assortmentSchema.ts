/**
 * Zod schemas for the KSU (assortment) creation form.
 *
 * Composed from four option-scoped schemas so each accordion body can
 * validate only its own concerns, and the submit path composes them into
 * one final shape ready to POST at /assortment/create.
 *
 * Async uniqueness (BE `/assortment/nameAvailable`) is checked separately
 * via `useCheckAssortmentName` — kept out of the Zod schema so the form
 * doesn't flicker between valid/invalid on every keystroke before the
 * debounce resolves.
 */

import type { CreateAssortmentBody } from "@/types/assortment.types";
import { DEFAULT_SALES_NEW } from "@/types/assortment.types";
import { z } from "zod";

export const ASSORTMENT_NAME_MAX = 255;

const assortmentName = z
	.string()
	.trim()
	.min(1, "Navn er påkrevd")
	.max(ASSORTMENT_NAME_MAX, `Maks ${ASSORTMENT_NAME_MAX} tegn`);

const assortmentDescription = z
	.string()
	.trim()
	.max(2000, "Beskrivelsen er for lang")
	.optional()
	.transform((v) => (v && v.length > 0 ? v : undefined));

const userGrant = z.object({
	userId: z.number().int().positive(),
	canAdminister: z.boolean(),
});

const users = z.array(userGrant).optional();

/** Base fields shared by all options (name, description, users). */
const sharedBase = z.object({
	name: assortmentName,
	description: assortmentDescription,
	users,
});

/** "Opprett ny KSU" — always based on DEFAULT_SALES_NEW. Category selection
 *  is optional (empty = copy everything). */
export const opprettNySchema = sharedBase.extend({
	option: z.literal("new"),
	selectedCategoryNumbers: z.array(z.string()).default([]),
});

/** "Kopier eksisterende KSU" — requires a source. Category selection
 *  behaves the same (empty = copy everything from source). */
export const kopierSchema = sharedBase.extend({
	option: z.literal("copy"),
	sourceAssortmentNumber: z.string().min(1, "Velg en KSU å kopiere fra"),
	selectedCategoryNumbers: z.array(z.string()).default([]),
});

/** "Opprett KSU med egne kategorier" — empty KSU, no source. */
export const egneKategorierSchema = sharedBase.extend({
	option: z.literal("egne"),
});

/** "Opprett KSU fra Excel-mal" — the Excel branch validates on the file +
 *  BE's /assortment/excel/validate response, not Zod. We still require a
 *  name (users can override the template's) and the file reference. */
export const excelSchema = sharedBase.extend({
	option: z.literal("excel"),
	excelMode: z.enum(["new-catalog", "update-existing"]).default("new-catalog"),
	targetAssortmentNumber: z.string().optional(),
	fileName: z.string().min(1, "Last opp en Excel-fil"),
});

export const createAssortmentFormSchema = z.discriminatedUnion("option", [
	opprettNySchema,
	kopierSchema,
	egneKategorierSchema,
	excelSchema,
]);

export type CreateAssortmentFormValues = z.infer<
	typeof createAssortmentFormSchema
>;

/**
 * Projects validated form state into the exact BE payload shape.
 * Keeps the mapping in one place so callers never hand-roll it.
 */
export function toCreateAssortmentBody(
	values: CreateAssortmentFormValues,
): CreateAssortmentBody {
	const base: CreateAssortmentBody = {
		assortmentName: values.name,
		assortmentDescription: values.description,
		users: values.users,
	};

	switch (values.option) {
		case "new":
			return {
				...base,
				sourceAssortmentNumber: DEFAULT_SALES_NEW,
				selectedCategoryNumbers:
					values.selectedCategoryNumbers.length > 0
						? values.selectedCategoryNumbers
						: undefined,
			};
		case "copy":
			return {
				...base,
				sourceAssortmentNumber: values.sourceAssortmentNumber,
				selectedCategoryNumbers:
					values.selectedCategoryNumbers.length > 0
						? values.selectedCategoryNumbers
						: undefined,
			};
		case "egne":
			// No source — BE creates an empty KSU.
			return base;
		case "excel":
			// Excel branch doesn't go through POST /assortment/create — it goes
			// through /assortment/excel/commit. Caller handles the branching;
			// this helper never produces an Excel payload.
			throw new Error("Excel mode uses /assortment/excel/commit, not create");
	}
}
