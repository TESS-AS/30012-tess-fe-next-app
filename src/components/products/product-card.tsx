"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
	id: string;
	name: string;
	price: number;
	image: string;
	category: string;
	href?: string;
	className?: string;
	aspectRatio?: "portrait" | "square";
	variant?: "default" | "compact";
}

export function ProductCard({
	id,
	name,
	price,
	image,
	category,
	href,
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
				{image ? (
					<Image
						src={image}
						alt={name}
						fill
						className="object-cover transition-transform group-hover:scale-105"
					/>
				) : (
					<div className="bg-muted h-full w-full" />
				)}
			</div>
			<div className={cn("mt-4", variant === "compact" && "mt-2")}>
				<h3
					className={cn(
						"line-clamp-2 font-medium",
						variant === "compact" ? "text-sm" : "text-base",
					)}>
					{name}
				</h3>
				<p
					className={cn(
						"text-muted-foreground mt-1",
						variant === "compact" ? "text-xs" : "text-sm",
					)}>
					${price.toFixed(2)}
				</p>
				{variant === "default" && (
					<p className="text-muted-foreground/60 mt-1 text-xs capitalize">
						{category}
					</p>
				)}
			</div>
		</div>
	);

	if (href) {
		return (
			<Link
				href={href}
				className="block">
				{content}
			</Link>
		);
	}

	return content;
}
