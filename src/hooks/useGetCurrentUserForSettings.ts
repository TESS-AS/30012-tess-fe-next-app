import { getEditableUsers } from "@/services/user.service";
import { User } from "@/types/user.types";
import { useQuery } from "@tanstack/react-query";

export const currentUserForSettingsKeys = {
	all: ["editableUsers", "currentUser"] as const,
	detail: (userId: number | undefined) =>
		[...currentUserForSettingsKeys.all, userId] as const,
};

export function useGetCurrentUserForSettings(profileUserId: number | undefined) {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: currentUserForSettingsKeys.detail(profileUserId),
		queryFn: async () => {
			const response = await getEditableUsers(
				"1",
				"1",
				profileUserId?.toString(),
			);
			return response;
		},
		enabled: typeof profileUserId === "number",
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 10,
	});

	const currentUser: User | null =
		data?.users?.length ? data.users[0] ?? null : null;

	return {
		currentUser,
		isLoading,
		error,
		refetch,
	};
}
