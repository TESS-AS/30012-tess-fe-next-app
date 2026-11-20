"use client";

import { useTranslations } from "next-intl";

interface SearchResultBannerProps {
	query?: string | null;
	categoryName?: string | null;
	count: number;
	families?: number;
}

export function SearchResultBanner({
	query,
	categoryName,
	count,
	families,
}: SearchResultBannerProps) {
	const t = useTranslations("Search.resultsBanner");

	if (count <= 0) return null;

	const hasQuery = !!query;
	const hasFamilies = typeof families === "number" && families > 0;

	const key = hasQuery
		? hasFamilies
			? "forQueryWithFamilies"
			: "forQuery"
		: hasFamilies
			? "forCategoryWithFamilies"
			: "forCategory";

	const values: Record<string, string | number> = hasQuery
		? { query: query as string, count }
		: { name: categoryName ?? "", count };
	if (hasFamilies) values.families = families as number;

	return (
		<div className="relative left-1/2 -ml-[50vw] w-screen border-b-2 border-[#C1C4C2] bg-[#F0FCF2]">
			<div className="container mx-auto pr-4 py-3">
				<p className="text-[16px] leading-[150%] font-normal text-[#0F1912]">
					{t.rich(key, {
						...values,
						b: (chunks) => (
							<span className="font-bold">{chunks}</span>
						),
						g: (chunks) => (
							<span className="font-bold text-[#009640]">{chunks}</span>
						),
					})}
				</p>
			</div>
		</div>
	);
}
