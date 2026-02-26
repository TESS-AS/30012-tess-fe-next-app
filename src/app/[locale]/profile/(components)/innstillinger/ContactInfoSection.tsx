"use client";

import { Label } from "@/components/ui/label";
import { ProfileFormValues } from "@/lib/validation/profileSchema";
import { useTranslations } from "next-intl";
import { UseFormRegister } from "react-hook-form";

import { INNSTILLINGER_CLASSES } from "./constants";

const T_NAMESPACE = "ViewUserModal";

export interface ContactInfoSectionProps {
	register: UseFormRegister<ProfileFormValues>;
}

export function ContactInfoSection({ register }: ContactInfoSectionProps) {
	const t = useTranslations(T_NAMESPACE);
	return (
		<>
			<h2 className={INNSTILLINGER_CLASSES.heading}>{t("contactInfo")}</h2>
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div>
					<Label className={INNSTILLINGER_CLASSES.label}>
						{t("firstName")}
					</Label>
					<input
						{...register("firstName")}
						disabled
						className={INNSTILLINGER_CLASSES.inputDisabled}
					/>
				</div>
				<div>
					<Label className={INNSTILLINGER_CLASSES.label}>{t("lastName")}</Label>
					<input
						{...register("lastName")}
						disabled
						className={INNSTILLINGER_CLASSES.inputDisabled}
					/>
				</div>
				<div>
					<Label className={INNSTILLINGER_CLASSES.label}>{t("email")}</Label>
					<input
						{...register("email")}
						disabled
						className={INNSTILLINGER_CLASSES.inputDisabled}
					/>
				</div>
				<div>
					<Label className={INNSTILLINGER_CLASSES.label}>{t("phone")}</Label>
					<input
						{...register("phoneNumber")}
						disabled
						className={INNSTILLINGER_CLASSES.inputDisabled}
					/>
				</div>
			</div>
		</>
	);
}
