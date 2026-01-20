"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";

import type { BulkEditChanges } from "./bulk-edit-confirmation-modal";

interface ConfirmChangesModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (changes: BulkEditChanges | null) => void;
	userCount: number;
	bulkChanges: BulkEditChanges | null;
}

export function ConfirmChangesModal({
	open,
	onOpenChange,
	onConfirm,
	userCount,
	bulkChanges,
}: ConfirmChangesModalProps) {
	const t = useTranslations("ConfirmChangesModal");

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent className="max-w-[600px] p-8">
				<DialogHeader>
					<DialogTitle className="text-2xl font-semibold text-[#0F1912]">
						{t("title")}
					</DialogTitle>
				</DialogHeader>

				<div className="py-3">
					<p className="text-base font-medium text-[#5A615D]">
						{t("description", { count: userCount })}
					</p>
				</div>

				<div className="flex justify-start gap-4">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}>
						{t("cancel")}
					</Button>
					<Button
						variant="greenSolid"
						onClick={() => {
							onConfirm(bulkChanges);
							onOpenChange(false);
						}}>
						{t("confirm")}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
