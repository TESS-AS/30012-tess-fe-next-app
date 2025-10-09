"use client";

import { Search, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

export type Suggestion = string;
export type CategoryLink = { id: string | number; name: string; count: number };

export default function SearchAside({
	suggestions,
	categories,
	onPick,
	maxCategories = 5,
	buildSuggestionHref = (suggestion) =>
		`/search?query=${encodeURIComponent(suggestion)}`,
	buildCategoryHref = (c) =>
		`/category/${encodeURIComponent(c.name.toLowerCase().replace(/\s+/g, "-"))}`,
	seeMoreHref = `/categories`,
}: {
	suggestions: Suggestion[];
	categories: CategoryLink[];
	query: string;
	onPick: (href: string) => void;
	maxCategories?: number;
	buildSuggestionHref?: (s: Suggestion) => string;
	buildCategoryHref?: (c: CategoryLink) => string;
	seeMoreHref?: string;
}) {
	const t = useTranslations();

	const card =
		"rounded-xl bg-white p-2 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_6px_12px_rgba(0,0,0,0.06)]";

	return (
		<div className="col-span-1 space-y-4 pr-4">
			<div>
				<h4 className="mb-2 text-sm font-semibold">
					{t("Search.suggestions")}
				</h4>
				<div className={card}>
					{suggestions?.length ? (
						<ul>
							{suggestions.map((suggestion, idx) => {
								const href = buildSuggestionHref(suggestion);
								return (
									<li
										key={`${suggestion}-${idx}`}
										className="flex items-center">
										<button
											type="button"
											onClick={() => onPick(href)}
											className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-gray-50">
											<Search className="h-4 w-4 text-gray-400" />
											<span className="text-[#0A7A3F] hover:cursor-pointer hover:underline">
												{suggestion}
											</span>
										</button>
									</li>
								);
							})}
						</ul>
					) : (
						<p className="px-3 py-2 text-sm text-green-600">
							{t("Search.noSuggestions")}
						</p>
					)}
				</div>
			</div>

			<div>
				<h4 className="mb-2 text-sm font-semibold">{t("Search.categories")}</h4>
				<div className={card}>
					{categories?.length ? (
						<>
							<ul>
								{(categories.length > maxCategories
									? categories.slice(0, maxCategories)
									: categories
								).map((cat) => {
									const href = buildCategoryHref(cat);
									return (
										<li
											key={cat.id}
											className="flex">
											<button
												type="button"
												onClick={() => onPick(href)}
												className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-gray-50">
												<span className="text-[#0A7A3F] hover:cursor-pointer hover:underline">
													{cat.name}
												</span>
												<span className="text-gray-500">({cat.count})</span>
											</button>
										</li>
									);
								})}
							</ul>

							{categories.length > maxCategories && (
								<button
									type="button"
									onClick={() => onPick(seeMoreHref)}
									className="mt-2 inline-flex items-center gap-2 px-3 py-2 text-sm text-[#0A7A3F] hover:cursor-pointer hover:underline">
									{t("Search.seeMoreCategories", {
										default: "Se flere kategorier",
									})}
									<ArrowRight className="h-4 w-4" />
								</button>
							)}
						</>
					) : (
						<p className="px-3 py-2 text-sm text-green-600">
							{t("Search.noProductsFound")}
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
