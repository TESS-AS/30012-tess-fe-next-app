import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslations } from "next-intl";

import { Cell } from "./cell";

export const S2EquipmentsAccordion = ({
	isEditMode,
}: {
	isEditMode: boolean;
}) => {
	const t = useTranslations("S2EquipmentsAccordion");
	return (
		<AccordionItem
			value="s2-utstyr"
			className="border-none">
			<AccordionTrigger className="text-decoration-none cursor-pointer rounded-none border-b border-[#C1C4C2] p-4 px-0 text-lg font-bold text-[#0F1912] hover:no-underline">
				{t("title")}
			</AccordionTrigger>
			<AccordionContent className="p-0">
				<table className="w-full text-sm">
					<tbody>
						<tr className="bg-[#F8F9F8]">
							<td className="px-4 py-3 text-[#5A615D]">S2-utstyr</td>
							<td className="px-4 py-3 text-[#0F1912]">
								<Cell
									value="Deck crane port side"
									placeholder="Angi S2-utstyr"
									isEditMode={isEditMode}
								/>
							</td>
						</tr>

						<tr className="bg-white">
							<td className="px-4 py-3 text-[#5A615D]">Kundeutstyr nr</td>
							<td className="px-4 py-3 text-[#0F1912]">
								<Cell
									value="4521-39.80"
									placeholder="Kundeutstyr nr"
									isEditMode={isEditMode}
								/>
							</td>
						</tr>

						<tr className="bg-[#F8F9F8]">
							<td className="px-4 py-3 text-[#5A615D]">System WP (BAR)</td>
							<td className="px-4 py-3 text-[#0F1912]">
								<Cell
									value="—"
									placeholder="System WP (BAR)"
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
