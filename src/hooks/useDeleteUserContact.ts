import { editableUsersKeys } from "@/hooks/useGetEditableUsers";
import { deleteUserContact } from "@/services/user.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteContactVars {
	userId: number;
	contactUserId?: number;
}

export function useDeleteUserContact() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ userId, contactUserId }: DeleteContactVars) =>
			deleteUserContact(userId, contactUserId),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: editableUsersKeys.lists(),
			});
		},
	});
}
