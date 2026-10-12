"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Expand, X } from "lucide-react";
import Image from "next/image";
import { createPortal } from "react-dom";

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
	/** Always show the expand control (default: reveal on hover) */
	alwaysShowExpand?: boolean;
	expandAriaLabel?: string;
	closeAriaLabel?: string;
}

export function ZoomImage({
	src,
	alt,
	width,
	height,
	className,
	priority = false,
	sizes = "(min-width: 1024px) 550px, (min-width: 768px) 50vw, 100vw",
	alwaysShowExpand = false,
	expandAriaLabel = "Expand image",
	closeAriaLabel = "Close",
}: ZoomImageProps) {
	const [isLoading, setIsLoading] = useState(true);
	const [isZoomed, setIsZoomed] = useState(false);
	const [position, setPosition] = useState({ x: 50, y: 50 });
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!isFullscreen) return;

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") setIsFullscreen(false);
		};
		window.addEventListener("keydown", onKeyDown);

		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [isFullscreen]);

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
					"group relative overflow-hidden rounded-lg bg-white",
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
					type="button"
					onClick={handleFullscreen}
					size="icon"
					variant="secondary"
					aria-label={expandAriaLabel}
					className={cn(
						"absolute top-3 right-3 h-8 w-8 border border-[#C1C4C2] bg-white text-[#0F1912] shadow-sm transition-opacity hover:bg-[#F3F4F3]",
						alwaysShowExpand
							? "opacity-100"
							: "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
					)}>
					<Expand className="h-4 w-4" />
				</Button>
			</div>

			{mounted &&
				isFullscreen &&
				createPortal(
					<div
						role="dialog"
						aria-modal="true"
						aria-label={alt}
						className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-[2px] sm:p-8"
						onClick={() => setIsFullscreen(false)}>
						<button
							type="button"
							aria-label={closeAriaLabel}
							onClick={() => setIsFullscreen(false)}
							className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/25 transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
							<X className="h-5 w-5" />
						</button>

						<figure
							className="relative flex max-h-full max-w-5xl flex-col items-center"
							onClick={(e) => e.stopPropagation()}>
							<div className="relative flex max-h-[min(85vh,900px)] w-full items-center justify-center overflow-hidden rounded-lg bg-white shadow-2xl">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={src}
									alt={alt}
									className="max-h-[min(85vh,900px)] w-auto max-w-full object-contain p-6 sm:p-10"
								/>
							</div>
							{alt ? (
								<figcaption className="mt-3 max-w-full truncate text-center text-sm text-white/80">
									{alt}
								</figcaption>
							) : null}
						</figure>
					</div>,
					document.body,
				)}
		</>
	);
}
