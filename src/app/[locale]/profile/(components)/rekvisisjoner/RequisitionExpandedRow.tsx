import type { Rekvisisjon } from "@/hooks/useRequisitions";

import { formatPlacerAddress } from "./rekvisisjoner.utils";

interface RequisitionExpandedRowProps {
	rekvisisjon: Rekvisisjon;
	labels: {
		placerShipTo: (values: { name: string; address: string }) => string;
		units: string;
		quantity: string;
		price: string;
	};
}

export function RequisitionExpandedRow({
	rekvisisjon,
	labels,
}: RequisitionExpandedRowProps) {
	return (
		<div>
			{rekvisisjon.placerAddress && (
				<p className="mb-4 text-sm font-medium text-[#0F1912]">
					{labels.placerShipTo({
						name: rekvisisjon.bestiller,
						address: formatPlacerAddress(rekvisisjon.placerAddress),
					})}
				</p>
			)}
			<table className="w-[70%]">
				<thead>
					<tr>
						<th className="w-[60%] pb-4 text-left text-xs font-bold text-[#5A615D]">
							{labels.units}
						</th>
						<th className="w-[20%] pb-4 text-left text-xs font-bold text-[#5A615D]">
							{labels.quantity}
						</th>
						<th className="w-[20%] pb-4 text-left text-xs font-bold text-[#5A615D]">
							{labels.price}
						</th>
					</tr>
				</thead>
				<tbody className="text-sm">
					{rekvisisjon.items.map((item, index) => (
						<tr
							key={index}
							className="border-t border-[#E5E7E6]">
							<td className="py-4">
								<div className="space-y-1">
									<p className="font-medium text-[#0F1912]">{item.name}</p>
									<p className="text-[#5A615D]">{item.itemNumber}</p>
								</div>
							</td>
							<td className="py-4">{item.quantity}</td>
							<td className="py-4">{item.price}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
