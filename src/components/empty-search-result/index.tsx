"use client";

import { cn } from "@/lib/utils";
import { AlertCircle, Mail } from "lucide-react";
import { useTranslations } from "next-intl";

interface NoResultsProps {
	query?: string | undefined;
	className?: string;
}

export function NoResults({ query, className }: NoResultsProps) {
	const t = useTranslations("Search.noResults");

	return (
		<div
			className={cn(
				"w-full space-y-6 rounded-md border-gray-200 bg-white p-6 text-gray-800",
				className,
			)}>
			<div>
				<div className="mb-3 flex items-center gap-2">
					<AlertCircle className="h-5 w-5 text-gray-600" />
					<h2 className="text-lg font-semibold">{t("title")}</h2>
				</div>
				<p className="mb-4 text-sm">
					{t("description", { query: query ?? "" })}
				</p>
				<div>
					<h3 className="mb-2 font-medium">{t("tipsTitle")}</h3>
					<ul className="list-disc space-y-1 pl-6 text-sm text-gray-700">
						<li>{t("tips.checkSpelling")}</li>
						<li>{t("tips.useFewerWords")}</li>
						<li>{t("tips.searchByType")}</li>
						<li>{t("tips.searchBySpec")}</li>
					</ul>
				</div>
			</div>

			<div className="rounded-md bg-[#F0FCF2] p-4">
				<div className="mb-1 flex items-center gap-2 text-green-800">
					<AlertCircle className="h-5 w-5" />
					<h3 className="font-medium">{t("help.title")}</h3>
				</div>
				<p className="mb-3 text-sm text-green-800">{t("help.description")}</p>
				<a
					href="mailto:tess@tess.no"
					className="inline-flex items-center gap-2 rounded-md bg-green-700 px-3 py-2 text-sm font-medium text-white hover:bg-green-700">
					<Mail className="h-4 w-4" />
					{t("help.email")}
				</a>
			</div>
		</div>
	);
}
