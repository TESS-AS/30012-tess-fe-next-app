"use client";

import { cn } from "@/lib/utils";
import { CustomerCredit } from "@/services/user.service";
import { formatNorwegianCurrency } from "@/utils/formatCurrency";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface Props {
	credit: CustomerCredit | null;
	cartTotal: number | undefined;
}

const formatKr = (n: number | undefined) =>
	n == null ? "—" : formatNorwegianCurrency(n);

export function CreditCheckoutSummary({ credit, cartTotal }: Props) {
	if (!credit || credit.creditLimit <= 0) return null;

	const remainingAfter =
		typeof cartTotal === "number"
			? credit.creditRemaining - cartTotal
			: credit.creditRemaining;
	const withinCredit = remainingAfter >= 0;
	const color = withinCredit ? "#005522" : "#771D1D";
	const bg = withinCredit ? "bg-[#F0FCF2]" : "bg-[#FDFDEA]";
	const Icon = withinCredit ? CheckCircle2 : AlertCircle;
	const title = withinCredit
		? "Innenfor kredittgrense"
		: "Overskrider kredittgrense";

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
					label="Totalkreditt:"
					value={formatKr(credit.creditLimit)}
				/>
				<Row
					label="Brukt kreditt:"
					value={formatKr(credit.creditSpent)}
				/>
				<Row
					label="Dette kjøp:"
					value={formatKr(cartTotal)}
				/>
				<Row
					label="Gjenstående etter kjøp:"
					value={formatKr(remainingAfter)}
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
