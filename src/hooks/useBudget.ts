import { useEffect, useMemo, useState } from "react";

import {
	getActiveBudgetForUser,
	getActiveBudgetsForUsers,
	getAvailableApproverCandidates,
	getCartEvaluation,
	postBudget,
} from "@/services/budgets.service";
import {
	ApproverCandidate,
	BudgetDetail,
	BudgetSummary,
	CartEvaluation,
	PostBudgetPayload,
} from "@/types/budget.types";
import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";

export const budgetKeys = {
	all: ["budget"] as const,
	forUser: (userId: number) =>
		[...budgetKeys.all, "forUser", userId] as const,
	forUsers: (userIds: number[]) =>
		[...budgetKeys.all, "forUsers", [...userIds].sort((a, b) => a - b)] as const,
	approverCandidates: (search: string) =>
		[...budgetKeys.all, "approverCandidates", search] as const,
	cartEvaluation: (signature: string) =>
		[...budgetKeys.all, "cartEvaluation", signature] as const,
};

/** Fetches the currently-active budget for a user, if any. Used to prefill the
 *  Sett budsjett wizard so a re-open shows existing values (BE POST /budget is
 *  an upsert — without this the user would silently overwrite). */
export function useActiveBudgetForUser(userId: number | undefined) {
	return useQuery<BudgetSummary | null>({
		queryKey: userId ? budgetKeys.forUser(userId) : ["budget", "forUser", "none"],
		queryFn: () => getActiveBudgetForUser(userId!),
		enabled: userId !== undefined,
		staleTime: 30_000,
	});
}

/** Fetches active budgets for a page of users in one request and returns a
 *  Map keyed by userId for O(1) lookup while rendering the Budsjett column.
 *  Swap to a BE-embedded `activeBudget` on the user list response once BE
 *  ships it — this hook then becomes redundant. */
export function useActiveBudgetsByUser(userIds: number[]) {
	const query = useQuery<BudgetSummary[]>({
		queryKey: budgetKeys.forUsers(userIds),
		queryFn: () => getActiveBudgetsForUsers(userIds),
		enabled: userIds.length > 0,
		staleTime: 30_000,
		placeholderData: keepPreviousData,
	});
	const byUserId = useMemo(() => {
		const map = new Map<number, BudgetSummary>();
		for (const b of query.data ?? []) map.set(b.userId, b);
		return map;
	}, [query.data]);
	return { byUserId, isFetching: query.isFetching };
}

export function useApproverCandidates(searchInput: string) {
	const [debounced, setDebounced] = useState(searchInput);
	useEffect(() => {
		const handle = setTimeout(() => setDebounced(searchInput), 250);
		return () => clearTimeout(handle);
	}, [searchInput]);

	return useQuery<ApproverCandidate[]>({
		queryKey: budgetKeys.approverCandidates(debounced),
		queryFn: () => getAvailableApproverCandidates(debounced),
		staleTime: 60_000,
		placeholderData: keepPreviousData,
	});
}

/** Evaluates the authenticated user's current cart against their budget.
 *  `cartSignature` should be a stable string that changes whenever the cart
 *  contents change — passing it in the query key lets react-query auto-refetch
 *  when the user adds/removes/updates lines without needing to invalidate from
 *  every cart mutation site. Pass `enabled: false` to opt out (e.g. when a
 *  requisition placer is active — BE has no on-behalf-of param yet, so the
 *  card would show the wrong user's budget). */
export function useCartEvaluation(cartSignature: string, enabled: boolean) {
	return useQuery<CartEvaluation>({
		queryKey: budgetKeys.cartEvaluation(cartSignature),
		queryFn: getCartEvaluation,
		enabled,
		staleTime: 15_000,
		placeholderData: keepPreviousData,
	});
}

export function useCreateOrUpdateBudget() {
	const queryClient = useQueryClient();
	return useMutation<BudgetDetail, Error, PostBudgetPayload>({
		mutationFn: postBudget,
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: budgetKeys.forUser(variables.budgetUserId),
			});
			queryClient.invalidateQueries({ queryKey: budgetKeys.all });
		},
	});
}
