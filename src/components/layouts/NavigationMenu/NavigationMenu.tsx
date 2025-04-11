"use client";

import * as React from "react";

import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
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

	return (
		<NavigationMenu className="hidden w-full md:flex">
			<NavigationMenuList className="flex max-w-full gap-2 px-2">
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
									<ul className="grid max-h-[400px] w-[1250px] gap-3 p-4 md:grid-cols-2">
										{category.subcategories.map((subcategory) => (
											<ListItem
												key={subcategory.slug}
												title={subcategory.name}
												href={`/${category.slug}/${subcategory.slug}`}>
												Shop all {subcategory.name.toLowerCase()} items.
											</ListItem>
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
