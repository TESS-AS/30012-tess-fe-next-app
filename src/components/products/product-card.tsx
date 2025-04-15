"use client";

import { cn } from "@/lib/utils";
import { IProduct } from "@/types/product.types";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps extends IProduct {
	className?: string;
	aspectRatio?: "portrait" | "square";
	variant?: "default" | "compact";
}

export function ProductCard({
	product_number,
	product_name,
	media_m,
	className,
	aspectRatio = "square",
	variant = "default",
}: ProductCardProps) {
	const content = (
		<div
			className={cn(
				"group bg-background overflow-hidden rounded-lg border transition-all hover:shadow-md",
				variant === "default" ? "p-4" : "p-2",
				className,
			)}>
			<div
				className={cn(
					"bg-muted relative overflow-hidden rounded-md",
					aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square",
				)}>
				{media_m ? (
					<Image
						src={media_m}
						alt={product_name}
						fill
						className="object-cover transition-transform group-hover:scale-105"
					/>
				) : (
					<div className="bg-muted h-full w-full" />
				)}
			</div>
			<div className={cn("flex flex-col", variant === "default" ? "mt-4" : "mt-2")}>
				<h3 className="text-sm font-medium">{product_name}</h3>
				<div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
					<p>{product_number}</p>
				</div>
			</div>
		</div>
	);

	return content;
}
