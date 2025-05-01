"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

import { Skeleton } from "../ui/skeleton";
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
	const [selectedImage, setSelectedImage] = useState<ProductImage>(
		images[0] || {
			filename: "",
			picture_type: "",
			thumbnail_url: "",
			url: "",
		},
	);

	const [loadedImages, setLoadedImages] = useState<{ [key: number]: boolean }>(
		{},
	);

	const handleImageLoad = (index: number) => {
		setLoadedImages((prev) => ({
			...prev,
			[index]: true,
		}));
	};

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

	return (
		<div className={cn("grid grid-cols-12 gap-4", className)}>
			{/* Thumbnails */}
			<div className="col-span-2 flex flex-col gap-4">
				{images.map((image, index) => (
					<Button
						key={image.filename}
						onClick={() => setSelectedImage(image)}
						variant="ghost"
						className={cn(
							"relative aspect-square h-20 w-20 w-full border-2 p-0",
							selectedImage.filename === image.filename
								? "border-primary"
								: "border-transparent",
						)}>
						{!loadedImages[index] && (
							<Skeleton className="absolute inset-0 z-10" />
						)}
						<Image
							src={image.thumbnail_url || image.url}
							alt={image.filename}
							width={100}
							height={100}
							quality={60}
							loading="lazy"
							className={cn(
								"h-full w-full rounded-md object-contain transition-all duration-300",
								!loadedImages[index] && "scale-110 blur-sm",
							)}
							onLoad={() => handleImageLoad(index)}
						/>
					</Button>
				))}
			</div>

			{/* Main Image with Zoom */}
			<div className="col-span-10">
				<ZoomImage
					src={selectedImage.url}
					alt={selectedImage.filename}
					width={800}
					height={800}
					className="aspect-square"
				/>
			</div>
		</div>
	);
}
