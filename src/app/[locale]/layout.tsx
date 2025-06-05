import { ReactNode } from "react";

import { Footer } from "@/components/layouts/Footer/Footer";
import Main from "@/components/layouts/Main/Main";
import { AppContextProvider } from "@/lib/appContext";
import { AuthProvider } from "@/lib/providers/AuthProvider";
import { getSeoMetadata } from "@/lib/seo";
import { mapCategoryTree } from "@/lib/utils";
import axiosServer from "@/services/axiosServer";
import type { Category, RawCategory } from "@/types/categories.types";
import { notFound } from "next/navigation";
import "../globals.css";
import { ToastContainer } from "react-toastify";
import '../../lib/i18n';

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
	const supportedLocales = ["no", "en"];


	const res = await axiosServer.get(`/categories`);
	const raw: RawCategory[] = res.data;
	const categories: Category[] = raw.map((node) =>
		mapCategoryTree(node, supportedLocales[0]),
	);

	return (
		<html lang={supportedLocales[0]}>
			<body className="overflow-hidden">
				<AuthProvider>
					<AppContextProvider>
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
					</AppContextProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
