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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/categories.types";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function CategoryNavigationMenu({
	categories,
	loading,
}: {
	categories: Category[];
	loading: boolean;
}) {
	const t = useTranslations();
	const [query, setQuery] = useState("");
	const [openMenu, setOpenMenu] = useState<any>(false);

	return (
		<NavigationMenu
			value={openMenu}
			onValueChange={setOpenMenu}
			className="hidden w-full justify-between md:flex">
			<NavigationMenuList className="flex w-full max-w-full justify-center gap-2 px-0">
				{loading
					? Array.from({ length: 7 }).map((_, i) => (
							<NavigationMenuItem key={i}>
								<Skeleton className="h-8 w-24 rounded-md" />
							</NavigationMenuItem>
						))
					: categories?.slice(0, 7).map((category) => (
							<NavigationMenuItem key={category.slug}>
								{category.subcategories?.length ? (
									<>
										<NavigationMenuTrigger
											onClick={(e) => {
												e.preventDefault();
												window.location.href = `/${category.slug}`;
											}}
											className={cn(
												"flex items-center gap-1 px-4 py-2 text-sm font-medium transition-all duration-300 ease-out",
												"border-b-2 border-transparent hover:border-emerald-500",
												"hover:bg-red rounded-none",
											)}>
											{category.name}
										</NavigationMenuTrigger>
										<NavigationMenuContent>
											<ul className="grid max-h-[800px] w-screen max-w-full min-w-screen gap-6 overflow-y-auto p-6 md:grid-cols-2 lg:grid-cols-3">
												{category.subcategories.map((subcategory) => (
													<li key={subcategory.slug}>
														<div className="mb-2 text-sm font-semibold">
															<Link
																onClick={() => setOpenMenu(false)}
																href={`/${category.slug}/${subcategory.slug}`}
																className="hover:underline">
																{subcategory.name}
															</Link>
														</div>
														{Array.isArray(subcategory.subcategories) &&
															subcategory.subcategories.length > 0 && (
																<ul className="space-y-1">
																	{/* first 5 children */}
																	{subcategory.subcategories
																		.slice(0, 5)
																		.map((child) => (
																			<li key={child.slug}>
																				<Link
																					onClick={() => setOpenMenu(false)}
																					href={`/${category.slug}/${subcategory.slug}/${child.slug}`}
																					className="hover:text-foreground text-sm font-light text-[#6B7280] transition-colors">
																					{child.name}
																				</Link>
																			</li>
																		))}

																	<li>
																		<Link
																			onClick={() => setOpenMenu(false)}
																			href={`/${category.slug}/${subcategory.slug}`}
																			className="border-b-1 border-[#009640] pb-[1px] text-sm font-medium text-[#009640] hover:text-[#009640]">
																			{`Alle ${subcategory.name}`}
																		</Link>
																	</li>
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
				{!loading && categories?.length > 0 && (
					<NavigationMenuItem className="flex items-center">
						<NavigationMenuLink asChild>
							<Link
								href="/categories"
								className="text-foreground hover:text-foreground group flex items-center gap-2 !rounded-none rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 text-sm font-medium transition-all duration-300 ease-out hover:border-emerald-500 hover:bg-transparent focus:bg-transparent">
								{t("Category.viewAll")}
								<ChevronRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
							</Link>
						</NavigationMenuLink>
					</NavigationMenuItem>
				)}
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
