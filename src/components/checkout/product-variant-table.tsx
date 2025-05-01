"use client";

import { Button } from "@/components/ui/button";

const variants = [
	{ thread: '1/4"', length: "19 mm", coating: "Zinc" },
	{ thread: '1/4"', length: "25 mm", coating: "Zinc" },
	{ thread: '5/16"', length: "32 mm", coating: "SS" },
];

export default function ProductVariantTable() {
	return (
		<div className="mt-4 overflow-auto rounded-md border">
			<table className="min-w-full text-sm">
				<thead className="bg-muted border-b text-left font-medium">
					<tr>
						<th className="p-2">Thread Size</th>
						<th className="p-2">Length</th>
						<th className="p-2">Coating</th>
						<th className="p-2">Qty</th>
						<th className="p-2">Add</th>
					</tr>
				</thead>
				<tbody>
					{variants.map((variant, i) => (
						<tr
							key={i}
							className="border-b">
							<td className="p-2">{variant.thread}</td>
							<td className="p-2">{variant.length}</td>
							<td className="p-2">{variant.coating}</td>
							<td className="p-2">[1]</td>
							<td className="cursor-pointer p-2 font-semibold text-purple-600">
								[+]
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
