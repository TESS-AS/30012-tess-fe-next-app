import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Cell } from "./cell";

interface Props {
	documents: { id: string; name: string; url?: string }[];
	isEditMode: boolean;
}

export const DocumentsAccordion = ({ documents, isEditMode }: Props) => {
	const t = useTranslations("DocumentsAccordion");
	return (
		<AccordionItem
			value="dokumenter"
			className="border-none">
			<AccordionTrigger className="text-decoration-none cursor-pointer rounded-none border-b border-[#C1C4C2] p-4 px-0 text-lg font-bold text-[#0F1912] hover:no-underline">
				{t("title")}
			</AccordionTrigger>
			<AccordionContent className="p-0 pt-4">
				<div className="space-y-4">
					{documents.map((d) => (
						<div
							key={d.id}
							className="flex items-center gap-3 text-emerald-700">
							<FileText className="h-5 w-5 text-[#003D1A]" />
							{isEditMode ? (
								<Cell
									value={d.name}
									placeholder="Navn på dokument"
									isEditMode={isEditMode}
								/>
							) : (
								<Link
									href={d.url || "#"}
									target="_blank"
									rel="noopener noreferrer"
									className="underline underline-offset-3">
									{d.name}
								</Link>
							)}
						</div>
					))}

					{isEditMode && (
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="mt-2 flex items-center gap-2 text-sm text-[#003D1A]">
							<Plus className="h-4 w-4" />
							{t("addDocument")}
						</Button>
					)}
				</div>
			</AccordionContent>
		</AccordionItem>
	);
};
