import React, { useState } from "react";

import { User2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Modal, ModalTitle } from "../ui/modal";

interface ContactFormData {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
}

interface EditContactModalProps {
	open: boolean;
	onClose: () => void;
	onSave: (data: ContactFormData) => void;
	initialData?: ContactFormData;
}

export const EditContactModal: React.FC<EditContactModalProps> = ({
	open,
	onClose,
	onSave,
	initialData,
}) => {
	const t = useTranslations("Checkout.modals.contact");
	const tContact = useTranslations("Checkout.contactPerson");
	const [formData, setFormData] = useState<ContactFormData>(
		initialData || {
			firstName: "",
			lastName: "",
			email: "",
			phone: "",
		},
	);

	const phoneMissing = !formData.phone?.trim();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSave = () => {
		if (phoneMissing) return;
		onSave(formData);
		onClose();
	};

	return (
		<Modal
			open={open}
			onOpenChange={onClose}>
			<div className="mb-6 flex items-center gap-2">
				<User2 className="h-5 w-5" />
				<ModalTitle className="text-xl font-semibold">{t("title")}</ModalTitle>
			</div>

			<div className="space-y-4">
				<div>
					<Label htmlFor="firstName">{t("firstName")}</Label>
					<Input
						id="firstName"
						name="firstName"
						value={formData.firstName}
						onChange={handleChange}
					/>
				</div>
				<div>
					<Label htmlFor="lastName">{t("lastName")}</Label>
					<Input
						id="lastName"
						name="lastName"
						value={formData.lastName}
						onChange={handleChange}
					/>
				</div>
				<div>
					<Label htmlFor="email">{t("email")}</Label>
					<Input
						id="email"
						name="email"
						type="email"
						value={formData.email}
						onChange={handleChange}
						disabled
					/>
					<p className="text-muted-foreground mt-1 text-xs">
						Eksempel: navn@navnesen.no
					</p>
				</div>
				<div>
					<Label
						htmlFor="phone"
						className={phoneMissing ? "text-[#C81E1E]" : undefined}>
						{t("phone")}
						{phoneMissing && <span className="ml-1">*</span>}
					</Label>
					<Input
						id="phone"
						name="phone"
						value={formData.phone}
						onChange={handleChange}
						aria-invalid={phoneMissing || undefined}
						className={
							phoneMissing
								? "border-[#C81E1E] focus-visible:border-[#C81E1E] focus-visible:ring-[#C81E1E]"
								: undefined
						}
					/>
					<p
						className={`mt-1 text-xs ${
							phoneMissing
								? "font-medium text-[#C81E1E]"
								: "text-muted-foreground"
						}`}>
						{phoneMissing ? tContact("phoneMissing") : "Eksempel: +47 123 45 678"}
					</p>
				</div>
			</div>

			<div className="mt-8 flex justify-between">
				<Button
					variant="outline"
					onClick={onClose}>
					{t("cancel")}
				</Button>
				<Button
					variant="greenSolid"
					onClick={handleSave}
					disabled={phoneMissing}>
					{t("save")}
				</Button>
			</div>
		</Modal>
	);
};
