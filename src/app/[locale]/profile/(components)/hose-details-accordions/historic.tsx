import React from "react";

import {
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "@/components/ui/accordion";
import { HoseHistoryItem } from "@/types/assets.types";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";

import { Cell } from "./cell";

interface Props {
	historyData: HoseHistoryItem[];
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
	const t = useTranslations("HistoricAccordion");
	return (
		<AccordionItem
			value="historikk"
			className="border-none">
			<AccordionTrigger className="text-decoration-none cursor-pointer rounded-none border-b border-[#C1C4C2] p-4 px-0 text-lg font-bold text-[#0F1912] hover:no-underline">
				{t("title")}
			</AccordionTrigger>

			<AccordionContent className="p-0 pt-4">
				<div className="overflow-hidden rounded border">
					<table className="w-full text-left text-sm">
						<tbody>
							{historyData.map((item) => {
								const itemId = String(item.assetId || item.hoseLineId);
								return (
									<React.Fragment key={itemId}>
										<tr
											className="cursor-pointer border-t bg-[#F8F9F8] hover:bg-[#F0F1F0]"
											onClick={() => toggleRow(itemId)}
											aria-expanded={expandedRows.has(itemId)}>
											<td className="px-3 py-3">
												<span className="text-emerald-700">
													{String(item.workOrderNumber).slice(-8)}
												</span>
												<span className="text-[#5A615D]"> {t("current")}</span>
											</td>
											<td className="px-3 py-3">
												<div className="flex justify-end">
													{expandedRows.has(itemId) ? (
														<ChevronUp className="h-4 w-4 text-[#0F1912]" />
													) : (
														<ChevronDown className="h-4 w-4 text-[#0F1912]" />
													)}
												</div>
											</td>
										</tr>

										{expandedRows.has(itemId) && item.content?.length > 0 && (
											<tr>
												<td
													colSpan={4}
													className="border-t bg-white p-0">
													<table className="w-full">
														<thead className="bg-[#F8F9F8] text-xs text-[#5A615D] uppercase">
															<tr>
																<th className="px-3 py-2 font-normal">
																	{t("columns.workOrderNumber")}
																</th>
																<th className="px-3 py-2 font-normal">
																	{t("columns.description")}
																</th>
																<th className="px-3 py-2 font-normal">
																	{t("columns.content")}
																</th>
																<th className="w-10"></th>
															</tr>
														</thead>
														<tbody>
															{item.content.map((contentItem: any, idx: number) => (
																<tr
																	key={`${itemId}-${idx}`}
																	className="border-t align-top">
																	<td className="px-3 py-3 text-[#0F1912]">
																		<Cell
																			value={String(item.workOrderNumber)}
																			placeholder="Arbeidsordrenummer"
																			isEditMode={isEditMode}
																			searchable
																		/>
																	</td>

																	<td className="px-3 py-3">
																		<div className="text-[#0F1912]">
																			<Cell
																				value={item.description || ""}
																				placeholder="Beskrivelse"
																				isEditMode={isEditMode}
																			/>
																		</div>
																	</td>

																	<td className="px-3 py-3 text-[#0F1912]">
																		<Cell
																			value={JSON.stringify(contentItem, null, 2)}
																			placeholder="Content"
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
								);
							})}
						</tbody>
					</table>
				</div>
			</AccordionContent>
		</AccordionItem>
	);
};
