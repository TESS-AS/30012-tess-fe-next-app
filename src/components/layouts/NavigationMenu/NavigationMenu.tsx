"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useChildrenOverflow } from "@/hooks/useChildrenOverflow";
import { useNavMenuStore } from "@/stores/useNavMenuStore";
import type { Category } from "@/types/categories.types";
import { useParams } from "next/navigation";

import { MAX_NAV_CATEGORIES } from "./constants";
import { DropdownFooter } from "./DropdownFooter";
import { NavLink } from "./NavLink";
import { NavTrigger } from "./NavTrigger";
import { Overlay } from "./Overlay";
import { SubcategoryItem } from "./SubcategoryItem";

function subtreeHasSlug(category: Category, slug: string): boolean {
	if (category.slug === slug) return true;
	return (
		category.subcategories?.some((c) => subtreeHasSlug(c, slug)) ?? false
	);
}

function findTopLevelSlugForUrl(
	topLevels: Category[],
	urlSegmentSlugs: string[],
): string | null {
	if (urlSegmentSlugs.length === 0) return null;
	// Prefer the deepest URL segment we can match — a segment slug is more
	// specific than the top `[category]` slug and less likely to collide
	// across trees.
	for (let i = urlSegmentSlugs.length - 1; i >= 0; i--) {
		const slug = urlSegmentSlugs[i];
		const match = topLevels.find((c) => subtreeHasSlug(c, slug));
		if (match) return match.slug;
	}
	return null;
}

export default function CategoryNavigationMenu({
	categories,
	loading,
	selectedAssortment,
}: {
	categories: Category[];
	loading: boolean;
	selectedAssortment?: string;
}) {
	const [openMenu, setOpenMenu] = useState<string | false>(false);
	const { setIsOpen, requestedOpenSlug, requestOpen } = useNavMenuStore();
	const rootRef = useRef<HTMLElement | null>(null);
	const ulRef = useRef<HTMLUListElement | null>(null);

	const closeMenu = useCallback(() => {
		setOpenMenu(false);
		setIsOpen(false);
	}, [setIsOpen]);

	const toggleMenu = useCallback(
		(slug: string) => {
			const next = openMenu === slug ? false : slug;
			setOpenMenu(next);
			setIsOpen(!!next);
		},
		[openMenu, setIsOpen],
	);

	// External pages (e.g. /alle-kategorier tiles) can request a category to be
	// opened by writing its slug into the nav menu store. Consume + clear here.
	useEffect(() => {
		if (!requestedOpenSlug) return;
		if (!categories?.some((c) => c.slug === requestedOpenSlug)) {
			requestOpen(null);
			return;
		}
		setOpenMenu(requestedOpenSlug);
		setIsOpen(true);
		requestOpen(null);
	}, [requestedOpenSlug, categories, setIsOpen, requestOpen]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
				closeMenu();
			}
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") closeMenu();
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [closeMenu]);

	const activeCategory = categories?.find((c) => c.slug === openMenu);
	const visibleCategories = categories?.slice(0, MAX_NAV_CATEGORIES);
	const slugsKey = (visibleCategories ?? []).map((c) => c.slug).join("|");
	const isTight = useChildrenOverflow(ulRef, slugsKey);

	// Persistently highlight the top-level nav item that owns the current
	// product page. Two sources, in order:
	//   1. Store value set by the product page from the fetched category tree.
	//      Needed for `/produkt/:id` URLs rewritten with __default segments.
	//   2. URL walk — for products reached via `/[category]/[subcategory]/...`,
	//      match any URL segment against each top-level's descendant slugs.
	const params = useParams();
	const isProductPage = typeof params?.product === "string";
	const storeTopLevelSlug = useNavMenuStore((s) => s.productTopLevelSlug);
	const urlSegmentSlugs = isProductPage
		? [params?.category, params?.subcategory, params?.segment]
				.filter((s): s is string => typeof s === "string" && s !== "__default")
		: [];
	const currentTopLevelSlug = isProductPage
		? storeTopLevelSlug ??
			findTopLevelSlugForUrl(visibleCategories ?? [], urlSegmentSlugs)
		: null;

	return (
		<nav
			ref={rootRef}
			className="container relative mx-auto hidden w-full justify-start lg:-ml-[12px] lg:flex"
		>
			<ul
				ref={ulRef}
				className="relative flex w-full min-w-0 list-none items-end justify-start"
			>
				{loading
					? Array.from({ length: MAX_NAV_CATEGORIES }).map((_, i) => (
							<li key={i} className="relative">
								<Skeleton className="h-8 w-24 rounded-md" />
							</li>
						))
					: visibleCategories?.map((category, index) => {
							const isFirst = index === 0;
							const isCurrent = currentTopLevelSlug === category.slug;
							return (
								<li key={category.slug} className="relative">
									{category.subcategories?.length ? (
										<NavTrigger
											category={category}
											isActive={openMenu === category.slug}
											isCurrent={isCurrent}
											isFirst={isFirst}
											isTight={isTight}
											onToggle={() => toggleMenu(category.slug)}
										/>
									) : (
										<NavLink
											category={category}
											isCurrent={isCurrent}
											isFirst={isFirst}
											isTight={isTight}
										/>
									)}
								</li>
							);
						})}
			</ul>

			{openMenu && activeCategory?.subcategories?.length && (
				<>
					<Overlay navRef={rootRef} onClose={closeMenu} />
					<div
						className="fixed right-0 left-0 z-50"
						style={{
							top: rootRef.current
								? `${rootRef.current.getBoundingClientRect().bottom}px`
								: undefined,
						}}
					>
						<div className="bg-popover text-popover-foreground flex min-h-[560px] max-h-[80vh] w-full flex-col overflow-y-auto animate-in fade-in zoom-in-90 duration-200">
							<ul className="container mx-auto grid flex-1 grid-cols-1 items-start justify-items-start gap-x-6 gap-y-8 px-0 pt-12 pb-4 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
								{activeCategory.subcategories.map((subcategory) => (
									<SubcategoryItem
										key={subcategory.slug}
										subcategory={subcategory}
										parentSlug={activeCategory.slug}
										onClose={closeMenu}
									/>
								))}
							</ul>
							<DropdownFooter category={activeCategory} onClose={closeMenu} />
						</div>
					</div>
				</>
			)}
		</nav>
	);
}
