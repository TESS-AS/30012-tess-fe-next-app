"use client";

import { Button } from "@/components/ui/button";
import { Modal, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { useTranslations } from "next-intl";

interface DeleteUserModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	userName?: string;
}

export function DeleteUserModal({
	open,
	onOpenChange,
	onConfirm,
	userName,
}: DeleteUserModalProps) {
	const t = useTranslations("DeleteUserModal");

	const handleConfirm = () => {
		onConfirm();
		onOpenChange(false);
	};

	return (
		<Modal
			open={open}
			onOpenChange={onOpenChange}
			className="max-w-[400px]">
			<div className="space-y-4">
				<ModalHeader>
					<ModalTitle className="text-xl font-semibold">
						{t("title")}
					</ModalTitle>
				</ModalHeader>

				<div className="space-y-3 pb-2">
					<p className="text-sm text-[#5A615D]">{t("message")}</p>
					<p className="text-sm text-[#5A615D]">{t("warning")}</p>
				</div>

				<div className="flex justify-start gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						className="border-[#C1C4C2]">
						{t("cancel")}
					</Button>
					<Button
						type="button"
						onClick={handleConfirm}
						className="bg-[#B42318] hover:bg-[#912018]">
						{t("confirm")}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
