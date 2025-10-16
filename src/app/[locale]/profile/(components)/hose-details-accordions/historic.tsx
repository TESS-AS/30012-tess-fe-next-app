import React from "react";

import {
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "@/components/ui/accordion";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

import { Cell } from "./cell";

interface HistoryDetail {
	workOrder: string;
	description: string;
	date: string;
	link: string | null;
}

interface HistoryRow {
	id: string;
	workOrder: string;
	description: string;
	date: string;
	details: HistoryDetail[];
}

interface Props {
	historyData: HistoryRow[];
	expandedRows: Set<string>;
	toggleRow: (id: string) => void;
	isEditMode: boolean;
}

export const HistoricAccordion = ({
	historyData,
	expandedRows,
	toggleRow,
	isEditMode,
}: Props) => {
	return (
		<AccordionItem
			value="historikk"
			className="border-none">
			<AccordionTrigger className="text-decoration-none cursor-pointer rounded-none border-b border-[#C1C4C2] p-4 px-0 text-lg font-bold text-[#0F1912] hover:no-underline">
				Historikk
			</AccordionTrigger>

			<AccordionContent className="p-0 pt-4">
				<div className="overflow-hidden rounded border">
					<table className="w-full text-left text-sm">
						<tbody>
							{historyData.map((row) => (
								<React.Fragment key={row.id}>
									<tr
										className="cursor-pointer border-t bg-[#F8F9F8] hover:bg-[#F0F1F0]"
										onClick={() => toggleRow(row.id)}
										aria-expanded={expandedRows.has(row.id)}>
										<td className="px-3 py-3">
											<span className="text-emerald-700">
												{row.workOrder?.slice(-8)}
											</span>
											<span className="text-[#5A615D]"> (gjeldende)</span>
										</td>
										<td className="px-3 py-3">
											<div className="flex justify-end">
												{expandedRows.has(row.id) ? (
													<ChevronUp className="h-4 w-4 text-[#0F1912]" />
												) : (
													<ChevronDown className="h-4 w-4 text-[#0F1912]" />
												)}
											</div>
										</td>
									</tr>

									{expandedRows.has(row.id) && row.details.length > 0 && (
										<tr>
											<td
												colSpan={4}
												className="border-t bg-white p-0">
												<table className="w-full">
													<thead className="bg-[#F8F9F8] text-xs text-[#5A615D] uppercase">
														<tr>
															<th className="px-3 py-2 font-normal">
																ARBEIDSORDRENUMMER (WO)
															</th>
															<th className="px-3 py-2 font-normal">
																BESKRIVELSE
															</th>
															<th className="px-3 py-2 font-normal">
																DATO FULLFØRT
															</th>
															<th className="w-10"></th>
														</tr>
													</thead>
													<tbody>
														{row.details.map((detail, idx) => (
															<tr
																key={`${row.id}-${idx}`}
																className="border-t align-top">
																<td className="px-3 py-3 text-[#0F1912]">
																	<Cell
																		value={detail.workOrder}
																		placeholder="Arbeidsordrenummer"
																		isEditMode={isEditMode}
																		searchable
																	/>
																</td>

																<td className="px-3 py-3">
																	<div className="text-[#0F1912]">
																		<Cell
																			value={detail.description}
																			placeholder="Beskrivelse"
																			isEditMode={isEditMode}
																		/>
																	</div>

																	{!isEditMode ? (
																		detail.link && (
																			<Link
																				href={detail.link || "#"}
																				target="_blank"
																				rel="noopener noreferrer"
																				className="text-emerald-700 underline">
																				{detail.link}
																			</Link>
																		)
																	) : (
																		<div className="mt-2">
																			<Cell
																				value={detail.link ?? ""}
																				placeholder="Lenke (https://...)"
																				isEditMode={isEditMode}
																			/>
																		</div>
																	)}
																</td>

																<td className="px-3 py-3 text-[#0F1912]">
																	<Cell
																		value={detail.date}
																		placeholder="Dato fullført"
																		isEditMode={isEditMode}
																	/>
																</td>

																<td className="w-10"></td>
															</tr>
														))}
													</tbody>
												</table>
											</td>
										</tr>
									)}
								</React.Fragment>
							))}
						</tbody>
					</table>
				</div>
			</AccordionContent>
		</AccordionItem>
	);
};
