import { Category, RawCategory } from "@/types/categories.types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function mapCategoryTree(node: RawCategory, locale: string): Category {
	const nameKey = `name_${locale}`;
	const name = node[nameKey] || node.nameEn || node.nameNo;

	return {
		name,
		slug: name
			.toLowerCase()
			.normalize('NFKD')
			.replace(/\s+/g, '-')
			.replace(/[^a-z0-9æøå-]/gi, '')
			.replace(/-+/g, '-')
			.replace(/^-|-$/g, ''),
		groupId: node.groupId,
		subcategories:
			node.children?.map((child) => mapCategoryTree(child, locale)) ?? [],
	};
}

export function formatUrlToDisplayName(urlString: string): string {
	if (!urlString) return '';
	const decodedString = decodeURIComponent(urlString);
	const spacedString = decodedString.replace(/-/g, ' ');
	
	return spacedString
		.split(' ')
		.map(word => {
			if (word.length === 0) return '';
			return word[0].toUpperCase() + word.slice(1);
		})
		.join(' ');
}
