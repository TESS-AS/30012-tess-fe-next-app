"use client";

import * as React from "react";
import { useState } from "react";

import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useSearch } from "@/hooks/useProductSearch";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/categories.types";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function CategoryNavigationMenu({
	categories,
}: {
	categories: Category[];
}) {
	const t = useTranslations();
	const [query, setQuery] = useState("");
	const { data, isLoading } = useSearch(query);

	return (
		<NavigationMenu className="hidden w-full justify-between md:flex">
			<NavigationMenuList className="flex w-full max-w-full justify-between gap-2 px-0">
				{categories.slice(0, 7).map((category) => (
					<NavigationMenuItem key={category.slug}>
						{category.subcategories?.length ? (
							<>
								<NavigationMenuTrigger
									onClick={(e) => {
										e.preventDefault();
										window.location.href = `/${category.slug}`;
									}}
									className="hover:bg-accent hover:text-accent-foreground flex items-center gap-1 rounded-md px-4 py-2 text-sm font-medium transition-colors">
									{category.name}
								</NavigationMenuTrigger>
								<NavigationMenuContent>
									<ul className="grid max-h-[500px] w-[1250px] gap-6 overflow-y-auto p-6 md:grid-cols-2 lg:grid-cols-3">
										{category.subcategories.map((subcategory) => (
											<li key={subcategory.slug}>
												<div className="mb-2 text-sm font-semibold">
													<Link
														href={`/${category.slug}/${subcategory.slug}`}
														className="hover:underline">
														{subcategory.name}
													</Link>
												</div>

												{subcategory.subcategories?.length > 0 && (
													<ul className="ml-2 space-y-1">
														{subcategory.subcategories.map((child) => (
															<li key={child.slug}>
																{/* Level 3 becomes filter via query param */}
																<Link
																	href={`/${category.slug}/${subcategory.slug}?segment=${child.slug}`}
																	className="text-muted-foreground hover:text-foreground text-sm transition-colors">
																	{child.name}
																</Link>
															</li>
														))}
													</ul>
												)}
											</li>
										))}
									</ul>
								</NavigationMenuContent>
							</>
						) : (
							<NavigationMenuLink asChild>
								<Link
									href={`/${category.slug}`}
									className="hover:bg-accent hover:text-accent-foreground block rounded-md px-4 py-2 text-sm font-medium transition-colors">
									{category.name}
								</Link>
							</NavigationMenuLink>
						)}
					</NavigationMenuItem>
				))}

				<NavigationMenuItem>
					<NavigationMenuLink asChild>
						<Link
							href="/categories"
							className="hover:bg-accent hover:text-accent-foreground block rounded-md px-4 py-2 text-sm font-medium transition-colors">
							{t("category.viewAll")}
						</Link>
					</NavigationMenuLink>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
}

const ListItem = React.forwardRef<
	React.ElementRef<"a">,
	React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
	return (
		<li>
			<NavigationMenuLink asChild>
				<a
					ref={ref}
					className={cn(
						"hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none",
						className,
					)}
					{...props}>
					<div className="text-sm leading-none font-medium">{title}</div>
					<p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
						{children}
					</p>
				</a>
			</NavigationMenuLink>
		</li>
	);
});
ListItem.displayName = "ListItem";
