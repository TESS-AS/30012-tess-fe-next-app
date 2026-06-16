// ProductItem.tsx
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Modal, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { useProfile } from "@/contexts/ProfileContext";
import { useGetColumnAttributes } from "@/hooks/useGetColumnAttributes";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { setProductReturnTarget } from "@/lib/productReturnNavigation";
import { categoryTreeToUrlPath, cn } from "@/lib/utils";
import { loadCategoryTree } from "@/services/categories.service";
import { IProductSearch } from "@/types/search.types";
import { BadgeCheck } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

import ProductVariantTable from "../checkout/product-variant-table";
import { VariantModalHeader } from "../checkout/variant-modal-header";

interface Props {
	product: IProductSearch;
	currentLocale: string;
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
	onClose?: () => void;
}

export function ProductItem({
	product,
	currentLocale,
	setSearchQuery,
	isModalIdOpen,
	setIsModalIdOpen,
	getProductVariations,
	setVariations,
	variations,
	searchQuery,
	onClose,
}: Props) {
	const { profile } = useProfile();
	const t = useTranslations();
	const locale = useLocale();
	const [selectedVariantNumber, setSelectedVariantNumber] = useState<
		string | null
	>(null);
	const [productLink, setProductLink] = useState<string>(
		`/produkt/${encodeURIComponent(product.productNumber)}`,
	);
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const captureReturnTarget = () => {
		const q = (searchQuery || "").trim();
		if (q) {
			setProductReturnTarget(`/search?query=${encodeURIComponent(q)}`, {
				scrollY:
					typeof document !== "undefined"
						? document.getElementById("app-scroll-container")?.scrollTop ??
							window.scrollY
						: 0,
			});
			return;
		}
		const qs = searchParams.toString();
		setProductReturnTarget(qs ? `${pathname}?${qs}` : pathname, {
			scrollY:
				typeof document !== "undefined"
					? document.getElementById("app-scroll-container")?.scrollTop ??
						window.scrollY
					: 0,
		});
	};

	// Fetch category tree and build proper URL path
	useEffect(() => {
		if (product.redirect) {
			const trimmed = product.redirect.trim();
			setProductLink(trimmed.startsWith("/") ? trimmed : `/${trimmed}`);
			return;
		}

		const fetchCategoryPath = async () => {
			try {
				const categoryTree = await loadCategoryTree(product.productNumber);
				if (categoryTree && categoryTree.length > 0) {
					// Always use Norwegian for URL paths
					const pathSlugs = categoryTreeToUrlPath(categoryTree, "no");
					// Build URL: /category/subcategory/segment/productNumber
					// Use only the categories we have (no __default, no assortments)
					const pathParts = [...pathSlugs];
					// Only add product number if we have at least one category
					if (pathParts.length > 0) {
						pathParts.push(encodeURIComponent(product.productNumber));
						setProductLink(`/${pathParts.join("/")}`);
					} else {
						// Fallback: use product number only if no categories available
						setProductLink(`/produkt/${encodeURIComponent(product.productNumber)}`);
					}
				} else {
					// Fallback: use product number even without category tree
					setProductLink(`/produkt/${encodeURIComponent(product.productNumber)}`);
				}
			} catch (error) {
				console.error("Error loading category tree for product:", error);
				// Fallback to default product link with product number
				setProductLink(`/produkt/${encodeURIComponent(product.productNumber)}`);
			}
		};

		fetchCategoryPath();
	}, [product.productNumber, product.productName, product.redirect, locale]);

	const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const highlightParts = (text: string, matches: string[] = []) => {
		if (!text || !matches.length) return text;
		const lower = matches.map((m) => m.toLowerCase());
		const re = new RegExp(`(${matches.map(escapeRe).join("|")})`, "gi");
		return text.split(re).map((part, i) =>
			lower.includes(part.toLowerCase()) ? (
				<span
					key={i}
					className="bg-emerald-100 font-semibold">
					{part}
				</span>
			) : (
				part
			),
		);
	};

	const matchedAttributes: string[] = (() => {
		const trimmedQuery = (searchQuery || "").trim();
		const q = trimmedQuery.toLowerCase();
		if (!q) return [];
		const set = new Set<string>();

		if (product.productName?.toLowerCase().includes(q)) set.add(trimmedQuery);

		(product as any)?.attributes?.forEach?.((a: any) => {
			const k = String(a?.key ?? "").toLowerCase();
			const v = String(a?.value ?? "").toLowerCase();
			if (k && k.includes(q) && a.key) set.add(a.key);
			if (v && v.includes(q) && a.value) set.add(a.value);
		});

		return Array.from(set);
	})();

	const { data: columnAttributes, isLoading: loadingAttrs } =
		useGetColumnAttributes(selectedVariantNumber ?? undefined);

	const handleProductClick = () => {
		captureReturnTarget();
		setSearchQuery("");
		onClose?.();
		router.push(productLink);
	};

	return (
		<div>
			<div
				onClick={handleProductClick}
				className="cursor-pointer">
				<div key={product.productNumber}>
					<div className="group mb-3 flex w-full cursor-pointer flex-col gap-3 rounded-md border border-gray-200 p-3 hover:border-gray-400 sm:flex-row sm:items-center sm:gap-4">
						<div className="flex h-24 w-24 shrink-0 items-center justify-center self-center overflow-hidden rounded-md sm:h-32 sm:w-32">
							{product.thumbnail ? (
								<Image
									src={product.thumbnail}
									alt={product.productName}
									unoptimized
									width={128}
									height={128}
									className="max-h-24 max-w-24 object-contain sm:max-h-23 sm:max-w-32"
									loading="eager"
								/>
							) : (
								<div className="h-24 w-24 rounded bg-gray-300 sm:h-32 sm:w-32" />
							)}
						</div>
						<div className="flex flex-1 flex-col justify-center gap-1.5">
							<Link
								className="w-fit"
								href={productLink}
								onClick={() => {
									captureReturnTarget();
									setSearchQuery("");
								}}>
								<span
									className={cn(
										"text-base font-medium",
										"border-black group-hover:border-b",
									)}>
									{highlightParts(product.productName, matchedAttributes)}
								</span>
							</Link>
							{["searchAttribute1", "searchAttribute2"].some(
								(k) => (product as unknown as Record<string, any>)?.[k],
							) && (
								<div className="flex max-w-xs flex-col gap-1">
									{["searchAttribute1", "searchAttribute2"].map((k) => {
										const value = (product as unknown as Record<string, any>)?.[k];
										if (!value) return null;
										return (
											<div
												key={k}
												className="flex items-center rounded-sm bg-white text-[12px] text-gray-800">
												{value}
											</div>
										);
									})}
								</div>
							)}
							{product.inStock && (
								<div className="flex w-fit items-center gap-1 rounded bg-[#DCF7E0] px-2 py-1 text-xs font-medium text-emerald-800 sm:hidden">
									<BadgeCheck className="h-4 w-4 fill-emerald-800 text-white" />
									<span>{t("Search.inMainWarehouse")}</span>
								</div>
							)}
							<Button
								type="button"
								variant="outlineGrey"
								className={cn(
									"mt-1 w-full rounded-md px-5 py-2 text-sm font-medium transition-colors sm:hidden",
									"group-hover:border-[#009640] group-hover:bg-[#009640] group-hover:text-white",
									"hover:border-[#005522] hover:bg-[#005522] hover:text-white",
								)}
								onClick={async (e) => {
									e.stopPropagation();
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

									if (productVariations.length > 0) {
										setSelectedVariantNumber(productVariations[0].itemNumber);
									}
								}}>
								Se produktvarianter ({product.itemVariantCount || 0}) →
							</Button>
						</div>
						<div className="ml-auto hidden flex-col items-end gap-5 sm:flex">
							{product.inStock && (
								<div className="flex items-center gap-1 rounded bg-[#DCF7E0] px-2 py-1 text-xs font-medium text-emerald-800">
									<BadgeCheck className="h-4 w-4 fill-emerald-800 text-white" />
									<span>{t("Search.inMainWarehouse")}</span>
								</div>
							)}

							<Button
								type="button"
								variant="outlineGrey"
								className={cn(
									"mt-2 ml-auto self-center rounded-md px-5 py-2 text-sm font-medium transition-colors",
									"group-hover:border-[#009640] group-hover:bg-[#009640] group-hover:text-white",
									"hover:border-[#005522] hover:bg-[#005522] hover:text-white",
								)}
								onClick={async (e) => {
									e.stopPropagation();
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

									if (productVariations.length > 0) {
										setSelectedVariantNumber(productVariations[0].itemNumber);
									}
								}}>
								Se produktvarianter ({product.itemVariantCount || 0}) →
							</Button>
						</div>
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
				}}
				className="max-h-[90vh] min-w-[75%] overflow-y-auto">
				<ModalHeader className="border-b border-gray-200 pb-5">
					<ModalTitle>Velg produktvariant: {product.productName}</ModalTitle>
				</ModalHeader>
				<VariantModalHeader
					productName={product.productName}
					itemNumber={selectedVariantNumber ?? undefined}
					imageUrl={product.thumbnail}
					detailsHref={productLink}
				/>
				<div className="w-full overflow-hidden">
					<ProductVariantTable
						hasQuantity
						variants={variations[product.productNumber]}
						productNumber={product.productNumber}
						hasAddToCart
						columnAttributes={columnAttributes}
						loadingAttributes={loadingAttrs}
					/>
				</div>
			</Modal>
		</div>
	);
}
