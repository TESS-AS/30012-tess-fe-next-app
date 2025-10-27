import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import type { GetAssetsResponse } from "@/types/assets.types";
import { useTranslations } from "next-intl";

import { Cell } from "./cell";

interface Props {
	isEditMode: boolean;
	hoseDetails: GetAssetsResponse | null;
}

export const OtherDetailsAccordion = ({ isEditMode, hoseDetails }: Props) => {
	const customerData = hoseDetails?.customerData;
	const t = useTranslations("OtherDetailsAccordion");
	return (
		<AccordionItem
			value="andre-detaljer"
			className="border-none">
			<AccordionTrigger className="text-decoration-none cursor-pointer rounded-none border-b border-[#C1C4C2] p-4 px-0 text-lg font-bold text-[#0F1912] hover:no-underline">
				{t("title")}
			</AccordionTrigger>
			<AccordionContent className="p-0">
				<table className="w-[50%] border-r border-[#E8EAE9] text-sm">
					<tbody>
						<tr className="bg-[#F8F9F8]">
							<td className="px-4 py-3 text-[#5A615D]">Kunde-ID nr.</td>
							<td className="px-4 py-3 text-[#0F1912]">
								<Cell
									value={hoseDetails?.hoseLine?.customerId?.toString() || "—"}
									placeholder="Kunde-ID (Individual/SAP/SFI/MMS)"
									searchable
									isEditMode={isEditMode}
								/>
							</td>
						</tr>

						<tr className="bg-white">
							<td className="px-4 py-3 text-[#5A615D]">Utstyrsdel</td>
							<td className="px-4 py-3 text-[#0F1912]">
								<Cell
									value={hoseDetails?.hoseLine?.equipmentSubunit || "—"}
									placeholder="Utstyrsdel"
									isEditMode={isEditMode}
								/>
							</td>
						</tr>

						<tr className="bg-[#F8F9F8]">
							<td className="px-4 py-3 text-[#5A615D]">Annen utstyrsinfo</td>
							<td className="px-4 py-3 text-[#0F1912]">
								<Cell
									value="Lifeboat Davit Port"
									placeholder="Annen utstyrsinfo"
									isEditMode={isEditMode}
								/>
							</td>
						</tr>

						<tr className="bg-white">
							<td className="px-4 py-3 text-[#5A615D]">Tegningsnummer</td>
							<td className="px-4 py-3 text-[#0F1912]">
								<Cell
									value={customerData?.drawingNumber || "—"}
									placeholder="Tegningsnummer"
									isEditMode={isEditMode}
								/>
							</td>
						</tr>

						<tr className="bg-[#F8F9F8]">
							<td className="px-4 py-3 text-[#5A615D]">Pos.nr. på tegning</td>
							<td className="px-4 py-3 text-[#0F1912]">
								<Cell
									value={customerData?.posNumber || "—"}
									placeholder="Pos.nr. på tegning"
									isEditMode={isEditMode}
								/>
							</td>
						</tr>

						<tr className="bg-white">
							<td className="px-4 py-3 text-[#5A615D]">
								Artikkelnummer i tegning
							</td>
							<td className="px-4 py-3 text-[#0F1912]">
								<Cell
									value={customerData?.artNumber || "—"}
									placeholder="Artikkelnummer i tegning"
									isEditMode={isEditMode}
								/>
							</td>
						</tr>

						<tr className="bg-[#F8F9F8]">
							<td className="px-4 py-3 text-[#5A615D]">Pinpricket</td>
							<td className="px-4 py-3 text-[#0F1912]">
								<Cell
									value={hoseDetails?.hoseData?.pinPricked ? "Yes" : "No"}
									placeholder="Yes/No"
									isEditMode={isEditMode}
								/>
							</td>
						</tr>

						<tr className="bg-white">
							<td className="px-4 py-3 text-[#5A615D]">
								Forurensningseksponering
							</td>
							<td className="px-4 py-3 text-[#0F1912]">
								<Cell
									value={customerData?.pollutionExposure || "—"}
									placeholder="Eksponering (f.eks. Internal, not exposed)"
									isEditMode={isEditMode}
								/>
							</td>
						</tr>

						<tr className="bg-[#F8F9F8]">
							<td className="px-4 py-3 text-[#5A615D]">UV-eksponering</td>
							<td className="px-4 py-3 text-[#0F1912]">
								<Cell
									value={customerData?.uxExposure || "—"}
									placeholder="UV-eksponering"
									isEditMode={isEditMode}
								/>
							</td>
						</tr>

						<tr className="bg-white">
							<td className="px-4 py-3 text-[#5A615D]">
								Utskiftingskompleksitet
							</td>
							<td className="px-4 py-3 text-[#0F1912]">
								<Cell
									value="Rope Access / scaffolding"
									placeholder="Utskiftingskompleksitet"
									isEditMode={isEditMode}
								/>
							</td>
						</tr>

						<tr className="bg-[#F8F9F8]">
							<td className="px-4 py-3 text-[#5A615D]">Utskiftingskommentar</td>
							<td className="px-4 py-3 text-[#0F1912]">
								<Cell
									value="—"
									placeholder="Legg til kommentar"
									isEditMode={isEditMode}
								/>
							</td>
						</tr>
					</tbody>
				</table>
			</AccordionContent>
		</AccordionItem>
	);
};
