"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Expand, X } from "lucide-react";
import Image from "next/image";

import { Skeleton } from "./skeleton";

interface ZoomImageProps {
	src: string;
	alt: string;
	width: number;
	height: number;
	className?: string;
	/** Load immediately (for above-the-fold hero images); avoids lazy-load delay in prod */
	priority?: boolean;
	/** Hint for responsive image size; reduces payload and speeds up first paint */
	sizes?: string;
}

export function ZoomImage({
	src,
	alt,
	width,
	height,
	className,
	priority = false,
	sizes = "(min-width: 1024px) 550px, (min-width: 768px) 50vw, 100vw",
}: ZoomImageProps) {
	const [isLoading, setIsLoading] = useState(true);
	const [isZoomed, setIsZoomed] = useState(false);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [isFullscreen, setIsFullscreen] = useState(false);

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!isZoomed) return;

		const rect = e.currentTarget.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width) * 100;
		const y = ((e.clientY - rect.top) / rect.height) * 100;

		setPosition({ x, y });
	};

	const handleFullscreen = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsFullscreen(true);
	};

	return (
		<>
			<div
				className={cn(
					"group relative overflow-hidden rounded-lg",
					isZoomed && "cursor-zoom-out",
					!isZoomed && "cursor-zoom-in",
					className,
				)}
				style={{ maxWidth: width, maxHeight: height }}
				onMouseMove={handleMouseMove}
				onMouseEnter={() => setIsZoomed(true)}
				onMouseLeave={() => setIsZoomed(false)}>
				{isLoading && (
					<Skeleton
						className={cn(
							"absolute inset-0 z-10",
							isLoading ? "animate-pulse" : "hidden",
						)}
					/>
				)}
				<Image
					src={src}
					alt={alt}
					width={width}
					height={height}
					quality={80}
					priority={priority}
					loading={priority ? "eager" : "lazy"}
					sizes={sizes}
					className={cn(
						"h-full w-full object-contain transition-all duration-300",
						isLoading ? "scale-110 blur-sm" : "blur-0 scale-100",
						isZoomed ? "scale-150" : "scale-100",
					)}
					style={
						isZoomed
							? {
									transformOrigin: `${position.x}% ${position.y}%`,
								}
							: undefined
					}
					onLoad={() => setIsLoading(false)}
				/>
				<Button
					onClick={handleFullscreen}
					size="icon"
					variant="secondary"
					className="absolute top-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
					<Expand className="h-5 w-5" />
				</Button>
			</div>

			{isFullscreen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
					onClick={() => setIsFullscreen(false)}>
					<div className="relative h-[70%] max-h-[70%] max-w-[60vw]">
						<Image
							src={src}
							alt={alt}
							width={width}
							height={height}
							className="h-full max-h-[100vh] w-full object-contain"
						/>
						<Button
							onClick={() => setIsFullscreen(false)}
							size="icon"
							variant="secondary"
							className="absolute top-4 right-4">
							<X className="h-5 w-5" />
						</Button>
					</div>
				</div>
			)}
		</>
	);
}
