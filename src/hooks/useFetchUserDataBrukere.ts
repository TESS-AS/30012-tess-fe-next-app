import { useQuery } from "@tanstack/react-query";

import { fetchUserDataBrukere } from "@/services/user.service";
import { FetchUserDataBrukereResponse } from "@/types/user.types";

export const userDataBrukereKeys = {
	all: ["userDataBrukere"] as const,
	lists: () => [...userDataBrukereKeys.all, "list"] as const,
	list: (type: string, page: number, pageSize: number, searchTerm?: string) =>
		[
			...userDataBrukereKeys.lists(),
			type,
			page,
			pageSize,
			searchTerm ?? "",
		] as const,
};

export function useFetchUserDataBrukere(
	type: string,
	page: number,
	pageSize: number,
	searchTerm?: string,
	enabled: boolean = true,
) {
	const { data, isLoading, error, refetch } =
		useQuery<FetchUserDataBrukereResponse>({
			queryKey: userDataBrukereKeys.list(type, page, pageSize, searchTerm),
			queryFn: async () => {
				const response = await fetchUserDataBrukere(
					type,
					page,
					pageSize,
					searchTerm,
				);
				return response;
			},
			enabled,
			staleTime: 1000 * 60 * 5,
			gcTime: 1000 * 60 * 10,
		});

	return {
		data,
		isLoading,
		error,
		refetch,
	};
}
