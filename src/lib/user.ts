/**
 * Returns true when the given email belongs to an internal TESS employee
 * (@tess.no domain). Centralized so every call site resolves identity the
 * same way. If BE ever ships a dedicated flag on the profile response
 * (e.g. `isInternal: boolean`), swap this one body and all callers upgrade.
 *
 * Historical note: BE itself uses the same string check in multiple places
 * (login SSO callbacks, the `/user/tessEmployees` tagging endpoint, Entra
 * sniffer), so the FE helper is aligned with current BE behavior rather
 * than introducing drift.
 */
export function isTessEmployeeEmail(email: string | null | undefined): boolean {
	if (!email) return false;
	return email.toLowerCase().endsWith("@tess.no");
}
