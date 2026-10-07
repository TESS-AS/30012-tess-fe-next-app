import { postHoseSelection } from "@/services/hose-configurator.service";
import type {
	HoseSelectionRequest,
	HoseSelectionResponse,
} from "@/types/hose-configurator.types";
import { useMutation } from "@tanstack/react-query";

export const useHoseSelection = () => {
	return useMutation<HoseSelectionResponse, Error, HoseSelectionRequest>({
		mutationFn: postHoseSelection,
	});
};
