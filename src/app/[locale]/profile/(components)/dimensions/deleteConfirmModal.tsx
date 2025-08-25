"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Trash2 } from "lucide-react";

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
						Er du sikker på at du vil slette &quot;{name}&quot;?
					</p>
					<p className="text-base text-[#5A615D]">
						Dette vil også slette alle underliggende elementer.
					</p>
				</div>
				<div className="flex justify-center gap-3">
					<Button
						variant="outline"
						className="border-[#C1C4C2] text-[#0F1912] hover:bg-[#F3FAF7] hover:text-[#0F1912]"
						onClick={() => onOpenChange(false)}>
						Nei, avbryt
					</Button>
					<Button
						className="bg-[#C81E1E] text-white hover:bg-[#A01818]"
						onClick={onConfirm}>
						Ja, jeg er sikker
					</Button>
				</div>
			</div>
		</Modal>
	);
}
