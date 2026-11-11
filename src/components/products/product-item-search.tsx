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
					className="bg-[#DCF7E0] px-1.5 py-0.5 font-semibold">
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

		[product.attribute1, product.attribute2].forEach((value) => {
			if (value && value.toLowerCase().includes(q)) set.add(value);
		});

		return Array.from(set);
	})();

	const { data: columnAttributes, isLoading: loadingAttrs } =
		useGetColumnAttributes(selectedVariantNumber ?? undefined);

	const handleProductClick = () => {
		captureReturnTarget();
		onClose?.();
		router.push(productLink);
	};

	const isExactHit = Boolean(product.redirect);
	const exactHitLabel = (() => {
		if (!isExactHit) return null;
		const type = product.redirectType ?? "";
		return t(`Search.exactHit.${type}`, { default: t("Search.exactHit.default") });
	})();

	const openVariantsModal = async (
		e: React.MouseEvent<HTMLButtonElement>,
	) => {
		e.stopPropagation();
		e.nativeEvent.stopImmediatePropagation();
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
	};

	const attributePills = [product.attribute1, product.attribute2].filter(
		Boolean,
	) as string[];

	return (
		<div>
			<div
				onClick={handleProductClick}
				className="cursor-pointer">
				<div
					key={product.productNumber}
					className="group flex w-full cursor-pointer flex-col gap-3 border-b border-gray-200 py-3">
					<div className="flex items-start gap-3 sm:gap-4">
						<div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md sm:h-20 sm:w-20">
							{product.thumbnail ? (
								<Image
									src={product.thumbnail}
									alt={product.productName}
									unoptimized
									width={80}
									height={80}
									className="max-h-16 max-w-16 object-contain sm:max-h-20 sm:max-w-20"
									loading="eager"
								/>
							) : (
								<div className="h-16 w-16 rounded bg-gray-300 sm:h-20 sm:w-20" />
							)}
						</div>
						<div className="flex min-w-0 flex-1 flex-col">
							<Link
								className="w-fit"
								href={productLink}
								onClick={captureReturnTarget}>
								<span className="text-sm font-bold text-[#0F1912]">
									{highlightParts(product.productName, matchedAttributes)}
								</span>
							</Link>
							<div className="mt-2 flex items-center justify-between gap-2">
								<span className="text-sm font-normal text-[#5A615D]">
									{t("Search.itemNumber", { default: "Varenummer" })}:{" "}
									<span className="font-semibold text-[#0F1912]">
										{product.productNumber}
									</span>
								</span>
								{product.inStock && (
									<span className="inline-flex shrink-0 items-center gap-1 rounded bg-[#DCF7E0] px-2 py-1 text-xs font-medium text-[#005522]">
										<BadgeCheck className="h-4 w-4 fill-[#005522] text-white" />
										{t("Search.inMainWarehouse")}
									</span>
								)}
							</div>
							{product.itemName && (
								<p className="mt-0.5 truncate text-sm text-[#5A615D]">
									{product.itemName}
								</p>
							)}
							{attributePills.length > 0 && (
								<div className="mt-2 flex flex-wrap gap-2">
									{attributePills.map((value, i) => (
										<span
											key={i}
											className="inline-flex items-center rounded bg-[#E8EAE9] px-2 py-1 text-sm font-normal text-[#0F1912]">
											{value}
										</span>
									))}
								</div>
							)}
						</div>
					</div>
					{isExactHit ? (
						<span className="inline-flex w-fit items-center gap-1 rounded bg-[#DCF7E0] px-2 py-1 text-xs font-medium text-[#005522]">
							<BadgeCheck className="h-4 w-4 fill-[#005522] text-white" />
							{t("Search.exactHit.prefix")}
							{exactHitLabel ? ` — ${exactHitLabel}` : ""}
						</span>
					) : (
						<Button
							type="button"
							variant="outlineGrey"
							className={cn(
								"w-full rounded-md px-5 py-2 text-xs font-medium transition-colors",
								"group-hover:border-[#009640] group-hover:bg-[#009640] group-hover:text-white",
								"hover:border-[#005522] hover:bg-[#005522] hover:text-white",
							)}
							onClick={openVariantsModal}>
							→ Se produktvarianter ({product.itemVariantCount || 0})
						</Button>
					)}
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
				className="max-h-[90vh] min-w-[88%] overflow-y-auto">
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
