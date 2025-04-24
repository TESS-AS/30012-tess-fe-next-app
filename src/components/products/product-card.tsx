"use client";

import { cn } from "@/lib/utils";
import { IProduct } from "@/types/product.types";
import Image from "next/image";
import { useState } from "react";

interface ProductCardProps extends IProduct {
	className?: string;
	aspectRatio?: "portrait" | "square";
	variant?: "default" | "compact";
	viewLayout?: string;
	priority?: boolean;
}

export function ProductCard({
	product_number,
	product_name,
	media_m,
	className,
	aspectRatio = "square",
	variant = "default",
	viewLayout,
	priority = false,
}: ProductCardProps) {
	const [isImageLoading, setIsImageLoading] = useState(true);

	const content = (
		<div
			className={cn(
				"group bg-background cursor-pointer overflow-hidden rounded-lg border transition-all hover:shadow-md",
				variant === "default" ? "p-4" : "p-2",
				viewLayout === "list" && "flex flex-row",
				className,
			)}>
			<div
				className={cn(
					" relative overflow-hidden rounded-md",
					aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square",
					viewLayout === "list" ? "w-[250px] me-4" : "",
					isImageLoading ? "animate-pulse" : "",
				)}>
				{media_m ? (
					<Image
						src={media_m}
						alt={product_name}
						fill
						priority={priority}
						loading={priority ? "eager" : "lazy"}
						sizes={
							viewLayout === "list"
								? "250px"
								: "(min-width: 1280px) 256px, (min-width: 1024px) 192px, (min-width: 768px) 256px, (min-width: 640px) 384px, calc(100vw - 48px)"
						}
						quality={75}
						className={cn(
							"object-contain",
							"transition-all duration-300",
							isImageLoading
								? "scale-110 blur-sm grayscale"
								: "scale-100 blur-0 grayscale-0",
							"group-hover:scale-105",
						)}
						onLoadingComplete={() => setIsImageLoading(false)}
					/>
				) : (
					<div className="bg-white h-full w-full">
						<Image
							src="/images/tess.webp"
							alt="Tess"
							fill
							priority={priority}
							loading={priority ? "eager" : "lazy"}
							sizes={
								viewLayout === "list"
									? "250px"
									: "(min-width: 1280px) 256px, (min-width: 1024px) 192px, (min-width: 768px) 256px, (min-width: 640px) 384px, calc(100vw - 48px)"
							}
							quality={75}
							className={cn(
								"object-contain",
								"transition-all duration-300",
								isImageLoading
									? "scale-110 blur-sm grayscale"
									: "scale-100 blur-0 grayscale-0",
								"group-hover:scale-105",
							)}
							onLoadingComplete={() => setIsImageLoading(false)}
						/>
					</div>
				)}
			</div>
			<div
				className={cn(
					"flex flex-col",
					variant === "default" ? "mt-4" : "mt-2",
				)}>
				<h3 className="min-h-[50px] text-sm font-medium">{product_name}</h3>
				<div className="text-muted-foreground mt-2 flex items-center justify-between text-sm">
					<p>{product_number}</p>
				</div>
			</div>
		</div>
	);

	return content;
}
