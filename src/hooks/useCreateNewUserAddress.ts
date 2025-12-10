import { createNewUserAddress } from "@/services/user.service";
import type { CreateNewUserAddress } from "@/types/address";
import { useMutation } from "@tanstack/react-query";

export function useCreateNewUserAddress() {
	const mutation = useMutation({
		mutationFn: (payload: CreateNewUserAddress) =>
			createNewUserAddress(payload),
	});

	return mutation;
}
