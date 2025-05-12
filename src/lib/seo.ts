import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function getSeoMetadata({
	title,
	description,
	path = "/",
	image,
	locale = "en",
}: {
	title?: string;
	description?: string;
	path?: string;
	image?: string;
	locale?: string;
}): Promise<Metadata> {
	const t = await getTranslations({ locale, namespace: "Seo" });

	const resolvedTitle = title ?? t("defaultTitle");
	const resolvedDescription = description ?? t("defaultDescription");
	const resolvedImage = image ?? `${baseUrl}/og-${locale}.jpg`;
	const url = `${baseUrl}/${locale}${path}`;

	return {
		title: resolvedTitle,
		description: resolvedDescription,
		alternates: {
			canonical: url,
		},
		openGraph: {
			title: resolvedTitle,
			description: resolvedDescription,
			url,
			siteName: "Tess",
			locale: locale.replace("-", "_"),
			type: "website",
			images: [{ url: resolvedImage }],
		},
	};
}
