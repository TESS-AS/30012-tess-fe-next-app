"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { IProduct } from "@/types/product.types";
import Image from "next/image";

interface ProductCardProps extends Partial<IProduct> {
	className?: string;
	aspectRatio?: "portrait" | "square";
	variant?: "default" | "compact";
	viewLayout?: string;
	priority?: boolean;
}

export function ProductCard({
	productNumber = "-",
	productName = "",
	mediaM,
	shortDesc,
	className,
	aspectRatio = "square",
	variant = "default",
	viewLayout,
	priority = false,
}: ProductCardProps) {
	const [isLoaded, setIsLoaded] = useState(false);

	return (
		<div
			className={cn(
				"group bg-background cursor-pointer overflow-hidden rounded-sm border border-gray-200 transition-all hover:shadow-md",
				variant === "default" ? "p-4" : "p-2",
				viewLayout === "list" && "flex flex-row",
				className,
			)}>
			<div
				className={cn(
					"relative overflow-hidden rounded-md",
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
					"flex flex-col",
					variant === "default" ? "mt-4" : "mt-2",
				)}>
				<h3 className="min-h-[30px] text-sm font-medium">{productName}</h3>
				<div className="text-muted-foreground mt-2 flex items-center justify-end text-sm">
					<Button
						variant="outlineGrey"
						size="sm"
						className="h-[35px] !text-sm">
						Vis mer
					</Button>
				</div>
				{viewLayout === "list" && shortDesc && (
					<div className="text-muted-foreground mt-2 flex items-center justify-between text-sm">
						<p>{shortDesc}</p>
					</div>
				)}
			</div>
		</div>
	);
}
