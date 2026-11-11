"use client";

import { cn } from "@/lib/utils";
import { Folder } from "lucide-react";
import { useTranslations } from "next-intl";

interface PopularCategory {
	id: string | number;
	name: string;
	href?: string;
}

interface NoResultsProps {
	query?: string | undefined;
	className?: string;
	popularCategories?: PopularCategory[];
	onCategoryClick?: (href: string) => void;
}

export function NoResults({
	query,
	className,
	popularCategories = [],
	onCategoryClick,
}: NoResultsProps) {
	const t = useTranslations("Search.noResults");

	return (
		<div className={cn("w-full space-y-5 text-[#0F1912]", className)}>
			<div>
				<h2 className="text-base font-semibold">
					{t("title")}{" "}
					<span className="text-[#009640]">&laquo;{query ?? ""}&raquo;</span>
				</h2>
				<ul className="mt-3 space-y-2 text-sm">
					<li className="flex items-start gap-2">
						<span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#009640]" />
						<span>{t("tips.checkSpelling")}</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#009640]" />
						<span>{t("tips.useFewerWords")}</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#009640]" />
						<span>{t("tips.searchByType")}</span>
					</li>
				</ul>
			</div>

			{popularCategories.length > 0 && (
				<div className="border-t border-gray-200 pt-4">
					<h3 className="mb-2 text-base font-semibold">
						{t("popularCategoriesTitle")}
					</h3>
					<ul className="space-y-1">
						{popularCategories.map((cat) => (
							<li key={cat.id}>
								<button
									type="button"
									onClick={() => cat.href && onCategoryClick?.(cat.href)}
									className="flex w-full items-center gap-2 py-1 text-left text-sm text-[#0F1912] hover:underline">
									<Folder className="h-4 w-4 shrink-0 text-[#009640]" />
									<span>{cat.name}</span>
								</button>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
