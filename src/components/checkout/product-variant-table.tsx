"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { addToCart } from "@/services/carts.service";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import Image from "next/image";

interface ProductVariant {
	content_unit: string;
	item_id: number;
	item_number: string;
	media_id?: Array<any>;
	parent_prod_number: string;
	unspsc?: string | null;
	quantity?: number;
}

interface ProductVariantTableProps {
	variants: ProductVariant[];
	productNumber: string;
}

export default function ProductVariantTable({
	variants,
	productNumber
}: ProductVariantTableProps) {
	const t = useTranslations();
	const [quantities, setQuantities] = useState<Record<number, number>>({});
	const [loading, setLoading] = useState<Record<number, boolean>>({});
	const [isLoading, setIsLoading] = useState(true);

	// Simulate loading state
	useEffect(() => {
		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 1000);
		return () => clearTimeout(timer);
	}, []);

	if (isLoading) {
		return (
			<div className="mt-4 space-y-4">
				<div className="h-8 w-full animate-pulse rounded bg-muted" />
				{[...Array(3)].map((_, i) => (
					<div key={i} className="h-16 w-full animate-pulse rounded bg-muted" />
				))}
			</div>
		);
	}

	if (!variants || variants.length === 0) {
		return (
			<div className="mt-4 flex min-h-[200px] items-center justify-center">
				<p className="text-sm text-muted-foreground">{t('Product.noVariants')}</p>
			</div>
		);
	}

	return (
		<div className="mt-4">
			<Table className="rounded-md border">
				<TableHeader className="bg-muted text-muted-foreground">
					<TableRow>
						<TableHead>Image</TableHead>
						<TableHead>Item Number</TableHead>
						<TableHead>Item Id</TableHead>
						<TableHead>UNSPSC</TableHead>
						<TableHead>Unit</TableHead>
						<TableHead>Qty</TableHead>
						<TableHead className="w-[100px]">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{variants.map((variant, i) => (
						<TableRow key={variant.item_id || i}>
							<TableCell>
								{variant.media_id?.[0]?.url ? (
									<Image 
										src={variant.media_id[0].url} 
										alt={variant.item_number} 
										width={60} 
										height={60}
										className="object-contain" 
									/>
								) : (
									<div className="w-[60px] h-[60px] bg-muted" />
								)}
							</TableCell>
							<TableCell>{variant.item_id}</TableCell>
							<TableCell>{variant.item_number}</TableCell>
							<TableCell>{variant.unspsc || '-'}</TableCell>
							<TableCell>{variant.content_unit || 'STK'}</TableCell>
							<TableCell>
								<div className="flex items-center gap-2">
									<Button
										size="icon"
										variant="outline"
										disabled={!quantities[variant.item_id] || quantities[variant.item_id] <= 1}
										onClick={() => setQuantities(prev => ({
											...prev,
											[variant.item_id]: Math.max(1, (prev[variant.item_id] || 1) - 1)
										}))}>
										<Minus className="h-4 w-4" />
									</Button>
									<Input
										type="number"
										value={quantities[variant.item_id] || 1}
										className="w-16 text-center"
										onChange={(e) => setQuantities(prev => ({
											...prev,
											[variant.item_id]: Math.max(1, parseInt(e.target.value) || 1)
										}))}
									/>
									<Button
										size="icon"
										variant="outline"
										onClick={() => setQuantities(prev => ({
											...prev,
											[variant.item_id]: (prev[variant.item_id] || 1) + 1
										}))}>
										<Plus className="h-4 w-4" />
									</Button>
								</div>
							</TableCell>
							<TableCell>
								<Button
									variant="ghost"
									size="sm"
									disabled={loading[variant.item_id]}
									onClick={async () => {
										setLoading(prev => ({ ...prev, [variant.item_id]: true }));
										try {
											const response = await addToCart({
												productNumber: productNumber,
												itemNumber: variant.item_number,
												quantity: quantities[variant.item_id] || 1,
												warehouseNumber: "1",
												companyNumber: "1"
											});

											if (response.message === "Error adding to cart") {
												throw new Error(response.message);
											}

											toast(t("Product.addedToCart"), { type: "success" });
											
											// Reset quantity after successful add
											setQuantities(prev => ({ ...prev, [variant.item_id]: 1 }));
										} catch (error) {
											console.error("Error adding to cart:", error);
											toast(t("Product.errorAddingToCart"), { type: "error" });
										} finally {
											setLoading(prev => ({ ...prev, [variant.item_id]: false }));
										}
									}}
									className="text-primary hover:text-primary/80">
									{loading[variant.item_id] ? t("Product.adding") : t("Product.addToCart")}
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
