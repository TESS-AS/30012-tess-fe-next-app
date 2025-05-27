"use client";
import { formatUrlToDisplayName } from "@/lib/utils";
import { useParams } from "next/navigation";

interface BreadcrumbItem {
	href: string;
	label: string;
	current?: boolean;
}

export function useBreadcrumbs(query?: string | null, productName?: string) {
	const params = useParams();
	const category = params.category as string;
	const subcategory = params.subcategory as string;
	const segment = params.segment as string;

	const breadcrumbs: BreadcrumbItem[] = [
		{
			href: `/${category}`,
			label: formatUrlToDisplayName(category),
		},
		...(subcategory && subcategory !== "__default"
			? [
					{
						href: `/${category}/${subcategory}`,
						label: formatUrlToDisplayName(subcategory),
					},
				]
			: []),
		...(segment && segment !== "__default"
			? [
					{
						href: `/${category}/${subcategory}/${segment}`,
						label: formatUrlToDisplayName(segment),
					},
				]
			: []),
		...(productName
			? [
					{
						href: "#",
						label: productName,
						current: true,
					},
				]
			: []),
	];

	return breadcrumbs;
}
