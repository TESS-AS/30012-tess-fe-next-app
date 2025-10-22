"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	name?: string;
	onConfirm: () => void;
};

export default function DeleteConfirmModal({
	open,
	onOpenChange,
	name,
	onConfirm,
}: Props) {
	const t = useTranslations("DimensionsDeleteModal");
	return (
		<Modal
			open={open}
			onOpenChange={onOpenChange}>
			<div className="space-y-6 p-6">
				<div className="flex justify-center">
					<Trash2 className="h-6 w-6 text-[#6B726F]" />
				</div>
				<div className="space-y-2 text-center">
					<p className="text-base text-[#5A615D]">
						{t("confirmMessage", { name: name || "" })}
					</p>
					<p className="text-base text-[#5A615D]">
						{t("warningMessage")}
					</p>
				</div>
				<div className="flex justify-center gap-3">
					<Button
						variant="outline"
						className="border-[#C1C4C2] text-[#0F1912] hover:bg-[#F3FAF7] hover:text-[#0F1912]"
						onClick={() => onOpenChange(false)}>
						{t("cancel")}
					</Button>
					<Button
						className="bg-[#C81E1E] text-white hover:bg-[#A01818]"
						onClick={onConfirm}>
						{t("confirm")}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
