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
	attribute1,
	attribute2,
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
				variant === "default" ? "p-4" : "p-2",
				viewLayout === "list" && "flex-row",
				className,
			)}>
			<div
				className={cn(
					"relative flex-shrink-0 overflow-hidden rounded-md",
					aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square",
					viewLayout === "list" ? "me-4 w-[250px]" : "",
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
							? "250px"
							: "(min-width: 1280px) 256px, (min-width: 1024px) 192px, (min-width: 768px) 256px, (min-width: 640px) 384px, calc(100vw - 48px)"
					}
					quality={90}
					className={cn(
						"object-contain transition-transform duration-300 group-hover:scale-105",
						!isLoaded && "opacity-0",
					)}
					onLoadingComplete={() => setIsLoaded(true)}
				/>
			</div>

			<div
				className={cn(
					"flex flex-1 flex-col",
					variant === "default" ? "mt-4" : "mt-2",
				)}>
				<h3 className="text-md line-clamp-2 flex min-h-[3.5rem] items-start font-medium text-gray-900">
					{productName}
				</h3>
				{shortDesc && (
					<p className="mt-2 line-clamp-2 text-sm font-light text-[#5A615D]">
						{shortDesc}
					</p>
				)}
				{(attribute1 || attribute2) && (
					<div className="mt-2 flex flex-shrink-0 flex-wrap gap-2">
						{attribute1 && (
							<span className="inline-flex items-center rounded-md border border-gray-300 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-500">
								{attribute1}
							</span>
						)}
						{attribute2 && (
							<span className="inline-flex items-center rounded-md border border-gray-300 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-500">
								{attribute2}
							</span>
						)}
					</div>
				)}
				<div className="mt-auto flex items-center justify-between gap-2 pt-4">
					{isPriceLoading ? (
						<Skeleton className="h-5 w-24" />
					) : price !== undefined ? (
						<p className="text-md font-light text-gray-900">
							{formatPrice(price)}
						</p>
					) : null}
					<Button
						variant="outlineGrey"
						size="sm"
						className="h-[35px] !text-sm text-gray-900 transition-colors group-hover:border-[#00B84C] group-hover:bg-[#00B84C] group-hover:text-white hover:!bg-[#F0FCF2] hover:text-gray-900">
						Vis produkt
					</Button>
				</div>
			</div>
		</div>
	);
}
