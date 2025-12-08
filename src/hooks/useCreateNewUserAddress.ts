import { useMutation } from "@tanstack/react-query";

import { createNewUserAddress } from "@/services/user.service";
import type { CreateNewUserAddress } from "@/types/address";

export function useCreateNewUserAddress(userName: string) {
	const mutation = useMutation({
		mutationFn: (payload: CreateNewUserAddress) =>
			createNewUserAddress(userName, payload),
	});

	return mutation;
}
