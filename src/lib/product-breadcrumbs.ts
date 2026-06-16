/**
 * BE-driven product breadcrumbs.
 *
 * The product response now includes a `categories` array — one entry per
 * level in each catalog tree the product belongs to. We pick the tree that
 * matches the URL's category slug (or the deepest tree as a fallback) and
 * render it as a breadcrumb chain.
 *
 * Two BE-vs-FE mismatches to normalise:
 *
 * 1. Slug characters. BE slugs may contain "." and ":" (e.g.
 *    "k.017989:-kjemikalier-..."); FE routes only accept [a-z0-9-]. We
 *    sanitize every slug segment before building hrefs.
 *
 * 2. Assortment-wrapped catalogs. Most products live in a tree like
 *    [depth 0 catalog root] → [depth 1 category] → ...
 *    But customer-specific catalogs add an "assortment" layer:
 *    [depth 0 catalog root] → [depth 1 assortment "Bane NOR Katalog"]
 *    → [depth 2 category "K.017989..."] → ...
 *    The assortment layer is implicit in the URL (driven by the user's
 *    customer association), so the breadcrumb shouldn't render it and the
 *    deeper hrefs shouldn't include its slug segment. We detect assortment
 *    nodes by a non-ObjectId categoryNumber.
 *
 * BE could simplify this by:
 *   a) sending a localized `label: { no, en }` per node (for breadcrumb text);
 *   b) flagging assortment nodes (e.g. `isAssortment: true`) instead of
 *      relying on the categoryNumber heuristic.
 */

import { formatUrlToDisplayName } from "@/lib/utils";

export interface ProductCategoryNode {
	categoryNumber: string;
	depth: number;
	slug: string[];
	name?: string;
	label?: { no?: string; en?: string } | string | null;
	productVariantCount?: string;
}

export interface ProductBreadcrumbItem {
	href: string;
	label: string;
	current?: boolean;
}

function isAssortmentNode(node: ProductCategoryNode): boolean {
	// Catalog roots (depth 0) are always skipped above.
	// Assortment wrappers carry a *named* categoryNumber (e.g. "Bane NOR
	// Katalog", "DEFAULT_SALES_NEW", "SORTILOG") rather than an alphanumeric
	// ID. Real categories use either an ObjectId-style hex string
	// ("6a0f1f60...") or a numeric code ("03030500"). Detect the named-string
	// case by spaces, underscores, or all-uppercase-letters categoryNumbers.
	const cn = node.categoryNumber;
	if (!cn) return false;
	if (/\s/.test(cn)) return true;
	if (cn.includes("_")) return true;
	if (/^[A-Z]+$/.test(cn)) return true;
	return false;
}

function sanitizeSlugSegment(segment: string): string {
	// FE category routes are built with transliterated ASCII slugs (see
	// lib/utils.ts mapCategoryTree and hooks/useBreadcrumbs.ts), so BE slugs
	// containing æ/ø/å must be transliterated the same way — otherwise the
	// generic /[^a-z0-9-]/ strip would drop those letters and produce slugs
	// like "lnn-skatt" that don't match any product page.
	return segment
		.toLowerCase()
		.replace(/å/g, "a")
		.replace(/ø/g, "o")
		.replace(/æ/g, "ae")
		.normalize("NFKD")
		.replace(/[^a-z0-9-]/g, "")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

function resolveLabel(node: ProductCategoryNode, locale: string): string {
	if (node.label && typeof node.label === "object") {
		const localized =
			locale === "en"
				? node.label.en ?? node.label.no
				: node.label.no ?? node.label.en;
		if (localized) return localized;
	}
	if (typeof node.label === "string" && node.label) return node.label;
	const lastSlug = node.slug[node.slug.length - 1] ?? "";
	const sanitized = sanitizeSlugSegment(lastSlug);
	return sanitized ? formatUrlToDisplayName(sanitized) : "";
}

interface RenderedNode {
	node: ProductCategoryNode;
	renderedSlug: string[];
}

function buildRenderedTree(treeNodes: ProductCategoryNode[]): RenderedNode[] {
	// How many leading slug segments to strip from every node? Equal to the
	// deepest assortment node's depth — assortments always live at the top of
	// the chain.
	let assortmentPrefixLen = 0;
	for (const node of treeNodes) {
		if (node.depth > 0 && isAssortmentNode(node)) {
			assortmentPrefixLen = Math.max(assortmentPrefixLen, node.depth);
		}
	}

	return treeNodes
		.filter((n) => n.depth > 0 && !isAssortmentNode(n))
		.map((n) => ({
			node: n,
			renderedSlug: n.slug
				.slice(assortmentPrefixLen)
				.map(sanitizeSlugSegment)
				.filter(Boolean),
		}))
		.filter((r) => r.renderedSlug.length > 0);
}

function pickTree(
	categories: ProductCategoryNode[],
	urlCategorySlug: string | null,
): RenderedNode[] {
	const byRoot = new Map<string, ProductCategoryNode[]>();
	for (const node of categories) {
		if (node.depth <= 0) continue;
		if (!Array.isArray(node.slug) || node.slug.length === 0) continue;
		const root = node.slug[0];
		const bucket = byRoot.get(root);
		if (bucket) bucket.push(node);
		else byRoot.set(root, [node]);
	}
	if (byRoot.size === 0) return [];

	const trees = Array.from(byRoot.values())
		.map(buildRenderedTree)
		.filter((t) => t.length > 0);

	if (urlCategorySlug) {
		const matched = trees.find((tree) =>
			tree.some((r) => r.renderedSlug[0] === urlCategorySlug),
		);
		if (matched) return matched;
	}

	// Fallback: pick the tree whose deepest leaf has the longest path.
	let best: RenderedNode[] = [];
	let bestDepth = -1;
	for (const tree of trees) {
		const maxPath = tree.reduce(
			(m, r) => Math.max(m, r.renderedSlug.length),
			0,
		);
		if (maxPath > bestDepth) {
			bestDepth = maxPath;
			best = tree;
		}
	}
	return best;
}

export function buildProductBreadcrumbs(
	categories: ProductCategoryNode[] | undefined | null,
	{
		locale,
		urlCategorySlug,
		productName,
	}: {
		locale: string;
		urlCategorySlug?: string | null;
		productName?: string;
	},
): ProductBreadcrumbItem[] {
	const tree = pickTree(categories ?? [], urlCategorySlug ?? null);

	const items: ProductBreadcrumbItem[] = tree
		.slice()
		.sort((a, b) => a.renderedSlug.length - b.renderedSlug.length)
		.map((r) => ({
			href: `/${r.renderedSlug.join("/")}`,
			label: resolveLabel(r.node, locale),
		}))
		.filter((item) => item.label);

	if (productName) {
		items.push({ href: "#", label: productName, current: true });
	}

	return items;
}
