import { updateUserRelations } from "@/services/user.service";
import {
	UpdateUserRelationsPayload,
	UpdateUserRelationsResponse,
} from "@/types/user.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userDataBrukereKeys } from "./useFetchUserDataBrukere";
import { assortmentKeys } from "./useGetAssortments";
import { companyKeys } from "./useGetCompanies";
import { customerKeys } from "./useGetCustomers";
import { editableUsersKeys } from "./useGetEditableUsers";
import { warehouseKeys } from "./useGetWarehouse";

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
				queryKey: userDataBrukereKeys.all,
			});

			queryClient.invalidateQueries({
				queryKey: assortmentKeys.all,
			});

			queryClient.invalidateQueries({
				queryKey: customerKeys.all,
			});

			queryClient.invalidateQueries({
				queryKey: warehouseKeys.all,
			});

			queryClient.invalidateQueries({
				queryKey: companyKeys.all,
			});
		},
		onError: (error) => {
			console.error("Failed to update user relations:", error);
		},
	});
}
