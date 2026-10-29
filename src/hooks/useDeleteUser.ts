import { editableUsersKeys } from "@/hooks/useGetEditableUsers";
import { deleteUser } from "@/services/user.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (userId: number) => deleteUser(userId),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: editableUsersKeys.lists(),
			});
		},
	});
}
