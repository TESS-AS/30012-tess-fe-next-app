"use client";

import { useEffect } from "react";

import { useTranslation } from "react-i18next";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const {t} = useTranslation("common");

	useEffect(() => {
		// Log the error to an error reporting service
		console.error(error);
	}, [error]);

	return (
		<div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
			<h2 className="text-xl font-semibold text-gray-900">{t("Common.error.title")}</h2>
			<p className="text-gray-600">{t("Common.error.segmentLoad")}</p>
			<button
				onClick={reset}
				className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none">
				{t("Common.error.tryAgain")}
			</button>
		</div>
	);
}
