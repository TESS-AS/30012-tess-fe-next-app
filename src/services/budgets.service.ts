import axiosClient from "@/services/axiosClient";
import {
	ApproverCandidate,
	BudgetDetail,
	BudgetSummary,
	PostBudgetPayload,
} from "@/types/budget.types";

interface ListBudgetsResponse {
	success: boolean;
	budgets: BudgetSummary[];
}

interface GetBudgetResponse {
	success: boolean;
	budget: BudgetDetail;
}

interface ApproverCandidatesResponse {
	success: boolean;
	users: ApproverCandidate[];
}

interface PostBudgetResponse {
	success: boolean;
	budget: BudgetDetail;
}

export async function getActiveBudgetForUser(
	userId: number,
): Promise<BudgetSummary | null> {
	const res = await axiosClient.get<ListBudgetsResponse>("/budget", {
		params: { userIds: String(userId) },
	});
	return res.data.budgets?.[0] ?? null;
}

export async function getActiveBudgetsForUsers(
	userIds: number[],
): Promise<BudgetSummary[]> {
	if (userIds.length === 0) return [];
	const res = await axiosClient.get<ListBudgetsResponse>("/budget", {
		params: { userIds: userIds.join(",") },
	});
	return res.data.budgets ?? [];
}

export async function getBudgetById(budgetId: number): Promise<BudgetDetail> {
	const res = await axiosClient.get<GetBudgetResponse>(`/budget/${budgetId}`);
	return res.data.budget;
}

export async function getAvailableApproverCandidates(
	search: string,
	limit = 25,
): Promise<ApproverCandidate[]> {
	const res = await axiosClient.get<ApproverCandidatesResponse>(
		"/budget/availableApproverCandidates",
		{ params: { search, limit } },
	);
	return res.data.users ?? [];
}

export async function postBudget(
	payload: PostBudgetPayload,
): Promise<BudgetDetail> {
	const res = await axiosClient.post<PostBudgetResponse>("/budget", payload);
	return res.data.budget;
}
