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

export const InspectionsAccordion = ({ isEditMode, hoseDetails }: Props) => {
	const maintenanceDetails = hoseDetails?.maintenanceDetails;
	const t = useTranslations("InspectionsAccordion");
	return (
		<AccordionItem
			value="inspeksjon"
			className="border-none">
			<AccordionTrigger className="text-decoration-none cursor-pointer rounded-none border-b border-[#C1C4C2] p-4 px-0 text-lg font-bold text-[#0F1912] hover:no-underline">
				{t("title")}
			</AccordionTrigger>
			<AccordionContent className="p-0">
				<table className="w-[50%] border-r border-[#E8EAE9] text-sm">
					<tbody>
						<tr className="bg-[#F8F9F8]">
							<td className="px-4 py-3 text-[#5A615D]">Tilstand</td>
							<td className="px-4 py-3 text-[#0F1912]">
								<Cell
									value={maintenanceDetails?.hoseCondition || "—"}
									placeholder="Beskriv tilstanden"
									isEditMode={isEditMode}
								/>
							</td>
						</tr>

						<tr className="bg-white">
							<td className="px-4 py-3 text-[#5A615D]">Godkjent</td>
							<td className="px-4 py-3 text-[#0F1912]">
								<Cell
									value={maintenanceDetails?.approved ? "YES" : "NO"}
									placeholder="YES / NO"
									isEditMode={isEditMode}
								/>
							</td>
						</tr>

						<tr className="bg-[#F8F9F8]">
							<td className="px-4 py-3 text-[#5A615D]">Kommentar</td>
							<td className="px-4 py-3 text-[#0F1912]">
								<Cell
									value={maintenanceDetails?.inspectionComment || "—"}
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
