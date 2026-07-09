import {
	createThmView,
	deleteThmView,
	getThmViews,
	saveThmView,
} from "@/services/thm-projects.service";
import type { ThmViewPayload } from "@/types/thm-projects.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const thmViewKeys = {
	all: ["thm", "views"] as const,
	list: () => [...thmViewKeys.all, "list"] as const,
};

export function useThmViews() {
	return useQuery({
		queryKey: thmViewKeys.list(),
		queryFn: getThmViews,
		staleTime: 60 * 1000,
	});
}

export function useCreateThmView() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: ThmViewPayload) => createThmView(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: thmViewKeys.list() });
		},
	});
}

export function useSaveThmView() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			viewId,
			payload,
		}: {
			viewId: number;
			payload: ThmViewPayload;
		}) => saveThmView(viewId, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: thmViewKeys.list() });
		},
	});
}

export function useDeleteThmView() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (viewId: number) => deleteThmView(viewId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: thmViewKeys.list() });
		},
	});
}
