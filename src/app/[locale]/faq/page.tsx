"use client";
import { InfoPage } from "@/components/info-page";
import { useTranslations } from "next-intl";

export default function FaqPage() {
	const t = useTranslations("Faq");

	const faqItems = [
		{ q: t("questions.openingHours"), a: t("answers.openingHours") },
		{ q: t("questions.delivery"), a: t("answers.delivery") },
		{ q: t("questions.forgotPassword"), a: t("answers.forgotPassword") },
		{ q: t("questions.addToOrder"), a: t("answers.addToOrder") },
		{ q: t("questions.notFound"), a: t("answers.notFound") },
		{ q: t("questions.missingProduct"), a: t("answers.missingProduct") },
		{ q: t("questions.contactErrors"), a: t("answers.contactErrors") },
		{ q: t("questions.specificProduct"), a: t("answers.specificProduct") },
	];

	return (
		<InfoPage
			title={t("title")}
			items={faqItems}
			withFeedback
		/>
	);
}
