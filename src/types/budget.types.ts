export type BudgetStatus = "active" | "inactive" | "cancelled";

export interface BudgetApprover {
	userId: number;
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string | null;
}

export interface BudgetSummary {
	budgetId: number;
	userId: number;
	firstName: string;
	lastName: string;
	email: string;
	annualAmount: number;
	validFrom: string;
	validTo: string;
	consumed: number;
	reserved: number;
	used: number;
	remaining: number;
}

export interface BudgetDetail extends BudgetSummary {
	phoneNumber: string | null;
	status: BudgetStatus;
	createdByUserId: number;
	createdByFirstName: string;
	createdByLastName: string;
	createdAt: string;
	approvers: BudgetApprover[];
}

export interface ApproverCandidate {
	userId: number;
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string | null;
}

export interface PostBudgetPayload {
	budgetUserId: number;
	annualAmount: number;
	validFrom: string;
	validTo: string;
	autoRenew: boolean;
	status: BudgetStatus;
	approvers: number[];
}

/** Shape of GET /budget/cartEvaluation. `hasBudget: false` is returned for
 *  users without an active budget and skips all downstream fields. */
export interface CartEvaluation {
	hasBudget: boolean;
	budgetId?: number;
	period?: { from: string; to: string };
	annualAmount?: number;
	consumed?: number;
	reserved?: number;
	used?: number;
	available?: number;
	cartTotal?: number;
	remainingAfter?: number;
	withinBudget?: boolean;
	blockedBy?: "budget" | null;
}
