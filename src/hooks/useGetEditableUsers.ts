import { getEditableUsers, searchEditableUsers } from "@/services/user.service";
import { EditableUser } from "@/types/user.types";
import { useQuery } from "@tanstack/react-query";

export const editableUsersKeys = {
	all: ["editableUsers"] as const,
	lists: () => [...editableUsersKeys.all, "list"] as const,
	list: (page: number, pageSize: number) =>
		[...editableUsersKeys.lists(), page, pageSize] as const,
};

export function useGetEditableUsers(
	page: number = 1,
	pageSize: number = 10,
	enabled: boolean = true,
	userId: string,
) {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: editableUsersKeys.list(page, pageSize),
		queryFn: async () => {
			const response = await getEditableUsers(
				page.toString(),
				pageSize.toString(),
				userId,
			);
			return response;
		},
		enabled,
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 10,
	});

	return {
		users: data?.users || [],
		total: data?.total || 0,
		page: data?.page || page,
		pageSize: data?.pageSize || pageSize,
		totalPages: data?.totalPages || 0,
		isLoading,
		error,
		refetch,
	};
}

export function useSearchEditableUsers(
	page: number = 1,
	pageSize: number = 10,
	searchQuery: string,
	enabled: boolean = true,
) {
	const trimmedQuery = searchQuery.trim();
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: [
			...editableUsersKeys.list(page, pageSize),
			"search",
			trimmedQuery,
		],
		queryFn: async () => {
			const response = await searchEditableUsers(
				trimmedQuery,
				page.toString(),
				pageSize.toString(),
			);
			return response;
		},
		enabled: enabled && trimmedQuery.length > 0,
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 10,
	});

	return {
		users: data?.users || [],
		total: data?.total || 0,
		page: data?.page || page,
		pageSize: data?.pageSize || pageSize,
		totalPages: data?.totalPages || 0,
		isLoading,
		error,
		refetch,
	};
}
