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
import { mockCategories as categories } from "@/mocks/mockCategories";

export default function CategoryNavigationMenu() {
	return (
		<NavigationMenu className="hidden md:flex">
			<NavigationMenuList>
				{categories.map((category) => (
					<NavigationMenuItem key={category.slug}>
						<NavigationMenuTrigger>{category.name}</NavigationMenuTrigger>
						<NavigationMenuContent>
							<ul className="grid w-[1250px] gap-3 p-4 md:grid-cols-2">
								{category.subcategories?.map((subcategory) => (
									<ListItem
										key={subcategory.slug}
										title={subcategory.name}
										href={`/${category.slug}/${subcategory.slug}`}>
										Shop all {subcategory.name.toLowerCase()} items.
									</ListItem>
								))}
							</ul>
						</NavigationMenuContent>
					</NavigationMenuItem>
				))}
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
