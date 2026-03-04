"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";

interface RejectOrderChangeModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
}

export function RejectOrderChangeModal({
	open,
	onOpenChange,
	onConfirm,
}: RejectOrderChangeModalProps) {
	const t = useTranslations("RejectOrderChangeModal");

	const handleConfirm = () => {
		onConfirm();
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-[400px] p-8">
				<DialogHeader>
					<DialogTitle className="text-2xl font-semibold text-[#0F1912]">
						{t("title")}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 py-3">
					<p className="text-base text-[#5A615D]">{t("message")}</p>
				</div>

				<div className="flex justify-start gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						className="border-[#C1C4C2]">
						{t("cancel")}
					</Button>
					<Button type="button" variant="reject" onClick={handleConfirm}>
						{t("confirm")}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

interface ApproveOrderChangeModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	orderId: string;
}

export function ApproveOrderChangeModal({
	open,
	onOpenChange,
	onConfirm,
	orderId,
}: ApproveOrderChangeModalProps) {
	const t = useTranslations("ApproveOrderChangeModal");

	const handleConfirm = () => {
		onConfirm();
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-[400px] p-8">
				<DialogHeader>
					<DialogTitle className="text-2xl font-semibold text-[#0F1912]">
						{t("title")}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 py-3">
					<p className="text-base text-[#5A615D]">
						{t("message", { orderId })}
					</p>
				</div>

				<div className="flex justify-start gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						className="border-[#C1C4C2]">
						{t("cancel")}
					</Button>
					<Button type="button" variant="approve" onClick={handleConfirm}>
						{t("confirm")}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
