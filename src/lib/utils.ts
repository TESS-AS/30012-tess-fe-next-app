import { Category, RawCategory } from "@/types/categories.types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function mapCategoryTree(node: RawCategory, locale: string): Category {
	const nameKey = `name_${locale}`;
	const name = node[nameKey] || node.name_en || "Unnamed";

	return {
		name,
		slug: name
			.toLowerCase()
			.replace(/\s+/g, "-")
			.replace(/[^\w-]/g, ""),
		groupId: node.group_id,
		subcategories:
			node.children?.map((child) => mapCategoryTree(child, locale)) ?? [],
	};
}

export function formatUrlToDisplayName(urlString: string): string {
	// Replace hyphens with spaces and decode URI components
	const decodedString = decodeURIComponent(urlString?.replace(/-/g, " "));

	// Capitalize first letter of each word
	return decodedString
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
}
