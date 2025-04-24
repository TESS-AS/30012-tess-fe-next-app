import { ReactNode } from "react";

import Main from "@/components/layouts/Main/Main";
import { mapCategoryTree } from "@/lib/utils";
import axiosServer from "@/services/axiosServer";
import type { Category, RawCategory } from "@/types/categories.types";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "../globals.css";

export default async function RootLayout({
	children,
}: {
	children: ReactNode;
	params: { locale: string };
}) {
	const messages = await getMessages();
	const locale = await getLocale();
	const supportedLocales = ["en", "no"];

	if (!supportedLocales.includes(locale)) {
		notFound();
	}

	const res = await axiosServer.get(`/categories/${locale}`);
	const raw: RawCategory[] = res.data;
	const categories: Category[] = raw.map((node) =>
		mapCategoryTree(node, locale),
	);

	return (
		<html lang={locale}>
			<body className="overflow-hidden">
				<NextIntlClientProvider
					locale={locale}
					messages={messages}>
					<Main categories={categories}>{children}</Main>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
