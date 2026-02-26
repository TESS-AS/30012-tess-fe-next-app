/**
 * Pagination size for Tilganger entity dropdowns (customers, assortments, warehouses, companies).
 */
export const TILGANGER_PAGE_SIZE = 10;

/**
 * Profile role values from the API.
 */
export const PROFILE_ROLE = {
	ADMIN: "admin",
	SUPERUSER: "superuser",
	EMPLOYEE: "employee",
	CUSTOMER: "customer",
} as const;

export type ProfileRoleKey = (typeof PROFILE_ROLE)[keyof typeof PROFILE_ROLE];

/**
 * User data entity types used for Tilganger options (Brukere API).
 */
export const USER_DATA_ENTITY_TYPE = {
	CUSTOMER: "customer",
	ASSORTMENT: "assortment",
	WAREHOUSE: "warehouse",
	COMPANY: "company",
} as const;

/**
 * CSS class names used across innstillinger components (design tokens).
 */
export const INNSTILLINGER_CLASSES = {
	card: "rounded-lg border border-[#E5E7E6] bg-white p-6 shadow-sm",
	cardMuted: "rounded-lg bg-gray-50 p-5",
	cardMutedRoundedBottom: "rounded-b-lg bg-gray-50 p-5",
	cardMutedWithTopRadius: "rounded-b-lg rounded-t-lg bg-gray-50 p-5",
	banner: "relative rounded-t-lg bg-primary-50 p-4",
	sectionBorder: "mt-12 mb-12 border-t border-b border-[#E5E7E6] py-7",
	heading: "mb-4 text-xl font-semibold text-[#0F1912]",
	label: "mb-1 block text-sm font-medium text-[#5A615D]",
	labelDark: "text-[#0F1912]",
	inputDisabled:
		"w-full rounded-md border border-[#C1C4C2] bg-[#F5F5F5] px-3 py-2 text-[#5A615D]",
	readOnlyValue: "text-sm text-[#0F1912]",
	loading: "text-[#5A615D]",
} as const;

/**
 * Derives the role key used in UI/translations from profile.role (API value).
 */
export function getRoleKeyFromProfile(
	role: string | undefined,
): ProfileRoleKey {
	if (role === PROFILE_ROLE.ADMIN) return PROFILE_ROLE.ADMIN;
	if (role === PROFILE_ROLE.SUPERUSER) return PROFILE_ROLE.SUPERUSER;
	if (role === PROFILE_ROLE.CUSTOMER) return PROFILE_ROLE.CUSTOMER;
	return PROFILE_ROLE.EMPLOYEE;
}
