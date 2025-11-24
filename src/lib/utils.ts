import { Category, RawCategory } from "@/types/categories.types";
import { SidebarNavItem } from "@/types/sidebar.types";
import { clsx, type ClassValue } from "clsx";
import { StaticImageData } from "next/image";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function mapCategoryTree(node: RawCategory, locale: string): Category {
	// Always prefer Norwegian name first, then fallback to English
	const name = node.nameNo || node.name_no || node.nameEn || node.name_en || node[`name_${locale}`] || "";

	return {
		name,
		slug: name
			.toLowerCase()
			.replace(/å/g, "a")
			.replace(/ø/g, "o")
			.replace(/æ/g, "ae")
			.replace(/Å/g, "a")
			.replace(/Ø/g, "o")
			.replace(/Æ/g, "ae")
			.normalize("NFKD")
			.replace(/\s+/g, "-")
			.replace(/[^a-z0-9-]/gi, "")
			.replace(/-+/g, "-")
			.replace(/^-|-$/g, ""),
		groupId: node.groupId,
		image: node.image,
		subcategories:
			node.children?.map((child) => mapCategoryTree(child, locale)) ?? [],
	};
}

export function formatDate(date: string | Date, time?: string) {
	const dateObj = typeof date === "string" ? new Date(date) : date;
	const formattedDate = dateObj
		.toLocaleDateString("no", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			...(!time && {
				hour: "2-digit",
				minute: "2-digit",
			}),
		})
		.replace(",", "");

	if (time) {
		const formattedTime = time.slice(0, 5);
		return `${formattedDate} ${formattedTime}`;
	}

	return formattedDate;
}

export function formatUrlToDisplayName(urlString: string): string {
	if (!urlString) return "";
	const decodedString = decodeURIComponent(urlString);
	// Replace hyphens with spaces, normalize Norwegian characters, and convert to lowercase
	const normalizedString = decodedString
		.replace(/-/g, " ")
		.replace(/å/g, "a")
		.replace(/ø/g, "o")
		.replace(/æ/g, "ae")
		.replace(/Å/g, "a")
		.replace(/Ø/g, "o")
		.replace(/Æ/g, "ae")
		.toLowerCase();

	// Norwegian lowercase words that should remain lowercase (unless first word)
	const norwegianLowercaseWords = new Set([
		"og",
		"i",
		"på",
		"av",
		"til",
		"for",
		"med",
		"om",
		"ved",
		"over",
		"under",
		"etter",
		"før",
		"siden",
		"mot",
		"fra",
		"inn",
		"ut",
		"opp",
		"ned",
		"som",
		"enn",
		"ennå",
		"bare",
		"selv",
		"når",
		"hvis",
		"hvor",
		"hvorfor",
		"hvordan",
	]);

	const words = normalizedString.split(" ").filter((w) => w.length > 0);
	return words
		.map((word, index) => {
			if (word.length === 0) return "";
			// First word is always capitalized
			if (index === 0) {
				return word[0].toUpperCase() + word.slice(1);
			}
			// All other words stay lowercase (Norwegian sentence case)
			return word;
		})
		.join(" ");
}

export function isImageSource(
	icon: SidebarNavItem["icon"],
): icon is string | StaticImageData {
	return (
		typeof icon === "string" ||
		(typeof icon === "object" && icon !== null && "src" in icon)
	);
}

/**
 * Converts category tree array to URL path slugs
 * Takes up to 3 categories (category, subcategory, segment) and converts them to URL-friendly slugs
 */
export function categoryTreeToUrlPath(
	categoryTree: Array<{ nameEn?: string; nameNo?: string; [key: string]: any }>,
	locale: string = "no",
): string[] {
	if (!categoryTree || categoryTree.length === 0) return [];

	// Take first 3 non-assortment items ONLY (strictly filter out assortments)
	// Never include assortments in the URL path
	const categories: any[] = [];
	for (const cat of categoryTree) {
		// Strictly skip if it's an assortment (has assortmentNumber or assortmentnumber)
		if (cat.assortmentNumber || cat.assortmentnumber) {
			continue;
		}
		// Only add if it has a name
		if (cat.nameNo || cat.name_no || cat.nameEn || cat.name_en) {
			categories.push(cat);
			if (categories.length >= 3) break;
		}
	}

	// Return only non-assortment categories (even if less than 3)
	// Do NOT fall back to assortments - better to have fewer categories than include assortments
	return categories.map((category) => {
		// Always prefer Norwegian name first, then fallback to English
		const name = category.nameNo || category.name_no || category.nameEn || category.name_en || "";

		// Convert to slug (same logic as mapCategoryTree)
		return name
			.toLowerCase()
			.replace(/å/g, "a")
			.replace(/ø/g, "o")
			.replace(/æ/g, "ae")
			.replace(/Å/g, "a")
			.replace(/Ø/g, "o")
			.replace(/Æ/g, "ae")
			.normalize("NFKD")
			.replace(/\s+/g, "-")
			.replace(/[^a-z0-9-]/gi, "")
			.replace(/-+/g, "-")
			.replace(/^-|-$/g, "");
	});
}

