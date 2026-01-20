"use client";

import { useState } from "react";

import {
	OrderLineField,
	OrderLineTable,
} from "@/app/[locale]/profile/(components)/order-line-table";
import { Button } from "@/components/ui/button";
import { X, Check, ChevronLeft } from "lucide-react";

type OrderLine = {
	lineNumber: number;
	deviationCount: number;
	fields: OrderLineField[];
};

type AvvikendeOrdreDetail = {
	orderId: string;
	supplier: string;
	date: string;
	lines: OrderLine[];
};

// Mock data for order detail
const mockOrderDetail: AvvikendeOrdreDetail = {
	orderId: "100296071",
	supplier: "Leverandør 1",
	date: "19.11.2025, 11:33",
	lines: [
		{
			lineNumber: 1,
			deviationCount: 1,
			fields: [
				{
					key: "varenummer",
					label: "Varenummer",
					bestilt: "FP10267-280",
					bekreftet: "400",
				},
				{
					key: "leveringsdato",
					label: "Leveringsdato",
					bestilt: "2025-11-13",
					bekreftet: "2025-11-14",
				},
				{
					key: "antall",
					label: "Antall",
					bestilt: "2",
					bekreftet: "0",
				},
				{
					key: "levVarenummer",
					label: "Lev. varenummer",
					bestilt: "2608597521",
					bekreftet: "1600A01B20",
				},
			],
		},
		{
			lineNumber: 8,
			deviationCount: 2,
			fields: [
				{
					key: "leveringsdato",
					label: "Leveringsdato",
					bestilt: "2025-11-13",
					bekreftet: "2025-11-15",
				},
				{
					key: "antall",
					label: "Antall",
					bestilt: "5",
					bekreftet: "3",
				},
			],
		},
		{
			lineNumber: 11,
			deviationCount: 2,
			fields: [
				{
					key: "varenummer",
					label: "Varenummer",
					bestilt: "FP10267-280",
					bekreftet: "400",
				},
				{
					key: "antall",
					label: "Antall",
					bestilt: "10",
					bekreftet: "8",
				},
			],
		},
	],
};

export function AvvikendeOrdreDetail({
	orderId,
	onBack,
}: {
	orderId: string;
	onBack: () => void;
}) {
	const [expandedLines, setExpandedLines] = useState<number[]>([1, 8]);
	const order = mockOrderDetail; // In real implementation, fetch by orderId

	const toggleLine = (lineNumber: number) => {
		setExpandedLines((prev) =>
			prev.includes(lineNumber)
				? prev.filter((num) => num !== lineNumber)
				: [...prev, lineNumber],
		);
	};

	const handleReject = () => {
		// Handle reject action
		console.log("Reject order", orderId);
	};

	const handleApprove = () => {
		// Handle approve action
		console.log("Approve order", orderId);
	};

	return (
		<div className="space-y-6">
			<button
				onClick={onBack}
				className="flex items-center text-sm text-[#5A615D] hover:text-[#0F1912]">
				<ChevronLeft className="mr-1 h-4 w-4" />
				Gå tilbake
			</button>

			<h1 className="text-2xl font-bold text-[#0F1912]">
				Ordre nummer {order.orderId}
			</h1>

			{/* Order Summary */}
			<div className="rounded-lg border border-[#C1C4C2] bg-[#F8F9F8] p-4">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-base font-normal text-gray-500">Leverandør</p>
						<p className="text-base font-medium text-[#0F1912]">
							{order.supplier}
						</p>
					</div>
					<div>
						<p className="text-base font-normal text-gray-500">Dato</p>
						<p className="text-base font-medium text-[#0F1912]">{order.date}</p>
					</div>
				</div>
			</div>

			{/* Avvik Section */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-bold text-[#0F1912]">Avvik</h2>
					<div className="flex gap-3">
						<Button
							onClick={handleReject}
							variant="reject"
							className="flex items-center gap-2 text-xs">
							Avvis
							<div className="flex h-4 w-4 items-center justify-center rounded-full border-1 border-white">
								<X className="p-[3px] text-white" />
							</div>
						</Button>
						<Button
							onClick={handleApprove}
							variant="approve"
							className="flex items-center gap-2 text-xs">
							Godkjenn
							<div className="flex h-4 w-4 items-center justify-center rounded-full border-1 border-white">
								<Check className="p-[3px] text-white" />
							</div>
						</Button>
					</div>
				</div>

				{/* Order Lines */}
				<div className="space-y-3">
					{order.lines.map((line) => {
						const isExpanded = expandedLines.includes(line.lineNumber);
						return (
							<OrderLineTable
								key={line.lineNumber}
								lineNumber={line.lineNumber}
								deviationCount={line.deviationCount}
								fields={line.fields}
								isExpanded={isExpanded}
								onToggle={() => toggleLine(line.lineNumber)}
							/>
						);
					})}
				</div>
			</div>
		</div>
	);
}
