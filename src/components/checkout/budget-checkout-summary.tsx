"use client";

import { cn } from "@/lib/utils";
import { CartEvaluation } from "@/types/budget.types";
import { formatNorwegianCurrency } from "@/utils/formatCurrency";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface Props {
	evaluation: CartEvaluation | undefined;
}

const formatKr = (n: number | undefined) =>
	n == null ? "—" : formatNorwegianCurrency(n);

const formatDateNo = (iso: string | undefined) => {
	if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso ?? "";
	const [y, m, d] = iso.split("-");
	return `${d}.${m}.${y}`;
};

const formatPeriod = (period: { from: string; to: string } | undefined) => {
	if (!period) return "—";
	return `${formatDateNo(period.from)} – ${formatDateNo(period.to)}`;
};

export function BudgetCheckoutSummary({ evaluation }: Props) {
	if (!evaluation || !evaluation.hasBudget) return null;

	const withinBudget = evaluation.withinBudget !== false;
	const color = withinBudget ? "#005522" : "#771D1D";
	const bg = withinBudget ? "bg-[#F0FCF2]" : "bg-[#FDFDEA]";
	const Icon = withinBudget ? CheckCircle2 : AlertCircle;
	const title = withinBudget ? "Innenfor budsjett" : "Budsjettoverskridelse";

	return (
		<div className={cn("rounded-md p-4", bg)}>
			<div className="flex items-center gap-2 pb-2">
				<Icon
					className="h-4 w-4"
					style={{ color }}
				/>
				<span
					className="text-sm font-[600]"
					style={{ color }}>
					{title}
				</span>
			</div>
			<div
				className="mb-3 h-px"
				style={{ backgroundColor: color, opacity: 0.2 }}
			/>
			<dl
				className="space-y-1 text-sm"
				style={{ color }}>
				<Row
					label="Ditt budsjett:"
					value={formatPeriod(evaluation.period)}
				/>
				<Row
					label="Totalbudsjett:"
					value={formatKr(evaluation.annualAmount)}
				/>
				<Row
					label="Brukt til nå:"
					value={formatKr(evaluation.used)}
				/>
				<Row
					label="Dette kjøp:"
					value={formatKr(evaluation.cartTotal)}
				/>
				<Row
					label="Tilgjengelig:"
					value={formatKr(evaluation.remainingAfter)}
				/>
			</dl>
		</div>
	);
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex justify-between">
			<dt className="font-[600]">{label}</dt>
			<dd>{value}</dd>
		</div>
	);
}
