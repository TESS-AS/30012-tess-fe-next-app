"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

export type OrderLineField = {
	key: string;
	label: string;
	bestilt: string;
	bekreftet: string;
};

export type OrderLineTableProps = {
	lineNumber: number;
	deviationCount: number;
	fields: OrderLineField[];
	isExpanded?: boolean;
	onToggle?: () => void;
};

export function OrderLineTable({
	lineNumber,
	deviationCount,
	fields,
	isExpanded: controlledExpanded,
	onToggle,
}: OrderLineTableProps) {
	const [internalExpanded, setInternalExpanded] = useState(false);
	const isControlled = controlledExpanded !== undefined;
	const isExpanded = isControlled ? controlledExpanded : internalExpanded;

	const handleToggle = () => {
		if (isControlled && onToggle) {
			onToggle();
		} else {
			setInternalExpanded(!internalExpanded);
		}
	};

	return (
		<div
			className={cn(
				"overflow-hidden border shadow-sm",
				isExpanded ? "rounded-t-lg" : "rounded-lg",
			)}>
			{/* Header */}
			<button
				onClick={handleToggle}
				className={cn(
					"flex w-full items-center justify-between bg-[#F9F9F9] p-3 text-left",
					isExpanded && "border-b border-[#C1C4C2]",
				)}>
				<h3 className="text-xl font-semibold text-[#0F1912]">
					Linje {lineNumber}{" "}
					<span className="text-base font-medium text-gray-500">
						({deviationCount} avvik)
					</span>
				</h3>
				{isExpanded ? (
					<ChevronUp className="h-5 w-5 text-[#5A615D]" />
				) : (
					<ChevronDown className="h-5 w-5 text-[#5A615D]" />
				)}
			</button>

			{/* Table Content */}
			{isExpanded && (
				<div className="bg-[#F7F7F7] p-3 pb-0">
					{/* Column Headers */}
					<div className="] mb-2 grid grid-cols-3 gap-4">
						<div></div>
						<div className="text-left">
							<p className="text-base font-normal text-gray-500">Bestilt</p>
						</div>
						<div className="text-left">
							<p className="text-base font-normal text-gray-500">Bekreftet</p>
						</div>
					</div>

					{/* Rows */}
					<div className="-mx-3 space-y-0">
						{fields.map((field, index) => {
							const isEvenRow = index % 2 === 1;

							return (
								<div
									key={field.key}
									className={cn(
										"grid grid-cols-3 gap-4 px-3 py-3",
										isEvenRow ? "bg-[#F7F7F7]" : "bg-white",
									)}>
									{/* Label */}
									<div className="text-base font-normal text-gray-500">
										{field.label}
									</div>

									{/* Bestilt Value */}
									<div className="text-left text-base font-normal text-gray-900">
										{field.bestilt}
									</div>

									{/* Bekreftet Value */}
									<div className="text-left text-base font-normal text-red-700">
										{field.bekreftet}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
