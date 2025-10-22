"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { PillSwitcher } from "@/components/ui/pill-switcher";
import { FileText, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface ProductDetailsModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function ProductDetailsModal({
	isOpen,
	onClose,
}: ProductDetailsModalProps) {
	const t = useTranslations("ProductDetailsModal");
	const [activeTab, setActiveTab] = useState<"beskrivelse" | "produktdetaljer">(
		"produktdetaljer",
	);
	return (
		<Dialog
			open={isOpen}
			onOpenChange={onClose}>
			<DialogContent className="max-w-[600px] p-5">
				<DialogHeader className="space-y-4">
					<DialogTitle className="text-lg font-[500] text-[#0F1912]">
						{t("title")}
					</DialogTitle>

					<div className="flex items-start justify-between gap-4">
						<h2 className="text-xl leading-tight font-bold text-[#0F1912]">
							Hydraulisk slange SAE 100R1AT
						</h2>
						<Button
							variant="ghost"
							size="icon"
							className="shrink-0 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700">
							<FileText className="h-6 w-6" />
						</Button>
					</div>
				</DialogHeader>

				<div className="space-y-6">
					<div className="flex items-center gap-3">
						<PillSwitcher
							options={[
								{ label: t("description"), value: "beskrivelse" },
								{ label: t("productDetails"), value: "produktdetaljer" },
							]}
							value={activeTab}
							onChange={setActiveTab}
							variant="pill"
						/>
						<div className="ml-auto rounded-md px-4 py-2">
							<span className="text-sm text-[#0F1912]">
								GTIN: 7333123009920
							</span>
						</div>
					</div>

					<div className="space-y-3">
						<div>
							<span className="font-semibold text-[#0F1912]">{t("insert")}: </span>
							<span className="text-[#0F1912]">2 lag stålfletting</span>
						</div>
						<div>
							<span className="font-semibold text-[#0F1912]">{t("inner")}: </span>
							<span className="text-[#0F1912]">
								Oljebestandig syntetisk gummi
							</span>
						</div>
						<div>
							<span className="font-semibold text-[#0F1912]">{t("marking")}: </span>
							<span className="text-[#0F1912]">
								Rockmaster 2SN- EN 853 2 SN- DIM-WP
							</span>
						</div>
						<div>
							<span className="font-semibold text-[#0F1912]">
								{t("temperature")}{" "}
							</span>
							<span className="text-[#0F1912]">-40 - 100</span>
						</div>
						<div>
							<span className="font-semibold text-[#0F1912]">{t("outer")}: </span>
							<span className="text-[#0F1912]">Slitesterk syntetisk gummi</span>
						</div>
					</div>

					<Button
						variant="default"
						onClick={onClose}
						className="w-full bg-[#009640]">
						{t("closeWindow")}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
