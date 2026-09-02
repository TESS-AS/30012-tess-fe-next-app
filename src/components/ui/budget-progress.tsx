import { cn } from "@/lib/utils";

interface BudgetProgressProps {
	/** Total annual budget in kr. If null/undefined, renders the "Ikke satt"
	 *  empty state. */
	annualAmount?: number | null;
	/** Used amount (consumed + reserved) in kr. Ignored when annualAmount is
	 *  missing. */
	used?: number;
	className?: string;
	notSetLabel?: string;
}

const formatAmount = (n: number) =>
	new Intl.NumberFormat("nb-NO").format(Math.round(n));

export function BudgetProgress({
	annualAmount,
	used = 0,
	className,
	notSetLabel = "Ikke satt",
}: BudgetProgressProps) {
	const hasBudget = annualAmount != null && annualAmount > 0;
	const pct = hasBudget
		? Math.min(100, Math.max(0, (used / annualAmount) * 100))
		: 0;

	return (
		<div className={cn("flex flex-col items-center gap-1.5", className)}>
			<span className="text-sm text-[#0F1912]">
				{hasBudget
					? `${formatAmount(annualAmount)} / ${formatAmount(used)}`
					: notSetLabel}
			</span>
			<div
				role="progressbar"
				aria-valuenow={hasBudget ? Math.round(pct) : 0}
				aria-valuemin={0}
				aria-valuemax={100}
				className="h-2 w-32 overflow-hidden rounded-full bg-[#c1c4c2]">
				{hasBudget && (
					<div
						className="h-full bg-[#009640] transition-[width]"
						style={{ width: `${pct}%` }}
					/>
				)}
			</div>
		</div>
	);
}
