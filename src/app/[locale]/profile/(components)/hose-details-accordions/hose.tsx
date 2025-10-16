import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

import { Cell } from "./cell";

interface Props {
	isEditMode: boolean;
	setIsProductModalOpen: (isOpen: boolean) => void;
}

export const HoseAccordion = ({ isEditMode, setIsProductModalOpen }: Props) => {
	return (
		<AccordionItem
			value="slange"
			className="border-none">
			<AccordionTrigger className="text-decoration-none cursor-pointer rounded-none border-b border-[#C1C4C2] p-4 px-0 text-lg font-bold text-[#0F1912] hover:no-underline">
				Slange
			</AccordionTrigger>
			<AccordionContent className="p-0">
				<div className="flex">
					<table className="w-1/2 border-r border-[#E8EAE9] text-sm">
						<tbody>
							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">POS ID:</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										value="2343052"
										searchable
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">Beskrivelse</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										value="5256-08 × 1000 mm"
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">Lengde (mm)</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										value="1000"
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">Arbeidstrykk (BAR)</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										value="12500-04"
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">Arbeidstrykk (PSI)</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										value="—"
										placeholder="PSI"
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">Slangetype</td>
								<td className="px-4 py-3 text-[#0F1912]">
									{isEditMode ? (
										<Cell
											value="5256-08"
											searchable
											isEditMode={isEditMode}
										/>
									) : (
										<div className="flex items-center justify-between">
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<span className="cursor-default">5256-08</span>
													</TooltipTrigger>
													<TooltipContent
														side="top"
														className="bg-[#1F2421] p-3 text-white">
														<div className="space-y-1">
															<p className="font-semibold">12500-04</p>
															<p className="text-sm">TEFLONHOSE 1/4&quot;</p>
															<p className="text-sm">TYPE AFX</p>
														</div>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
											<Button
												variant="outline"
												size="sm"
												onClick={() => setIsProductModalOpen(true)}
												className="flex items-center gap-1 text-xs">
												<Info className="h-4 w-4" />
												Se detaljer
											</Button>
										</div>
									)}
								</td>
							</tr>

							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">Klasse</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										value="Høytrykksslange"
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">Hylse 1</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										value="65125-08"
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">Hylse 2</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										value="65125-08"
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">Innstikk 1</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										value="6505-08-08"
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">Innstikk 2</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										value="6501-08"
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">
									Koblingsorientering
								</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										value="0°"
										placeholder="0°"
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">Priklet</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										value="Nei"
										placeholder="Ja/Nei"
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">
									Medium / temperatur
								</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Angi medium / temperatur"
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">Funksjon</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Angi funksjon"
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">Slangegaranti</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										value="Nei"
										placeholder="Ja/Nei"
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">
									Kommentar til garanti
								</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Legg til kommentar"
										isEditMode={isEditMode}
									/>
								</td>
							</tr>
						</tbody>
					</table>

					<table className="w-1/2 text-sm">
						<tbody>
							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">RFID</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="RFID"
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">
									Generisk slangetype
								</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Angi generisk slangetype"
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">
									Type kobling ende 1
								</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Angi kobling (ende 1)"
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">
									Generisk dim ende 1
								</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Dimensjon (ende 1)"
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">Kjønn ende 1</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Hann/ Hunn"
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">Vinkel ende 1</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Vinkel (ende 1)"
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">
									Materialkvalitet ende 1
								</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Materiale (ende 1)"
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">
									Type kobling ende 2
								</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Angi kobling (ende 2)"
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">
									Generisk dim ende 2
								</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Dimensjon (ende 2)"
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">Kjønn ende 2</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Hann/ Hunn"
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">Vinkel ende 2</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Vinkel (ende 2)"
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">
									Materialkvalitet ende 2
								</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Materiale (ende 2)"
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">
									Generell kommentar (PTC)
								</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Legg til kommentar"
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">
									Kommentar ende 1 (PTC)
								</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Kommentar for ende 1"
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">
									Kommentar ende 2 (PTC)
								</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Kommentar for ende 2"
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">Tilleggskommentar</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Tilleggsinfo"
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">
									Opprinnelig slangekommentar
								</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder="Opprinnelig kommentar"
										isEditMode={isEditMode}
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
