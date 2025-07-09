// ProductItem.tsx
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button"; // Adjust this import as needed
import {
	Modal,
	ModalHeader,
	ModalTitle,
} from "@/components/ui/modal"; // Adjust as needed
import { useGetProfileData } from "@/hooks/useGetProfileData";
import { Category, RawCategory } from "@/types/categories.types";
import { IProductSearch } from "@/types/search.types";
import { ShoppingCartIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import ProductVariantTable from "../checkout/product-variant-table";

interface Props {
	product: IProductSearch;
	attr:
		| {
				matchedAttributes: string[];
		  }
		| undefined;
	currentLocale: string;
	loadCategoryTree: (productNumber: string) => Promise<Category[]>;
	setSearchQuery: (query: string) => void;
	isModalIdOpen: string | null;
	setIsModalIdOpen: (id: string | null) => void;
	getProductVariations: (
		productNumber: string,
		warehouseNumber: string,
		companyNumber: string,
	) => Promise<any[]>;
	setVariations: (variations: Record<string, any>) => void;
	variations: Record<string, any>;
}

export function ProductItem({
	product,
	attr,
	currentLocale,
	loadCategoryTree,
	setSearchQuery,
	isModalIdOpen,
	setIsModalIdOpen,
	getProductVariations,
	setVariations,
	variations,
}: Props) {
	const { data: profile } = useGetProfileData();
	const [categoryPath, setCategoryPath] = useState("");

	useEffect(() => {
		const loadCategory = async () => {
			const categoryTree = await loadCategoryTree(product.productNumber);
			const path = categoryTree
				.slice(0, 3)
				.map((category: RawCategory) =>
					currentLocale === "en" ? category.nameEn : category.nameNo,
				)
				.join("/");
			setCategoryPath(path);
		};
		loadCategory();
	}, [product.productNumber, currentLocale]);

	return (
		<div key={product.productNumber}>
			<div className="flex w-full items-center justify-between gap-4 border-b p-3 hover:bg-gray-100">
				<Link
					className="flex flex-[0.8] items-center justify-between gap-4"
					href={`/${categoryPath}/${product.productNumber}`}
					onClick={() => setSearchQuery("")}>
					<div className="flex flex-col justify-center">
						<span className="text-base font-medium">{product.productName}</span>
						<span className="text-muted-foreground text-sm">
							{product.productNumber}
						</span>
						{attr && attr.matchedAttributes.length > 0 && (
							<div className="mt-2 flex flex-wrap gap-1">
								{attr.matchedAttributes.map((a, i) => (
									<span
										key={i}
										className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
										{a}
									</span>
								))}
							</div>
						)}
					</div>
				</Link>
				<div className="flex items-center gap-6">
					<Button
						variant="outline"
						size="sm"
						type="button"
						onClick={async (e) => {
							e.preventDefault();
							setIsModalIdOpen(product.productNumber);
							const productVariations = await getProductVariations(
								product.productNumber,
								profile?.defaultWarehouseNumber || "",
								profile?.defaultCompanyNumber || "",
							);
							setVariations((prev: Record<string, any>) => ({
								...prev,
								[product.productNumber]: productVariations,
							}));
						}}>
						<ShoppingCartIcon className="h-2 w-2" />
					</Button>
					<div className="flex h-32 w-32 min-w-32 items-center justify-center overflow-hidden rounded-md">
						{product.media ? (
							<Image
								src={product.media}
								alt={product.productName}
								unoptimized
								width={128}
								height={128}
								className="max-h-23 max-w-32 object-contain"
							/>
						) : (
							<div className="h-32 w-32 rounded bg-gray-300" />
						)}
					</div>
				</div>
			</div>

			<Modal
				open={isModalIdOpen === product.productNumber}
				onOpenChange={(open) => {
					if (!open) {
						setIsModalIdOpen(null);
						setVariations((prev: Record<string, any>) => ({
							...prev,
							[product.productNumber]: [],
						}));
					}
				}}>
					<ModalHeader>
						<ModalTitle>Product Variants - {product.productName}</ModalTitle>
					</ModalHeader>
					<div className="max-h-[70vh] overflow-y-auto px-1">
						<ProductVariantTable
							variants={variations[product.productNumber]}
							productNumber={product.productNumber}
						/>
					</div>
			</Modal>
		</div>
	);
}
