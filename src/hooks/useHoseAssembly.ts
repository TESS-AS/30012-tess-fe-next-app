import { postHoseAssembly } from "@/services/hose-configurator.service";
import type {
	HoseAssemblyRequest,
	HoseAssemblyResponse,
} from "@/types/hose-configurator.types";
import { useMutation } from "@tanstack/react-query";

export const useHoseAssembly = () => {
	return useMutation<HoseAssemblyResponse, Error, HoseAssemblyRequest>({
		mutationFn: postHoseAssembly,
	});
};
