import { updateUserRelations } from "@/services/user.service";
import {
	UpdateUserRelationsPayload,
	UpdateUserRelationsResponse,
} from "@/types/user.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editableUsersKeys } from "./useGetEditableUsers";
import { userDomainConfigKeys } from "./useGetUserDomainConfig";

export function useUpdateUserRelations() {
	const queryClient = useQueryClient();

	return useMutation<
		UpdateUserRelationsResponse,
		Error,
		UpdateUserRelationsPayload
	>({
		mutationFn: async (payload: UpdateUserRelationsPayload) => {
			const response = await updateUserRelations(payload);
			return response;
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({
				queryKey: editableUsersKeys.all,
			});

			queryClient.invalidateQueries({
				queryKey: userDomainConfigKeys.all,
			});
		},
		onError: (error) => {
			console.error("Failed to update user relations:", error);
		},
	});
}
