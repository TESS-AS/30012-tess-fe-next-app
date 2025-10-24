"use client";

import { formatNorwegianCurrency } from "@/utils/formatCurrency";

interface PriceDisplayProps {
	amount: number;
	className?: string;
	isPositive?: boolean;
}

export const PriceDisplay = ({
	amount,
	className = "",
	isPositive = false,
}: PriceDisplayProps) => {
	return (
		<span
			className={`font-medium ${isPositive ? "text-[#009640]" : ""} ${className}`}>
			{formatNorwegianCurrency(amount)}
		</span>
	);
};
