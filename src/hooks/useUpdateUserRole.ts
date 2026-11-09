import {
	AssignableUserRole,
	updateUserRole,
} from "@/services/user.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { editableUsersKeys } from "./useGetEditableUsers";

export function useUpdateUserRole() {
	const queryClient = useQueryClient();
	return useMutation<
		void,
		Error,
		{ userId: number; role: AssignableUserRole }
	>({
		mutationFn: ({ userId, role }) => updateUserRole(userId, role),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: editableUsersKeys.all });
		},
	});
}
