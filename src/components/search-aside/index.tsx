"use client";

import { Search, Folder } from "lucide-react";
import { useTranslations } from "next-intl";

export type Suggestion = string;
export type CategoryLink = {
	id: string | number;
	name: string;
	count: number;
	slug?: string[]; // Optional slug array for building URLs
};

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const highlightMatch = (text: string, query: string) => {
	const q = query.trim();
	if (!q) return text;
	const re = new RegExp(`(${escapeRe(q)})`, "gi");
	return text.split(re).map((part, i) =>
		part.toLowerCase() === q.toLowerCase() ? (
			<span
				key={i}
				className="font-bold text-[#009640]">
				{part}
			</span>
		) : (
			<span key={i}>{part}</span>
		),
	);
};

const prettifySlug = (slug: string) =>
	slug
		.split("-")
		.map((part, i) =>
			i === 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part,
		)
		.join(" ");

const getCategoryDisplayName = (cat: CategoryLink): string => {
	if (cat.slug && cat.slug.length > 0) {
		return prettifySlug(cat.slug[0]);
	}
	return cat.name;
};

export default function SearchAside({
	suggestions,
	categories,
	query,
	onPick,
	maxCategories = 5,
	buildSuggestionHref = (suggestion) =>
		`/search?query=${encodeURIComponent(suggestion)}`,
	buildCategoryHref = (c) => {
		// If slug array is available, use it to build the URL
		if (c.slug && Array.isArray(c.slug) && c.slug.length > 0) {
			return `/${c.slug.join("/")}`;
		}
		// Fallback to old behavior
		return `/category/${encodeURIComponent(c.name.toLowerCase().replace(/\s+/g, "-"))}`;
	},
}: {
	suggestions: Suggestion[];
	categories: CategoryLink[];
	query: string;
	onPick: (href: string) => void;
	maxCategories?: number;
	buildSuggestionHref?: (s: Suggestion) => string;
	buildCategoryHref?: (c: CategoryLink) => string;
}) {
	const t = useTranslations();

	return (
		<div className="col-span-1 space-y-5">
			<div>
				<h4 className="mb-2 text-base font-semibold text-[#0F1912]">
					{t("Search.suggestions")}
				</h4>
				{suggestions?.length ? (
					<ul className="space-y-1">
						{suggestions.map((suggestion, idx) => {
							const href = buildSuggestionHref(suggestion);
							return (
								<li key={`${suggestion}-${idx}`}>
									<button
										type="button"
										onClick={() => onPick(href)}
										title={suggestion}
										className="flex w-full items-center gap-2 py-1 text-left text-sm text-[#0F1912] hover:underline">
										<Search className="h-4 w-4 shrink-0 text-[#009640]" />
										<span className="min-w-0 flex-1 truncate">
											{highlightMatch(suggestion, query)}
										</span>
									</button>
								</li>
							);
						})}
					</ul>
				) : (
					<p className="py-1 text-sm text-gray-500">
						{t("Search.noSuggestions")}
					</p>
				)}
			</div>

			<div>
				<h4 className="mb-2 text-base font-semibold text-[#0F1912]">
					{t("Search.categories")}
				</h4>
				{categories?.length ? (
					<ul className="space-y-1">
						{(categories.length > maxCategories
							? categories.slice(0, maxCategories)
							: categories
						).map((cat) => {
							const href = buildCategoryHref(cat);
							const displayName = getCategoryDisplayName(cat);
							return (
								<li key={cat.id}>
									<button
										type="button"
										onClick={() => onPick(href)}
										title={`"${query}" i ${displayName}`}
										className="flex w-full items-center gap-2 py-1 text-left text-sm text-[#0F1912] hover:underline">
										<Folder className="h-4 w-4 shrink-0 text-[#009640]" />
										<span className="min-w-0 flex-1 truncate">
											<span className="font-bold text-[#009640]">
												&ldquo;{query}&rdquo;
											</span>{" "}
											i {displayName}
										</span>
									</button>
								</li>
							);
						})}
					</ul>
				) : (
					<p className="py-1 text-sm text-gray-500">
						{t("Search.noProductsFound")}
					</p>
				)}
			</div>
		</div>
	);
}
