"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useChildrenOverflow } from "@/hooks/useChildrenOverflow";
import { useNavMenuStore } from "@/stores/useNavMenuStore";
import type { Category } from "@/types/categories.types";

import { MAX_NAV_CATEGORIES } from "./constants";
import { DropdownFooter } from "./DropdownFooter";
import { NavLink } from "./NavLink";
import { NavTrigger } from "./NavTrigger";
import { Overlay } from "./Overlay";
import { SubcategoryItem } from "./SubcategoryItem";

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
	const { setIsOpen } = useNavMenuStore();
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

	return (
		<nav
			ref={rootRef}
			className="container relative mx-auto hidden w-full justify-start lg:flex"
		>
			<ul
				ref={ulRef}
				className="flex w-full min-w-0 list-none items-center justify-start"
			>
				{loading
					? Array.from({ length: MAX_NAV_CATEGORIES }).map((_, i) => (
							<li key={i} className="relative">
								<Skeleton className="h-8 w-24 rounded-md" />
							</li>
						))
					: visibleCategories?.map((category, index, arr) => {
							const isFirst = index === 0;
							const isLast = index === arr.length - 1;
							return (
								<li key={category.slug} className="relative">
									{category.subcategories?.length ? (
										<NavTrigger
											category={category}
											isActive={openMenu === category.slug}
											isFirst={isFirst}
											isLast={isLast}
											isTight={isTight}
											onToggle={() => toggleMenu(category.slug)}
										/>
									) : (
										<NavLink
											category={category}
											isFirst={isFirst}
											isLast={isLast}
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
