"use client";

import type { ReactNode } from "react";

import { renderWithEmailLinks } from "@/components/info-page";
import type { FaqCategory } from "@/components/info-page";
import { FAQ_PLACEHOLDERS, FAQ_URLS } from "@/constants/faq";
import { useTranslations } from "next-intl";

import { FaqExternalLink, FaqLoginLink } from "../components";

type FaqCategoryConfig = Omit<FaqCategory, "title"> & { titleKey: string };

/**
 * Builds FAQ categories with resolved content (login link, external link, email links).
 * Use in the FAQ page to keep the page component thin and content logic testable.
 */
export function useFaqCategories(onOpenLogin: () => void): FaqCategory[] {
	const t = useTranslations("Faq");

	const howToGetAccessContent = buildContentWithPlaceholder(
		t("answers.howToGetAccess"),
		FAQ_PLACEHOLDERS.LOGIN_LINK,
		<FaqLoginLink onClick={onOpenLogin}>{t("loginOrCreateUser")}</FaqLoginLink>,
	);

	const howToBecomeCustomerContent = buildContentWithKundeskjemaLink(t);

	const categories: FaqCategoryConfig[] = [
		{
			number: 1,
			titleKey: "1",
			items: [
				{
					q: t("questions.accountFromBefore"),
					a: t("answers.accountFromBefore"),
				},
				{ q: t("questions.howToGetAccess"), a: howToGetAccessContent },
				{
					q: t("questions.howToBecomeCustomer"),
					a: howToBecomeCustomerContent,
				},
				{ q: t("questions.forgotPassword"), a: t("answers.forgotPassword") },
				// { q: t("questions.wrongNameWhenRegistering"), a: t("answers.wrongNameWhenRegistering") },
			],
		},
		{
			number: 2,
			titleKey: "2",
			items: [
				{ q: t("questions.whyNoPrices"), a: t("answers.whyNoPrices") },
				{
					q: t("questions.agreementPricesInStore"),
					a: t("answers.agreementPricesInStore"),
				},
			],
		},
		{
			number: 3,
			titleKey: "3",
			items: [
				{
					q: t("questions.whereFindCatalog"),
					a: t("answers.whereFindCatalog"),
				},
				{ q: t("questions.missingProduct"), a: t("answers.missingProduct") },
				{ q: t("questions.specificProduct"), a: t("answers.specificProduct") },
				{
					q: t("questions.howToAddDeliveryAddresses"),
					a: t("answers.howToAddDeliveryAddresses"),
				},
			],
		},
		{
			number: 4,
			titleKey: "4",
			items: [
				{ q: t("questions.addToOrder"), a: t("answers.addToOrder") },
				// { q: t("questions.orderHistoryAndStatus"), a: t("answers.orderHistoryAndStatus") },
			],
		},
		{
			number: 5,
			titleKey: "5",
			items: [
				{ q: t("questions.delivery"), a: t("answers.delivery") },
				{ q: t("questions.openingHours"), a: t("answers.openingHours") },
				{ q: t("questions.contactErrors"), a: t("answers.contactErrors") },
				{ q: t("questions.notFound"), a: t("answers.notFound") },
			],
		},
	];

	return categories.map(({ titleKey, ...cat }) => ({
		...cat,
		title: t(`categories.${titleKey}`),
	}));
}

function buildContentWithPlaceholder(
	text: string,
	placeholder: string,
	replacement: ReactNode,
): ReactNode {
	const parts = text.split(placeholder);
	if (parts.length !== 2) return text;
	return (
		<span className="whitespace-pre-line">
			{parts[0]}
			{replacement}
			{parts[1]}
		</span>
	);
}

function buildContentWithKundeskjemaLink(
	t: ReturnType<typeof useTranslations<"Faq">>,
): ReactNode {
	const answer = t("answers.howToBecomeCustomer");
	const linkText = t("answers.howToBecomeCustomerLinkText");
	const parts = answer.split(FAQ_PLACEHOLDERS.KUNDESKJEMA_LINK);
	if (parts.length !== 2) {
		return renderWithEmailLinks(answer);
	}
	return (
		<span className="whitespace-pre-line">
			{renderWithEmailLinks(parts[0])}
			<FaqExternalLink href={FAQ_URLS.BLI_KUNDE}>{linkText}</FaqExternalLink>
			{renderWithEmailLinks(parts[1])}
		</span>
	);
}
