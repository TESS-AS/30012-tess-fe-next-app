import { createNewUserAddress } from "@/services/user.service";
import type { CreateNewUserAddress } from "@/types/address";
import { useMutation } from "@tanstack/react-query";

export function useCreateNewUserAddress(userName: string) {
	const mutation = useMutation({
		mutationFn: (payload: CreateNewUserAddress) =>
			createNewUserAddress(userName, payload),
	});

	return mutation;
}
