"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import type { Category } from "@/types/categories.types";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

interface MobileMenuProps {
	categories: Category[];
	loading: boolean;
	onClose: () => void;
}

export function MobileMenu({ categories, loading, onClose }: MobileMenuProps) {
	const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

	const toggleExpand = (slug: string) => {
		setExpandedSlug(expandedSlug === slug ? null : slug);
	};

	const handleNavigate = () => {
		setExpandedSlug(null);
		onClose();
	};

	if (loading) {
		return (
			<div className="bg-white">
				{Array.from({ length: 8 }).map((_, i) => (
					<div
						key={i}
						className="h-[53px] animate-pulse bg-gray-50"
					/>
				))}
			</div>
		);
	}

	return (
		<nav className="bg-white">
			{categories.map((category) => {
				const hasSubcategories = !!category.subcategories?.length;
				const isExpanded = expandedSlug === category.slug;

				return (
					<div key={category.slug}>
						{hasSubcategories ? (
							<>
								<button
									type="button"
									onClick={() => toggleExpand(category.slug)}
									className={cn(
										"flex min-h-[53px] w-full items-center justify-between gap-3 px-4 text-left",
									)}
								>
									<span className="text-sm font-semibold text-[#2D3530]">
										{category.name}
									</span>
									{isExpanded ? (
										<ChevronUp className="h-4 w-4 shrink-0 text-[#2D3530]" />
									) : (
										<ChevronDown className="h-4 w-4 shrink-0 text-[#2D3530]" />
									)}
								</button>
								{isExpanded && (
									<div>
										{category.subcategories!.map((sub) => (
											<Link
												key={sub.slug}
												href={`/${category.slug}/${sub.slug}`}
												onClick={handleNavigate}
												className="flex min-h-[53px] items-center px-4 text-left text-sm font-normal text-[#2D3530]"
											>
												{sub.name}
											</Link>
										))}
										<Link
											href={`/${category.slug}`}
											onClick={handleNavigate}
											className="flex min-h-[53px] items-center px-4 text-left text-sm font-normal text-[#2D3530]"
										>
											Alle {category.name.toLowerCase()}
										</Link>
									</div>
								)}
							</>
						) : (
							<Link
								href={`/${category.slug}`}
								onClick={handleNavigate}
								className="flex min-h-[53px] w-full items-center justify-between gap-3 px-4 text-left"
							>
								<span className="text-sm font-semibold text-[#2D3530]">
									{category.name}
								</span>
								<ChevronDown className="h-4 w-4 shrink-0 text-[#2D3530]" />
							</Link>
						)}
					</div>
				);
			})}
		</nav>
	);
}
