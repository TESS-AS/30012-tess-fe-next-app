import { ReactNode } from "react";

import { Footer } from "@/components/layouts/Footer/Footer";
import Main from "@/components/layouts/Main/Main";
import { AuthProvider } from "@/lib/providers/AuthProvider";
import { CartProvider } from "@/lib/providers/CartProvider";
import { getSeoMetadata } from "@/lib/seo";
import { mapCategoryTree } from "@/lib/utils";
import axiosServer from "@/services/axiosServer";
import type { Category, RawCategory } from "@/types/categories.types";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "../globals.css";
import { ToastContainer } from "react-toastify";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	return getSeoMetadata({ locale });
}

export default async function RootLayout({
	children,
}: {
	children: ReactNode;
	params: { locale: string };
}) {
	const locale = await getLocale();
	console.log(locale,"qokla locale")
	const messages = await getMessages();
	const supportedLocales = ["en", "no"];

	if (!supportedLocales.includes(locale)) {
		notFound();
	}

	let categories: Category[] = [];
	try {
		console.log('Fetching categories for locale:', locale);
		console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
		const res = await axiosServer.get(`/categories/${locale}`);
		const raw: RawCategory[] = res.data;
		categories = raw.map((node) => mapCategoryTree(node, locale));
	} catch (error) {
		console.error('Error fetching categories:', error);
		// Provide empty categories array instead of failing
		categories = [];
	}

	return (
		<html lang={locale ?? "no"}>
			<body>
				<NextIntlClientProvider
					locale={locale}
					messages={messages}>
					<AuthProvider>
						<CartProvider>
							<ToastContainer
								position="top-right"
								autoClose={5000}
								hideProgressBar
								newestOnTop
								closeOnClick
								rtl={false}
								pauseOnFocusLoss
								draggable
								pauseOnHover
							/>
							<Main categories={categories}>
								{children}
							<Footer />
							</Main>
						</CartProvider>
					</AuthProvider>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
