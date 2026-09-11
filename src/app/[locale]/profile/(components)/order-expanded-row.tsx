"use client";

import { cn } from "@/lib/utils";
import {
	mapLineStatusToOrderStatus,
	type OrderItems,
	type OrderLine,
} from "@/types/orderHistory.types";
import { formatNorwegianCurrency } from "@/utils/formatCurrency";
import Image from "next/image";

interface OrderExpandedRowProps {
	order: OrderItems;
	labels: {
		units: string;
		quantity: string;
		price: string;
		status: string;
	};
}

const getLineStatusColor = (status: string) => {
	switch (status) {
		case "Mottatt":
		case "Bekreftet":
			return "bg-[#DCF7E0] text-[#005522]";
		case "Plukket":
			return "bg-[#E5EDFF] text-[#42389D]";
		case "Under transport":
			return "bg-[#FDF6B2] text-[#723B13]";
		case "Levert":
			return "bg-[#009640] text-white";
		case "Kansellert":
			return "bg-[#FDE8E8] text-[#9B1C1C]";
		default:
			return "bg-gray-100 text-gray-600";
	}
};

const getLineStatusIcon = (status: string) => {
	switch (status) {
		case "Mottatt":
			return (
				<Image
					src="/icons/profile/table/like.svg"
					alt=""
					width={12}
					height={12}
					loading="eager"
				/>
			);
		case "Bekreftet":
		case "Plukket":
			return (
				<Image
					src="/icons/profile/table/tick.svg"
					alt=""
					width={12}
					height={12}
					loading="eager"
				/>
			);
		case "Levert":
			return (
				<Image
					src="/icons/profile/table/tick.svg"
					alt=""
					width={12}
					height={12}
					className="[filter:brightness(0)_invert(1)]"
					loading="eager"
				/>
			);
		case "Kansellert":
			return (
				<Image
					src="/icons/profile/table/x.svg"
					alt=""
					width={12}
					height={12}
					loading="eager"
				/>
			);
		default:
			return null;
	}
};

function formatQuantity(line: OrderLine) {
	const qty = line.quantity ?? 0;
	const unit = String(line.unit ?? "").trim();
	return unit ? `${qty} ${unit}` : String(qty);
}

export function OrderExpandedRow({ order, labels }: OrderExpandedRowProps) {
	const lines = (order.items ?? []).filter((line) => line.lineStatus !== 0);

	if (lines.length === 0) {
		return (
			<p className="text-sm text-[#5A615D]">Ingen ordrelinjer</p>
		);
	}

	return (
		<table className="w-full max-w-4xl">
			<thead>
				<tr>
					<th className="w-[45%] pb-4 text-left text-xs font-bold text-[#5A615D]">
						{labels.units}
					</th>
					<th className="w-[15%] pb-4 text-left text-xs font-bold text-[#5A615D]">
						{labels.quantity}
					</th>
					<th className="w-[20%] pb-4 text-left text-xs font-bold text-[#5A615D]">
						{labels.price}
					</th>
					<th className="w-[20%] pb-4 text-left text-xs font-bold text-[#5A615D]">
						{labels.status}
					</th>
				</tr>
			</thead>
			<tbody className="text-sm">
				{lines.map((line) => {
					const statusLabel = mapLineStatusToOrderStatus(line.lineStatus);
					return (
						<tr
							key={`${line.orderLineNumber}-${line.itemId}`}
							className="border-t border-[#E5E7E6]">
							<td className="py-4 pr-4">
								<div className="space-y-1">
									<p className="font-medium text-[#0F1912]">{line.itemName}</p>
									<p className="text-[#5A615D]">{line.itemNumber}</p>
								</div>
							</td>
							<td className="py-4 pr-4 text-[#0F1912]">
								{formatQuantity(line)}
							</td>
							<td className="py-4 pr-4 text-[#0F1912]">
								{formatNorwegianCurrency(line.lineSum ?? line.netPrice ?? 0)}
							</td>
							<td className="py-4">
								<span
									className={cn(
										"inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs",
										getLineStatusColor(statusLabel),
									)}>
									{getLineStatusIcon(statusLabel)}
									{statusLabel}
								</span>
							</td>
						</tr>
					);
				})}
			</tbody>
		</table>
	);
}
