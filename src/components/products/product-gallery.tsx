"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

import { ZoomImage } from "../ui/zoom-image";

interface ProductImage {
	id: string;
	url: string;
	alt: string;
}

interface ProductGalleryProps {
	images: ProductImage[];
	className?: string;
}

export function ProductGallery({ images, className }: ProductGalleryProps) {
	const [selectedImage, setSelectedImage] = useState(images[0]);

	return (
		<div className={cn("grid grid-cols-12 gap-4", className)}>
			{/* Thumbnails */}
			<div className="col-span-2 flex flex-col gap-4">
				{images.map((image) => (
					<Button
						key={image.id}
						onClick={() => setSelectedImage(image)}
						variant="ghost"
						className={cn(
							"bg-muted relative aspect-square h-auto w-full overflow-hidden rounded-lg border-2 p-0 transition-all hover:opacity-80",
							selectedImage.id === image.id
								? "border-primary"
								: "border-transparent",
						)}>
						<Image
							src={image.url}
							alt={image.alt}
							width={100}
							height={100}
							className="h-full w-full object-cover"
						/>
					</Button>
				))}
			</div>

			{/* Main Image with Zoom */}
			<div className="col-span-10">
				<ZoomImage
					src={selectedImage.url}
					alt={selectedImage.alt}
					width={800}
					height={800}
					className="aspect-square"
				/>
			</div>
		</div>
	);
}
