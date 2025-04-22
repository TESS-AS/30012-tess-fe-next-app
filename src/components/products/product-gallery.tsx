"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
    const [selectedImage, setSelectedImage] = useState<ProductImage>(images[0] || {
        filename: "",
        picture_type: "",
        thumbnail_url: "",
        url: ""
    });

    if (!images || images.length === 0) {
        return (
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12">
                    <div className="aspect-square w-full bg-gray-100 flex items-center justify-center">
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
                {images.map((image) => (
                    <Button
                        key={image.filename}
                        onClick={() => setSelectedImage(image)}
                        variant="ghost"
                        className={cn(
                            "relative aspect-square w-full w-20 h-20 p-0 border-2",
                            selectedImage.filename === image.filename
                                ? "border-primary"
                                : "border-transparent",
                        )}>
                        <Image
                            src={image.thumbnail_url || image.url}
                            alt={image.filename}
                            width={100}
                            height={100}
                            className="h-full w-full object-cover rounded-md"
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
