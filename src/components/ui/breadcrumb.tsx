"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

interface BreadcrumbItem {
	href: string;
	label: string;
	current?: boolean;
}

interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
	items: BreadcrumbItem[];
	separator?: React.ReactNode;
	showHome?: boolean;
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
	({ className, items, separator, showHome = true, ...props }, ref) => {
		const Separator = separator || <ChevronRight className="h-4 w-4" />;

		return (
			<nav
				ref={ref}
				aria-label="breadcrumb"
				className={cn(
					"text-muted-foreground inline-flex items-center space-x-2 text-sm",
					className,
				)}
				{...props}>
				<ol className="inline-flex items-center space-x-2">
					{showHome && (
						<li className="inline-flex items-center">
							<Link
								href="/"
								className="text-muted-foreground hover:text-foreground inline-flex items-center">
								<Home className="h-4 w-4" />
								<span className="sr-only">Home</span>
							</Link>
						</li>
					)}
					{items.map((item, index) => {
						const isLast = index === items.length - 1;
						const linkClassName = cn("hover:text-foreground capitalize", {
							"text-foreground pointer-events-none font-semibold":
								item.current || isLast,
							"text-muted-foreground": !item.current && !isLast,
						});

						return (
							<React.Fragment key={item.href}>
								{index > 0 || showHome ? (
									<li
										aria-hidden="true"
										className="text-muted-foreground/40 select-none">
										{Separator}
									</li>
								) : null}
								<li className="inline-flex items-center">
									<Link
										href={item.href}
										className={linkClassName}
										aria-current={item.current || isLast ? "page" : undefined}>
										{item.label}
									</Link>
								</li>
							</React.Fragment>
						);
					})}
				</ol>
			</nav>
		);
	},
);

Breadcrumb.displayName = "Breadcrumb";

export { Breadcrumb, type BreadcrumbItem };
