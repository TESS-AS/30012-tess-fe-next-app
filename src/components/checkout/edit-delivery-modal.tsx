import React from "react";

import { Truck } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Modal, ModalTitle } from "../ui/modal";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

interface EditDeliveryModalProps {
	open: boolean;
	onClose: () => void;
	onSave: (data: any) => void;
	initialData?: {
		method: "address" | "pickup";
	};
}

export const EditDeliveryModal: React.FC<EditDeliveryModalProps> = ({
	open,
	onClose,
	onSave,
	initialData,
}) => {
	const t = useTranslations("Checkout.modals.delivery");
	return (
		<Modal
			open={open}
			onOpenChange={onClose}>
			<div className="mb-6 flex items-center gap-2">
				<Truck className="h-5 w-5" />
				<ModalTitle className="text-xl font-semibold">{t("title")}</ModalTitle>
			</div>

			<div className="space-y-4">
				<RadioGroup defaultValue={initialData?.method || "address"}>
					<div className="flex items-center space-x-2">
						<RadioGroupItem
							value="address"
							id="address"
						/>
						<Label htmlFor="address">
							<div className="flex flex-col">
								<span className="font-medium">{t("addressDelivery")}</span>
								<span className="text-sm text-[#5A615D]">
									{t("estimatedTime")}
								</span>
							</div>
						</Label>
					</div>
				</RadioGroup>
			</div>

			<div className="mt-8 flex justify-between">
				<Button
					variant="outline"
					onClick={onClose}>
					{t("cancel")}
				</Button>
				<Button
					variant="greenSolid"
					onClick={() => onSave(initialData)}>
					{t("save")}
				</Button>
			</div>
		</Modal>
	);
};
