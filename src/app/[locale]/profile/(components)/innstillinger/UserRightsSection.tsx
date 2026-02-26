"use client";

import { useTranslations } from "next-intl";

import { INNSTILLINGER_CLASSES } from "./constants";
import type { ProfileRoleKey } from "./constants";

const T_NAMESPACE = "InnstillingerTab";

export interface UserRightsSectionProps {
	roleKey: ProfileRoleKey;
}

export function UserRightsSection({ roleKey }: UserRightsSectionProps) {
	const t = useTranslations(T_NAMESPACE);
	return (
		<div className={INNSTILLINGER_CLASSES.sectionBorder}>
			<h2 className="mb-2 text-xl font-semibold text-[#0F1912]">
				{t("userRights")}
			</h2>
			<p className="mb-1 text-sm font-medium text-[#0F1912]">
				{t("yourRole")}{" "}
				<span className="font-semibold">{t(`roleLabel.${roleKey}`)}</span>
			</p>
			<p className="text-sm text-[#5A615D]">
				{t(`roleDescription.${roleKey}`)}
			</p>
		</div>
	);
}
