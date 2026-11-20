"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

interface BreadcrumbItem {
	href: string;
	label: string;
	current?: boolean;
	onClick?: (e: React.MouseEvent) => void;
}

interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
	items: BreadcrumbItem[];
	separator?: React.ReactNode;
	/** Kept for backwards compatibility with existing callers — no longer
	 *  controls a separate icon row. The home-icon treatment is applied
	 *  automatically to the first item when its href is "/". */
	showHome?: boolean;
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
	({ className, items, separator, ...props }, ref) => {
		const Separator = separator || (
			<ChevronRight className="h-4 w-4 text-[#5A615D]" />
		);

		// Only the explicit `current`-flagged item (or the last one as fallback)
		// is rendered as the dead-leaf style. Everything else gets the green
		// underline treatment.
		const currentIndex = (() => {
			const explicit = items.findIndex((i) => i.current);
			return explicit >= 0 ? explicit : items.length - 1;
		})();

		return (
			<nav
				ref={ref}
				aria-label="breadcrumb"
				className={cn(
					"inline-flex items-center text-[14px] leading-[150%]",
					className,
				)}
				{...props}>
				<ol className="inline-flex items-center gap-2">
					{items.map((item, index) => {
						const isCurrent = index === currentIndex;
						const isHome = index === 0 && item.href === "/";

						const labelNode = (
							<>
								{isHome && (
									<Home
										className="mr-1.5 h-4 w-4 text-[#009640]"
										strokeWidth={2}
									/>
								)}
								{item.label}
							</>
						);

						const content = isCurrent ? (
							<span
								aria-current="page"
								className="inline-flex items-center font-medium text-[#5A615D]">
								{labelNode}
							</span>
						) : item.onClick ? (
							<button
								onClick={item.onClick}
								className="inline-flex cursor-pointer items-center text-[#009640] underline underline-offset-4 hover:text-[#005222]">
								{labelNode}
							</button>
						) : (
							<Link
								href={item.href}
								className="inline-flex items-center text-[#009640] underline underline-offset-4 hover:text-[#005222]">
								{labelNode}
							</Link>
						);

						return (
							<React.Fragment key={`${item.href}-${index}`}>
								{index > 0 && (
									<li
										aria-hidden="true"
										className="select-none">
										{Separator}
									</li>
								)}
								<li className="inline-flex items-center">{content}</li>
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
