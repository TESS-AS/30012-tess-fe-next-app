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
import { IVariation } from "@/types/product.types";
import { ShoppingCart, Heart } from "lucide-react";
import { useTranslations } from "next-intl";

export interface ProductActionsProps {
	items: IVariation[];
}

export function ProductActions({ items }: ProductActionsProps) {
	const t = useTranslations();
	const [selectedSize, setSelectedSize] = useState<string>();
	const [isLoading, setIsLoading] = useState(false);

	const handleAddToCart = async () => {
		setIsLoading(true);
		try {
			await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
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
		<div className="mt-6 space-y-4">
			<div>
				<label className="mb-2 block text-sm font-medium">
					{t("product.selectSize")}
				</label>
				<Select
					value={selectedSize}
					onValueChange={setSelectedSize}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder={t("product.selectSize")} />
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
			</div>

			<div className="flex gap-4">
				<Button
					onClick={handleAddToCart}
					disabled={!selectedSize || isLoading}
					size="lg">
					<ShoppingCart className="mr-2 h-5 w-5" />
					{isLoading ? t("product.adding") : t("product.addToCart")}
				</Button>
				<Button
					onClick={handleAddToWishlist}
					variant="outline"
					disabled={isLoading}
					size="lg">
					<Heart className="mr-2 h-5 w-5" />
					{t("product.addToWishlist")}
				</Button>
			</div>
		</div>
	);
}
