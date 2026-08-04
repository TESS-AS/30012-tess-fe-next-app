"use client";

import { useBreadcrumbs } from "@/hooks/useBreadcrumbs";
import {
	buildProductBreadcrumbs,
	type ProductCategoryNode,
} from "@/lib/product-breadcrumbs";
import { Home, ChevronRight } from "lucide-react";
import { useParams } from "next/navigation";

import { Breadcrumb } from "../ui/breadcrumb";
import { Skeleton } from "../ui/skeleton";

interface ProductBreadcrumbsProps {
	/** Preferred source — categories array from /columnAttributes. */
	categories?: ProductCategoryNode[];
	/** Required for picking the matching tree and locale-aware labels. */
	locale: string;
	productName?: string;
	/** Legacy fallback path — kept until BE ships `categories` everywhere. */
	segment?: string;
	/**
	 * True while the upstream /columnAttributes call is still in flight.
	 * Shows a skeleton instead of the empty/just-product fallback so the
	 * breadcrumb doesn't flash "1 item → full chain".
	 */
	isLoading?: boolean;
}

function BreadcrumbSkeleton() {
	// `w-fit` + `justify-start` are required to override the global
	// `nav { width: 100%; justify-content: space-between; }` rule in
	// globals.css. Without them, the chevrons + pills spread across the full
	// row instead of sitting next to each other.
	return (
		<nav
			aria-label="breadcrumb"
			aria-busy="true"
			className="text-muted-foreground inline-flex w-fit items-center justify-start gap-2 text-sm">
			<Home className="text-muted-foreground/40 h-4 w-4" />
			<ChevronRight className="text-muted-foreground/40 h-4 w-4" />
			<Skeleton className="h-4 w-20" />
			<ChevronRight className="text-muted-foreground/40 h-4 w-4" />
			<Skeleton className="h-4 w-24" />
			<ChevronRight className="text-muted-foreground/40 h-4 w-4" />
			<Skeleton className="h-4 w-20" />
		</nav>
	);
}

export function ProductBreadcrumbs({
	categories,
	locale,
	productName,
	segment,
	isLoading = false,
}: ProductBreadcrumbsProps) {
	const params = useParams();
	const urlCategorySlug =
		typeof params.category === "string" && params.category !== "__default"
			? params.category
			: null;

	const hasBeCategories = Array.isArray(categories) && categories.length > 0;

	const beBreadcrumbs = hasBeCategories
		? buildProductBreadcrumbs(categories, {
				locale,
				urlCategorySlug,
				productName,
			})
		: [];

	// Legacy slug-resolution fallback. Hook must run unconditionally
	// (rules of hooks); its output is ignored when BE categories are present.
	const legacyBreadcrumbs = useBreadcrumbs(segment, productName);

	if (isLoading && !hasBeCategories) {
		return (
			<div>
				<BreadcrumbSkeleton />
			</div>
		);
	}

	const breadcrumbs = hasBeCategories ? beBreadcrumbs : legacyBreadcrumbs;

	return (
		<div>
			<Breadcrumb items={breadcrumbs} />
		</div>
	);
}
