"use client";

import { useState, useEffect } from "react";

import { cn } from "@/lib/utils";

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

	useEffect(() => {
		if (images && images.length > 0) {
			setSelectedImage(images[0]);
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

	return (
		<div className={cn("grid grid-cols-12 items-stretch gap-4", className)}>
			<div className="col-span-12">
				<div className="p-4">
					<ZoomImage
						src={selectedImage.url}
						alt={selectedImage.filename}
						width={550}
						height={350}
						className="aspect-square rounded-lg"
						priority
						sizes="(min-width: 1024px) 550px, (min-width: 768px) 50vw, 100vw"
					/>
				</div>
			</div>
		</div>
	);
}
