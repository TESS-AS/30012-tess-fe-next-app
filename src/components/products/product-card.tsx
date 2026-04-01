"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { IProduct } from "@/types/product.types";
import { formatNorwegianCurrency } from "@/utils/formatCurrency";
import Image from "next/image";

interface ProductCardProps extends Partial<IProduct> {
	className?: string;
	aspectRatio?: "portrait" | "square";
	variant?: "default" | "compact";
	viewLayout?: string;
	priority?: boolean;
	isPriceLoading?: boolean;
}

export function ProductCard({
	productNumber = "-",
	productName = "",
	mediaM,
	shortDesc,
	price,
	searchAttribute1,
	searchAttribute2,
	className,
	aspectRatio = "square",
	variant = "default",
	viewLayout,
	priority = false,
	isPriceLoading = false,
}: ProductCardProps) {
	const [isLoaded, setIsLoaded] = useState(false);

	const formatPrice = (amount: number): string => {
		return `fra ${formatNorwegianCurrency(amount)}`;
	};

	return (
		<div
			className={cn(
				"group flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:shadow-lg",
				variant === "default" ? "p-2.5 sm:p-3 lg:p-4" : "p-2",
				viewLayout === "list" && "flex-row",
				className,
			)}>
			<div
				className={cn(
					"relative flex-shrink-0 overflow-hidden rounded-md",
					aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square",
					viewLayout === "list"
						? "me-2 w-[88px] shrink-0 sm:me-3 sm:w-32 md:me-4 md:w-[200px] lg:w-[250px]"
						: "",
				)}>
				{!isLoaded && <Skeleton className="absolute inset-0 h-full w-full" />}

				<Image
					src={mediaM ?? "/images/tess.webp"}
					alt={productName || "Product image"}
					fill
					priority={priority}
					loading={priority ? "eager" : "lazy"}
					sizes={
						viewLayout === "list"
							? "(max-width: 639px) 88px, (max-width: 1023px) 128px, 250px"
							: "(min-width: 1024px) 28vw, (min-width: 640px) 42vw, calc(100vw - 3rem)"
					}
					quality={90}
					className={cn(
						"object-contain transition-transform duration-300 group-hover:scale-105",
						!isLoaded && "opacity-0",
					)}
					onLoad={() => setIsLoaded(true)}
				/>
			</div>

			<div
				className={cn(
					"flex min-w-0 flex-1 flex-col",
					variant === "default" ? "mt-2 sm:mt-3 lg:mt-4" : "mt-2",
				)}>
				<h3 className="line-clamp-2 text-[18px] font-medium leading-snug text-gray-900 min-h-0 sm:min-h-[3rem] lg:min-h-[3.5rem]">
					{productName}
				</h3>
				{shortDesc && (
					<p className="mt-1 line-clamp-2 text-[16px] font-light leading-normal text-[#5A615D] sm:mt-2">
						{shortDesc}
					</p>
				)}
				{(searchAttribute1 || searchAttribute2) && (
					<div className="mt-2 flex flex-shrink-0 flex-wrap gap-2">
						{searchAttribute1 && (
							<span className="inline-flex items-center rounded-md border border-gray-300 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-500">
								{searchAttribute1}
							</span>
						)}
						{searchAttribute2 && (
							<span className="inline-flex items-center rounded-md border border-gray-300 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-500">
								{searchAttribute2}
							</span>
						)}
					</div>
				)}
				<div className="mt-auto flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:pt-3 lg:pt-4">
					{isPriceLoading ? (
						<Skeleton className="h-[18px] w-24" />
					) : price !== undefined ? (
						<p className="text-[18px] font-light leading-normal text-gray-900">
							{formatPrice(price)}
						</p>
					) : null}
					<Button
						variant="outlineGrey"
						size="sm"
						className="h-9 shrink-0 !text-sm text-gray-900 sm:h-[35px] transition-colors group-hover:border-[#00B84C] group-hover:bg-[#00B84C] group-hover:text-white hover:!bg-[#F0FCF2] hover:text-gray-900">
						Vis produkt
					</Button>
				</div>
			</div>
		</div>
	);
}
