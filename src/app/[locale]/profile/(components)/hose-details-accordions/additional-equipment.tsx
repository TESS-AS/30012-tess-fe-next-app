import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

import { Cell } from "./cell";

export const AdditionalEquipmentAccordion = ({
	isEditMode,
}: {
	isEditMode: boolean;
}) => {
	return (
		<AccordionItem
			value="tilleggsutstyr"
			className="border-none">
			<AccordionTrigger className="text-decoration-none cursor-pointer rounded-none border-b border-[#C1C4C2] p-4 px-0 text-lg font-bold text-[#0F1912] hover:no-underline">
				Tilleggsutstyr på slangen
			</AccordionTrigger>
			<AccordionContent className="p-0">
				<div className="flex">
					<table className="w-1/2 border-r border-[#E8EAE9] text-sm">
						<tbody>
							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">Tillegg A ende 1</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Tillegg A ende 1"
										isEditMode={isEditMode}
										value="—"
									/>
								</td>
							</tr>
							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">Tillegg B ende 1</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Tillegg B ende 1"
										isEditMode={isEditMode}
										value="—"
									/>
								</td>
							</tr>
							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">Tillegg C ende 1</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Tillegg C ende 1"
										isEditMode={isEditMode}
										value="—"
									/>
								</td>
							</tr>
							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">Tillegg D ende 1</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Tillegg D ende 1"
										isEditMode={isEditMode}
										value="—"
									/>
								</td>
							</tr>
							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">Tillegg E ende 1</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Tillegg E ende 1"
										isEditMode={isEditMode}
										value="—"
									/>
								</td>
							</tr>
							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">Slangetrommel</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Slangetrommel"
										isEditMode={isEditMode}
										value="—"
									/>
								</td>
							</tr>
							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">Spiralvern</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Spiralvern"
										isEditMode={isEditMode}
										value="—"
									/>
								</td>
							</tr>
							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">Slangebeskyttelse</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Slangebeskyttelse"
										isEditMode={isEditMode}
										value="—"
									/>
								</td>
							</tr>
						</tbody>
					</table>

					<table className="w-1/2 text-sm">
						<tbody>
							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">Tillegg A ende 2</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Tillegg A ende 2"
										isEditMode={isEditMode}
										value="—"
									/>
								</td>
							</tr>
							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">Tillegg B ende 2</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Tillegg B ende 2"
										isEditMode={isEditMode}
										value="—"
									/>
								</td>
							</tr>
							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">Tillegg C ende 2</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Tillegg C ende 2"
										isEditMode={isEditMode}
										value="—"
									/>
								</td>
							</tr>
							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">Tillegg D ende 2</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Tillegg D ende 2"
										isEditMode={isEditMode}
										value="—"
									/>
								</td>
							</tr>
							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">Tillegg E ende 2</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Tillegg E ende 2"
										isEditMode={isEditMode}
										value="—"
									/>
								</td>
							</tr>
							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">Krok (Hookie)</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Krok (Hookie)"
										isEditMode={isEditMode}
										value="—"
									/>
								</td>
							</tr>
							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">
									Sikkerhetswire (whipcheck)
								</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Sikkerhetswire (whipcheck)"
										isEditMode={isEditMode}
										value="—"
									/>
								</td>
							</tr>
							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">
									Nødkobling / bruddkobling
								</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Nødkobling / bruddkobling"
										isEditMode={isEditMode}
										value="—"
									/>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</AccordionContent>
		</AccordionItem>
	);
};
