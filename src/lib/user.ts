import { USER_ROLES, isAdminOrSuperuser } from "@/constants/userRoles";
import type { ProfileUser } from "@/types/user.types";

export function isTessEmployeeEmail(email: string | null | undefined): boolean {
	if (!email) return false;
	return email.toLowerCase().endsWith("@tess.no");
}

export function canSeeUsersTab(
	profile: ProfileUser | null | undefined,
): boolean {
	if (!profile) return false;
	return (
		isAdminOrSuperuser(profile.role) ||
		profile.role === USER_ROLES.EMPLOYEE ||
		isTessEmployeeEmail(profile.email)
	);
}
