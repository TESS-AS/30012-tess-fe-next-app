"use client";

import * as React from "react";
import { useState, useEffect } from "react";

import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsBaneNorKatalog } from "@/hooks/useIsBaneNorKatalog";
import { getCategoryImage } from "@/lib/category-utils";
import { cn } from "@/lib/utils";
import { useNavMenuStore } from "@/stores/useNavMenuStore";
import type { Category } from "@/types/categories.types";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function CategoryNavigationMenu({
	categories,
	loading,
	selectedAssortment,
}: {
	categories: Category[];
	loading: boolean;
	selectedAssortment?: string;
}) {
	const t = useTranslations();
	const [query, setQuery] = useState("");
	const [openMenu, setOpenMenu] = useState<any>(false);
	const { setIsOpen } = useNavMenuStore();
	const isBaneNorKatalog = useIsBaneNorKatalog(selectedAssortment);

	return (
		<NavigationMenu
			value={openMenu}
			onValueChange={(val) => {
				setOpenMenu(val);
				setIsOpen(!!val);
			}}
			className="container hidden w-full justify-between md:flex">
			<NavigationMenuList className="container flex w-full max-w-full justify-center gap-2 px-0">
				{loading
					? Array.from({ length: 7 }).map((_, i) => (
							<NavigationMenuItem key={i}>
								<Skeleton className="h-8 w-24 rounded-md" />
							</NavigationMenuItem>
						))
					: categories?.slice(0, 7).map((category) => (
							<NavigationMenuItem
								key={category.slug}
								value={category.slug}>
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
											<ul className="xs:columns-2 container min-h-[500px] min-w-[calc(100vw-200px)] gap-x-1 overflow-y-scroll p-2 sm:columns-3 md:columns-4">
												{category.subcategories.map((subcategory) => {
													const subcategoryImage = getCategoryImage(subcategory);
													return (
														<li
															key={subcategory.slug}
															className="mb-8 break-inside-avoid">
															<div className="relative mb-2">
																{subcategoryImage && (
																	<img
																		src={subcategoryImage}
																		alt={subcategory.name}
																		className="absolute top-0 left-5 h-15 w-15 object-contain"
																	/>
																)}
																<div
																	className={`text-md font-bold ${subcategoryImage ? "pl-24" : ""}`}>
																	<Link
																		onClick={() => setOpenMenu(false)}
																		href={`/${category.slug}/${subcategory.slug}`}
																		className="hover:underline">
																		{subcategory.name}
																	</Link>
																</div>
															</div>
															{Array.isArray(subcategory.subcategories) &&
																subcategory.subcategories && (
																	<ul
																		className={`space-y-1 ${subcategoryImage ? "pl-24" : ""}`}>
																	{subcategory.subcategories.map((child) => (
																		<li key={child.slug}>
																			<Link
																				onClick={() => setOpenMenu(false)}
																				href={`/${category.slug}/${subcategory.slug}/${child.slug}`}
																				className="hover:text-foreground text-md font-medium text-gray-700 transition-colors">
																				{child.name}
																			</Link>
																		</li>
																	))}

																	{!isBaneNorKatalog && (
																		<li>
																			<Link
																				onClick={() => setOpenMenu(false)}
																				href={`/${category.slug}/${subcategory.slug}`}
																				className="text-md border-b-1 border-[#009640] pb-[1px] font-medium text-[#009640] hover:text-[#009640]">
																				{`Alle ${subcategory.name}`}
																			</Link>
																		</li>
																	)}
																</ul>
															)}
														</li>
													);
												})}
											</ul>
										</NavigationMenuContent>
									</>
								) : (
									<NavigationMenuLink asChild>
										<Link
											href={`/${category.slug}`}
											className="hover:bg-accent hover:text-accent-foreground text-md block rounded-md px-4 py-2 font-medium transition-colors">
											{category.name}
										</Link>
									</NavigationMenuLink>
								)}
							</NavigationMenuItem>
						))}
				{!loading && categories?.length > 0 && (
					<NavigationMenuItem className="flex items-center">
						<NavigationMenuLink
							asChild
							className="hover:!bg-transparent focus:!bg-transparent">
							<div className="flex flex-shrink-0 flex-nowrap items-center overflow-hidden text-ellipsis whitespace-nowrap">
								<Link
									href="/alle-kategorier"
									className="text-foreground hover:text-foreground group flex items-center gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 text-sm font-medium transition-all duration-300 ease-out hover:border-emerald-500 hover:bg-transparent focus:bg-transparent">
									{t("Category.viewAll")}
									<ChevronRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
								</Link>
							</div>
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
					<p className="text-muted-foreground text-md line-clamp-2 leading-snug">
						{children}
					</p>
				</a>
			</NavigationMenuLink>
		</li>
	);
});
ListItem.displayName = "ListItem";
