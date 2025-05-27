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
}

export function ZoomImage({
	src,
	alt,
	width,
	height,
	className,
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
					quality={90}
					priority={false}
					loading="lazy"
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
					<div className="relative max-h-[90vh] max-w-[90vw]">
						<Image
							src={src}
							alt={alt}
							width={width * 2}
							height={height * 2}
							className="h-auto w-auto object-contain"
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
