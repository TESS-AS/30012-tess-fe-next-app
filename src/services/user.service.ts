import { CreateNewUserAddress } from "@/types/address";
import {
	EditableUser,
	UpdateUserRelationsPayload,
	UpdateUserRelationsResponse,
	UserDomainConfig,
} from "@/types/user.types";

import axiosInstance from "./axiosClient";

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

export async function getUserDomainConfig(
	userEmail: string,
): Promise<UserDomainConfig> {
	try {
		const response = await axiosInstance.get(
			`/userAdmin/getDomainConfig/${userEmail}`,
		);
		return response.data;
	} catch (error) {
		console.error("Error fetching domain config:", error);
		throw error;
	}
}

export async function updateUserRelations(
	payload: UpdateUserRelationsPayload,
): Promise<UpdateUserRelationsResponse> {
	try {
		const response = await axiosInstance.post(
			`/userAdmin/updateUserRelations`,
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
