"use client";

import { useState } from "react";

import { SizeSelector } from "@/components/products/size-selector";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";

// Mock sizes - in a real app, this would come from your backend
const productSizes = [
	{ value: "xs", label: "XS", inStock: true },
	{ value: "s", label: "S", inStock: true },
	{ value: "m", label: "M", inStock: true },
	{ value: "l", label: "L", inStock: false },
	{ value: "xl", label: "XL", inStock: true },
];

export interface ProductActionsProps {
	productId: string;
}

export function ProductActions({ productId }: ProductActionsProps) {
	const t = useTranslations();
	const [selectedSize, setSelectedSize] = useState<string>();
	const [isLoading, setIsLoading] = useState(false);

	const handleAddToCart = async () => {
		setIsLoading(true);
		try {
			console.log("Adding to cart:", { productId, size: selectedSize });
			await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col gap-6">
			{/* Size Selector */}
			<div>
				<label className="mb-2 block text-sm font-medium">
					{t("product.selectSize")}
				</label>
				<SizeSelector
					sizes={productSizes}
					selectedSize={selectedSize}
					onSelect={setSelectedSize}
				/>
			</div>

			{/* Add to Cart */}
			<Button
				onClick={handleAddToCart}
				disabled={!selectedSize || isLoading}
				size="lg">
				<ShoppingCart />
				{isLoading ? t("product.adding") : t("product.addToCart")}
			</Button>
		</div>
	);
}