/**
 * Converts product name to URL-friendly slug
 */
export function productNameToSlug(productName: string): string {
	if (!productName) return "";

	return productName
		.toLowerCase()
		.replace(/å/g, "a")
		.replace(/ø/g, "o")
		.replace(/æ/g, "ae")
		.replace(/Å/g, "a")
		.replace(/Ø/g, "o")
		.replace(/Æ/g, "ae")
		.normalize("NFKD")
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9-]/gi, "")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

/**
 * Creates a product URL slug combining product number and product name
 * Format: {productNumber}-{productNameSlug}
 */
export function createProductSlug(
	productNumber: string,
	productName: string,
): string {
	const nameSlug = productNameToSlug(productName);
	return `${productNumber}-${nameSlug}`;
}

/**
 * Extracts product number from a product slug
 * Format: {productNumber}-{productNameSlug}
 * 
 * Strategy: Try to identify where the product number ends by checking patterns.
 * Product names are always lowercase with hyphens, while product numbers have specific patterns.
 */
export function extractProductNumberFromSlug(productSlug: string): string {
	// If no hyphen, it's likely just a product number
	if (!productSlug.includes("-")) {
		return productSlug;
	}

	const parts = productSlug.split("-");
	
	// Check if first part matches product number patterns
	const firstPart = parts[0];
	
	// Pure numeric product numbers
	if (/^\d+$/.test(firstPart)) {
		// Could be just the number, or number with more parts
		// Try to find where number ends and name begins
		// Numbers are usually short, names are longer
		if (parts.length > 1 && parts[1].length > 2 && /^[a-z]/.test(parts[1])) {
			// Next part starts with lowercase letter, likely name
			return firstPart;
		}
		// Might be multi-part number like "123-456"
		return productSlug;
	}
	
	// Prefixed product numbers (P_, AT, TR, etc.)
	if (/^(P_|p_|AT|TR|VH|VS|US|GW|KN|KF|CW|GK|AV|JB|AU|AS|AK|VM|ZS)/i.test(firstPart)) {
		// Try to find where product number ends
		// Product numbers with these prefixes usually have numbers after
		for (let i = 1; i < parts.length; i++) {
			const current = parts.slice(0, i + 1).join("-");
			const nextPart = parts[i + 1];
			
			// If next part looks like it starts a product name (lowercase, longer)
			if (nextPart && /^[a-z]/.test(nextPart) && nextPart.length > 3) {
				return current;
			}
			
			// Check if current matches a complete product number pattern
			if (
				/^P_[A-Za-z0-9_-]+$/.test(current) ||
				/^(AT|TR|VH|VS|US|GW|KN|KF|CW|GK|AV|JB|AU|AS|AK|VM|ZS)\d+(?:-[A-Za-z0-9]+)?$/i.test(current) ||
				/^p_rw\d+$/i.test(current)
			) {
				// This could be complete, but check if next part is clearly a name
				if (!nextPart || /^[a-z]/.test(nextPart)) {
					return current;
				}
			}
		}
		// If we can't determine, return first few parts (likely the number)
		return parts.slice(0, Math.min(3, parts.length)).join("-");
	}
	
	// Fallback: if it starts with uppercase or numbers, likely product number
	// Return first part or first two parts
	if (/^[A-Z0-9]/.test(firstPart)) {
		// Check if second part looks like a name (starts with lowercase)
		if (parts.length > 1 && /^[a-z]/.test(parts[1])) {
			return firstPart;
		}
		// Might be multi-part product number
		return parts.slice(0, 2).join("-");
	}
	
	// If all else fails, return the whole slug (might be just a product number)
	return productSlug;
}
