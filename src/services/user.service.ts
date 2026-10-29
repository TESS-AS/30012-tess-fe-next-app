import { CreateNewUserAddress } from "@/types/address";
import {
	EditableUser,
	FetchUserDataBrukereResponse,
	UpdateUserRelationsPayload,
	UpdateUserRelationsResponse,
	UserDomainConfig,
} from "@/types/user.types";

import axiosInstance from "./axiosClient";

/** Organization record returned by GET api.tessix.no/org/{orgNumber} */
export interface OrganizationRecord {
	org_id: number;
	org_number: string;
	org_name: string;
	org_amended_date: string;
	org_sales_person_id: number | null;
	org_status: string;
	org_response_tb: unknown | null;
	// Address fields (if available in response)
	address?: string;
	postal_code?: string;
	city?: string;
	country?: string;
}

export async function getOrganizationAddresses(
	orgNumber: string,
): Promise<OrganizationRecord | null> {
	try {
		const response = await axiosInstance.get<OrganizationRecord>(
			`/org/${encodeURIComponent(orgNumber)}`,
		);
		return response.data;
	} catch (error) {
		console.error("Error fetching organization:", error);
		throw error;
	}
}

export async function patchUserState(
	userstate: "new" | "connected" | "onboarding",
): Promise<unknown> {
	try {
		const response = await axiosInstance.patch("/user", { userstate });
		return response.data;
	} catch (error) {
		console.error("Error patching user state:", error);
		throw error;
	}
}

/** Customer credit snapshot from GET /customerCredit (APIproxy commit
 *  `9c893606`). `creditRemaining` is a Postgres generated column
 *  (`credit_limit - credit_spent`) so it stays in sync automatically. */
export interface CustomerCredit {
	creditLimit: number;
	creditSpent: number;
	creditRemaining: number;
}

export interface DeleteUserBlockers {
	error: string;
	blockers?: string[];
}

export async function deleteUser(userId: number): Promise<void> {
	try {
		await axiosInstance.delete(`/userAdmin/user/${encodeURIComponent(userId)}`);
	} catch (error) {
		console.error("Error deleting user:", error);
		throw error;
	}
}

export async function deleteUserContact(
	userId: number,
	contactUserId?: number,
): Promise<void> {
	try {
		const query =
			contactUserId !== undefined
				? `?contactUserId=${encodeURIComponent(contactUserId)}`
				: "";
		await axiosInstance.delete(
			`/user/contacts/${encodeURIComponent(userId)}${query}`,
		);
	} catch (error) {
		console.error("Error deleting user contact:", error);
		throw error;
	}
}

export interface TessEmployee {
	userId: number;
	firstName: string | null;
	lastName: string | null;
	email: string;
}

export async function searchTessEmployees(
	search: string,
	limit: number = 25,
): Promise<TessEmployee[]> {
	try {
		const response = await axiosInstance.get<{ users?: TessEmployee[] }>(
			"/user/tessEmployees",
			{ params: { search, limit } },
		);
		return response.data?.users ?? [];
	} catch (error) {
		console.error("Error searching TESS employees:", error);
		throw error;
	}
}

export async function postUserContacts(
	contactUserIds: number[],
): Promise<void> {
	try {
		await axiosInstance.post("/user/contacts", { contactUserIds });
	} catch (error) {
		console.error("Error posting user contacts:", error);
		throw error;
	}
}

export async function getCustomerCredit(): Promise<CustomerCredit | null> {
	try {
		const response = await axiosInstance.get<{
			message?: string;
			credit?: CustomerCredit;
			cat?: string;
		}>("/customerCredit");
		return response.data?.credit ?? null;
	} catch (error) {
		console.error("Error fetching customer credit:", error);
		throw error;
	}
}

export async function updateUserProfile(
	firstName: string,
	lastName: string,
	userPhoneNumber: string,
): Promise<{
	UpdatedFields: [
		{
			firstName: string;
			lastName: string;
			userPhoneNumber: string;
		},
	];
}> {
	try {
		const response = await axiosInstance.patch(`/user`, {
			firstName,
			lastName,
			userPhoneNumber,
		});
		return response.data;
	} catch (error) {
		console.error("Error updating user profile:", error);
		throw error;
	}
}

export async function getEditableUsers(
	page: string,
	pageSize: string,
	userId?: string,
): Promise<EditableUser> {
	try {
		const response = await axiosInstance.get(`/userAdmin/getEditableUsers`, {
			params: {
				page,
				pageSize,
				userId,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching editable users:", error);
		throw error;
	}
}

export async function updateUserRelations(
	payload: UpdateUserRelationsPayload,
): Promise<UpdateUserRelationsResponse> {
	try {
		const response = await axiosInstance.put(
			`/userAdmin/replaceUserRelations`,
			payload,
		);
		return response.data;
	} catch (error) {
		console.error("Error updating user relations:", error);
		throw error;
	}
}

export async function searchEditableUsers(
	search: string,
	page: string,
	pageSize: string,
): Promise<EditableUser> {
	try {
		const response = await axiosInstance.get(`/userAdmin/searchEditableUsers`, {
			params: {
				search,
				page,
				pageSize,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error searching editable users:", error);
		throw error;
	}
}

export async function createNewUserAddress(
	payload: CreateNewUserAddress,
): Promise<string> {
	try {
		const response = await axiosInstance.post(`/address/user`, payload);
		return response.data;
	} catch (error) {
		console.error("Error creating new user address:", error);
		throw error;
	}
}

export async function fetchUserDataBrukere(
	type: string,
	page: number,
	pageSize: number,
	searchTerm?: string,
): Promise<FetchUserDataBrukereResponse> {
	try {
		const response = await axiosInstance.get(`/userAdmin/fetchUserData`, {
			params: {
				type,
				page,
				pageSize,
				...(searchTerm ? { searchTerm } : {}),
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching user data:", error);
		throw error;
	}
}
