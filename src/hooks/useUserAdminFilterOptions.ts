import {
	UserAdminFilterType,
	getUserAdminFilterOptions,
} from "@/services/user.service";
import { useQuery } from "@tanstack/react-query";

export const userAdminFilterOptionsKey = (
	type: UserAdminFilterType,
	search: string,
	limit: number,
) => ["userAdmin", "filterOptions", type, search.trim(), limit] as const;

export function useUserAdminFilterOptions(
	type: UserAdminFilterType,
	search: string = "",
	limit: number = 50,
	enabled: boolean = true,
) {
	const trimmed = search.trim();
	const { data, isLoading } = useQuery({
		queryKey: userAdminFilterOptionsKey(type, trimmed, limit),
		queryFn: () => getUserAdminFilterOptions(type, trimmed || undefined, limit),
		enabled,
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 10,
	});

	return {
		options: data ?? [],
		isLoading,
	};
}
