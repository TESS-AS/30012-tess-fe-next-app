import axiosClient from "@/services/axiosClient";
import { ProfileUser } from "@/types/user.types";
import { useQuery } from "@tanstack/react-query";

export const profileKeys = {
	all: ["profile"] as const,
	detail: () => [...profileKeys.all, "detail"] as const,
};

export function useGetProfileData() {
	const { data, isLoading, error } = useQuery({
		queryKey: profileKeys.detail(),
		queryFn: async () => {
			const response = await axiosClient.get<ProfileUser[]>("/user");
			return response.data[0] || null;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});

	return { data: data || null, isLoading, error };
}
