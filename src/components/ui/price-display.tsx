"use client";

interface PriceDisplayProps {
  amount: number;
  className?: string;
  isPositive?: boolean;
}

export const PriceDisplay = ({ amount, className = "", isPositive = false }: PriceDisplayProps) => {
  const formattedAmount = `${amount.toFixed(2)},- kr`;
  
  return (
    <span className={`font-medium ${isPositive ? "text-[#009640]" : ""} ${className}`}>
      {formattedAmount}
    </span>
  );
};
