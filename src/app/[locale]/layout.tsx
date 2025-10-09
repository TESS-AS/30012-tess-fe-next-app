import { ReactNode } from "react";

import { Footer } from "@/components/layouts/Footer/Footer";
import Main from "@/components/layouts/Main/Main";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { AppContextProvider } from "@/lib/appContext";
import { CategoriesProvider } from "@/lib/CategoriesProvider";
import { AuthProvider } from "@/lib/providers/AuthProvider";
import { getSeoMetadata } from "@/lib/seo";
import { QueryProvider } from "@/providers/QueryProvider";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { ToastContainer } from "react-toastify";

import "../globals.css";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	return getSeoMetadata({ locale });
}

export default async function LocaleLayout({
	children,
	params,
}: {
	children: ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	const supportedLocales = ["no", "en"];

	if (!supportedLocales.includes(locale)) {
		notFound();
	}

	let messages;
	try {
		messages = (await import(`../../../messages/${locale}.json`)).default;
	} catch (error) {
		console.error(`Missing translation file for locale: ${locale}`);
		notFound();
	}

	return (
		<html lang={locale}>
			<body className="overflow-hidden">
				<NextIntlClientProvider
					locale={locale}
					messages={messages}>
					<QueryProvider>
						<AuthProvider>
							<ProfileProvider>
								<AppContextProvider>
									<CategoriesProvider>
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
										<Main>
											{children}
											<Footer />
										</Main>
									</CategoriesProvider>
								</AppContextProvider>
							</ProfileProvider>
						</AuthProvider>
					</QueryProvider>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
