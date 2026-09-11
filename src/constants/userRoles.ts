/**
 * Canonical user role values returned by BE on `profile.role` (and the same
 * shape on `user.role` in admin tables).
 *
 * Kept as a `const object + union type` rather than a TS `enum` — enums
 * produce runtime code and don't tree-shake well; this pattern gives us the
 * same lookup ergonomics (`USER_ROLES.ADMIN`) with plain string constants and
 * a nominal union type for compile-time safety.
 */
export const USER_ROLES = {
	ADMIN: "admin",
	SUPERUSER: "superuser",
	EMPLOYEE: "employee",
	USER: "user",
	THM_ADMIN: "thmAdmin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/** Handy predicates for the two most common access checks — the sidebar,
 *  the EDI portal, and the users-admin table all share these gates. */
export const isAdminOrEmployee = (role: string | undefined | null): boolean =>
	role === USER_ROLES.ADMIN || role === USER_ROLES.EMPLOYEE;

export const isAdminOrSuperuser = (role: string | undefined | null): boolean =>
	role === USER_ROLES.ADMIN || role === USER_ROLES.SUPERUSER;
