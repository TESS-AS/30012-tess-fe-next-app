// ProductItem.tsx
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Modal, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import { Category, RawCategory } from "@/types/categories.types";
import { IProductSearch } from "@/types/search.types";
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
	searchQuery: string;
}

export function ProductItem({
	product,
	currentLocale,
	loadCategoryTree,
	setSearchQuery,
	isModalIdOpen,
	setIsModalIdOpen,
	getProductVariations,
	setVariations,
	variations,
	searchQuery,
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

	const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const highlightParts = (text: string, matches: string[] = []) => {
		if (!text || !matches.length) return text;
		const lower = matches.map((m) => m.toLowerCase());
		const re = new RegExp(`(${matches.map(escapeRe).join("|")})`, "gi");
		return text.split(re).map((part, i) =>
			lower.includes(part.toLowerCase()) ? (
				<span
					key={i}
					className="rounded bg-emerald-100 px-1 font-semibold">
					{part}
				</span>
			) : (
				part
			),
		);
	};

	const matchedAttributes: string[] = (() => {
		const q = (searchQuery || "").trim().toLowerCase();
		if (!q) return [];
		const set = new Set<string>();

		if (product.productName?.toLowerCase().includes(q)) set.add(searchQuery);

		(product as any)?.attributes?.forEach?.((a: any) => {
			const k = String(a?.key ?? "").toLowerCase();
			const v = String(a?.value ?? "").toLowerCase();
			if (k && k.includes(q) && a.key) set.add(a.key);
			if (v && v.includes(q) && a.value) set.add(a.value);
		});

		return Array.from(set);
	})();

	return (
		<div key={product.productNumber}>
			<div className="mb-3 flex w-full items-center gap-4 rounded-md border border-gray-200 p-3 hover:border-gray-400">
				<div className="flex h-32 w-32 min-w-32 items-center justify-center overflow-hidden rounded-md">
					{product.thumbnail ? (
						<Image
							src={product.thumbnail}
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
				<div className="flex flex-1 flex-col justify-center gap-2">
					<Link
						className="w-fit"
						href={`/${categoryPath}/${product.productNumber}`}
						onClick={() => setSearchQuery("")}>
						<span className="text-base font-medium">
							{highlightParts(product.productName, matchedAttributes)}
						</span>
					</Link>
					<div className="flex max-w-xs flex-col gap-2">
						{["brandName", "material"].map((k) => (
							<div
								key={k}
								className="flex h-6 items-center justify-center rounded-sm border border-gray-300 bg-white px-3 text-[12px] text-gray-800">
								{product.attributes?.[k] ?? "-"}
							</div>
						))}
					</div>
				</div>

				<Button
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
					}}
					className="mt-2 ml-auto self-center rounded-md bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700">
					Se produktvarianter ({product.itemVariantCount || 0}) →
				</Button>
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
				}}
				className="min-w-[75%]">
				<ModalHeader className="border-b border-gray-200 pb-5">
					<ModalTitle>Velg produktvariant - {product.productName}</ModalTitle>
				</ModalHeader>
				<div className="">
					<ProductVariantTable
						variants={variations[product.productNumber]}
						productNumber={product.productNumber}
					/>
				</div>
			</Modal>
		</div>
	);
}
