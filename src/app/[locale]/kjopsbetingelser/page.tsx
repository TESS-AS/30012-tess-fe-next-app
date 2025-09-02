"use client";

import { InfoPage } from "@/components/info-page";
import { useTranslations } from "next-intl";

export default function KjopsbetingelserPage() {
	const t = useTranslations("Kjopsbetingelser");

	const items = [
		{
			q: t("sections.customerTerms.title"),
			a: t("sections.customerTerms.content"),
		},
		{ q: t("sections.salesTerms.title"), a: t("sections.salesTerms.content") },
		{ q: t("sections.deliveries.title"), a: t("sections.deliveries.content") },
		{ q: t("sections.ownership.title"), a: t("sections.ownership.content") },
		{ q: t("sections.returns.title"), a: t("sections.returns.content") },
		{ q: t("sections.payment.title"), a: t("sections.payment.content") },
		{ q: t("sections.disclaimer.title"), a: t("sections.disclaimer.content") },
		{
			q: t("sections.form.title"),
			a: t.rich("sections.form.content", {
				link: (chunks) => (
					<a
						href="/angrerett"
						className="text-green-700 underline">
						{chunks}
					</a>
				),
			}),
		},
	];

	return (
		<InfoPage
			title={t("title")}
			items={items}
		/>
	);
}
