"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { addToCart } from "@/services/carts.service";
import { IVariation } from "@/types/product.types";
import { ShoppingCart, Heart, Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

export interface ProductActionsProps {
	items: IVariation[];
	productNumber: string;
}

export function ProductActions({ items, productNumber }: ProductActionsProps) {
	const t = useTranslations();
	const [selectedSize, setSelectedSize] = useState<string>();
	const [quantity, setQuantity] = useState(1);
	const [isLoading, setIsLoading] = useState(false);

	const handleAddToCart = async () => {
		if (!selectedSize) return;

		setIsLoading(true);
		try {
			const response = await addToCart(1, {
				product_number: productNumber,
				item_number: selectedSize,
				quantity: quantity,
				warehouse_number: "1",
				company_number: "1"
			});

			if (response.message === "Error adding to cart") {
				throw new Error(response.message);
			}

			toast(t("Product.addedToCart"), { type: "success" });
		} catch (error) {
			console.error("Error adding to cart:", error);
			toast(t("Product.errorAddingToCart"), { type: "error" });
		} finally {
			setIsLoading(false);
		}
	};

	const handleAddToWishlist = async () => {
		setIsLoading(true);
		try {
			await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="mt-6 space-y-6">
			{/* <div>
				<label className="mb-2 block text-sm font-medium">
					{t("Product.selectSize")}
				</label>
				<Select
					value={selectedSize}
					onValueChange={setSelectedSize}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder={t("Product.selectSize")} />
					</SelectTrigger>
					<SelectContent>
						{items.map((item) => (
							<SelectItem
								key={item.item_id}
								value={item.item_number}>
								<div className="flex items-center justify-between gap-1">
									<span className="font-medium">{item.item_number}</span> -
									<span className="text-muted-foreground text-sm italic">
										{item.unspsc}
									</span>
								</div>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div> */}

			<div className="flex gap-4">
				<Button
					onClick={handleAddToCart}
					disabled={!selectedSize || isLoading}
					size="lg">
					<ShoppingCart className="mr-2 h-5 w-5" />
					{isLoading ? t("Product.adding") : t("Product.addToCart")}
				</Button>
				<Button
					onClick={handleAddToWishlist}
					variant="outline"
					disabled={isLoading}
					size="lg">
					<Heart className="mr-2 h-5 w-5" />
					{t("Product.addToWishlist")}
				</Button>
			</div>
		</div>
	);
}
