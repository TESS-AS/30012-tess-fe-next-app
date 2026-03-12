"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { ZoomImage } from "../ui/zoom-image";

interface ProductImage {
	filename: string;
	picture_type: string;
	thumbnail_url: string;
	url: string;
}

interface ProductGalleryProps {
	images: ProductImage[];
	className?: string;
}

export function ProductGallery({ images, className }: ProductGalleryProps) {
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		if (images && images.length > 0) {
			setCurrentIndex(0);
		}
	}, [images]);

	if (!images || images.length === 0) {
		return (
			<div className="grid grid-cols-12 gap-4">
				<div className="col-span-12">
					<div className="flex aspect-square w-full items-center justify-center bg-gray-100">
						<p>No images available</p>
					</div>
				</div>
			</div>
		);
	}

	const selectedImage = images[Math.min(currentIndex, images.length - 1)]!;

	const canGoPrev = currentIndex > 0;
	const canGoNext = currentIndex < images.length - 1;

	const handlePrev = () => {
		if (!canGoPrev) return;
		setCurrentIndex((prev) => Math.max(0, prev - 1));
	};

	const handleNext = () => {
		if (!canGoNext) return;
		setCurrentIndex((prev) => Math.min(images.length - 1, prev + 1));
	};

	return (
		<div className={cn("grid grid-cols-12 items-stretch gap-4", className)}>
			<div className="col-span-12 flex justify-center">
				<div className="w-full max-w-[562px] px-4">
					<ZoomImage
						src={selectedImage.url}
						alt={selectedImage.filename}
						width={562}
						height={384}
						className="aspect-square w-full rounded-lg object-contain"
						priority
						sizes="(min-width: 1024px) 562px, (min-width: 768px) 50vw, 100vw"
					/>

					{/* Simple image pager: ← 1 of N → */}
					{images.length > 1 && (
						<div className="mt-4 flex items-center justify-center gap-6">
							<Button
								type="button"
								variant="outline"
								size="icon"
								className="h-9 w-9 rounded-md border-[#E1E3E2] bg-[#F8F9F8] text-[#2D3530]"
								disabled={!canGoPrev}
								onClick={handlePrev}>
								<ArrowLeft className="h-4 w-4" />
							</Button>
							<span className="text-sm text-[#5A615D]">
								{currentIndex + 1} of {images.length}
							</span>
							<Button
								type="button"
								variant="outline"
								size="icon"
								className="h-9 w-9 rounded-md border-[#E1E3E2] bg-[#F8F9F8] text-[#2D3530]"
								disabled={!canGoNext}
								onClick={handleNext}>
								<ArrowRight className="h-4 w-4" />
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
