"use client";

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
	const truncated = Math.floor(amount * 100) / 100;
	const [whole, decimal = "00"] = truncated.toString().split(".");

	const formattedAmount = `${whole},${decimal.padEnd(2, "0")} kr`;

	return (
		<span
			className={`font-medium ${isPositive ? "text-[#009640]" : ""} ${className}`}>
			{formattedAmount}
		</span>
	);
};
