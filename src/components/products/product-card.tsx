"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Modal, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetColumnAttributes } from "@/hooks/useGetColumnAttributes";
import { cn } from "@/lib/utils";
import { getProductVariations } from "@/services/product.service";
import { IProduct } from "@/types/product.types";
import { formatNorwegianCurrency } from "@/utils/formatCurrency";
import { BadgeCheck } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import ProductVariantTable from "../checkout/product-variant-table";
import { VariantModalHeader } from "../checkout/variant-modal-header";

interface ProductCardProps extends Partial<IProduct> {
	className?: string;
	aspectRatio?: "portrait" | "square";
	variant?: "default" | "compact";
	viewLayout?: string;
	priority?: boolean;
	isPriceLoading?: boolean;
	/** Vareklasse label shown above the name ("T-RØR"). Not on IProduct today;
	 *  BE may expose it later — cast + optional for now. */
	productClass?: string | null;
	/** Stock flag for the top-right green pill. Optional until BE returns it
	 *  on /searchList rows. */
	inStock?: boolean;
	/** Variant count used inside the "Se produktvarianter (N)" button. */
	itemVariantCount?: number;
	/** Current search query — matched substrings get the highlight pill
	 *  treatment (same as the search overlay). Null on category pages. */
	searchQuery?: string | null;
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function highlight(text: string | null | undefined, matches: string[]) {
	if (!text) return text ?? "";
	if (!matches.length) return text;
	const lower = matches.map((m) => m.toLowerCase());
	const re = new RegExp(`(${matches.map(escapeRe).join("|")})`, "gi");
	return text.split(re).map((part, i) =>
		lower.includes(part.toLowerCase()) ? (
			<span
				key={i}
				className="bg-[#DCF7E0] px-0.5 font-semibold">
				{part}
			</span>
		) : (
			<span key={i}>{part}</span>
		),
	);
}

export function ProductCard({
	productNumber = "-",
	productName = "",
	mediaM,
	price,
	searchAttribute1,
	searchAttribute2,
	className,
	aspectRatio = "square",
	variant = "default",
	viewLayout,
	priority = false,
	isPriceLoading = false,
	productClass,
	inStock,
	itemVariantCount,
	searchQuery,
}: ProductCardProps) {
	const t = useTranslations();
	const pathname = usePathname();
	const detailsHref = `${pathname}/${encodeURIComponent(productNumber)}`;
	const [isLoaded, setIsLoaded] = useState(false);
	const [isVariantsOpen, setIsVariantsOpen] = useState(false);
	const [variations, setVariations] = useState<any[]>([]);
	const [loadingVariations, setLoadingVariations] = useState(false);
	// Variant table pulls column metadata keyed by an item number; we don't
	// pre-select one so pass undefined and let the user pick inside the table.
	const { data: columnAttributes, isLoading: loadingAttrs } =
		useGetColumnAttributes(undefined);

	const openVariants = async (e: React.MouseEvent<HTMLButtonElement>) => {
		// The card sits inside a <Link>, so swallow the event before React or
		// the browser propagates it to navigation.
		e.preventDefault();
		e.stopPropagation();
		e.nativeEvent.stopImmediatePropagation();
		setIsVariantsOpen(true);
		setLoadingVariations(true);
		try {
			const result = await getProductVariations(productNumber);
			setVariations(Array.isArray(result) ? result : []);
		} finally {
			setLoadingVariations(false);
		}
	};

	// Mirrors the search overlay's match-building rule: the trimmed query
	// highlights inside name/number/class, and a whole attribute value is
	// added when the query is a substring of it (so the full attribute pill
	// gets the highlight band, matching how the overlay renders).
	const matches: string[] = (() => {
		const trimmed = (searchQuery ?? "").trim();
		if (!trimmed) return [];
		const q = trimmed.toLowerCase();
		const set = new Set<string>();
		if (productName.toLowerCase().includes(q)) set.add(trimmed);
		if (productClass?.toLowerCase().includes(q)) set.add(trimmed);
		if (productNumber.toLowerCase().includes(q)) set.add(trimmed);
		[searchAttribute1, searchAttribute2].forEach((v) => {
			if (v && v.toLowerCase().includes(q)) set.add(v);
		});
		return Array.from(set);
	})();

	return (
		<>
		<div
			className={cn(
				"group flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border-2 border-[#C1C4C2] bg-white shadow-[0px_2px_4px_-2px_#0000000D,0px_4px_6px_-1px_#0000001A] transition-all hover:shadow-lg",
				variant === "default" ? "p-4" : "p-3",
				viewLayout === "list" && "flex-row",
				className,
			)}>
			<div
				className={cn(
					"relative mx-auto flex-shrink-0 overflow-hidden rounded-md",
					aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square",
					viewLayout === "list"
						? "me-4 w-[250px]"
						: "w-full max-w-[65%]",
				)}>
				{!isLoaded && <Skeleton className="absolute inset-0 h-full w-full" />}

				<Image
					src={mediaM ?? "/images/tess.webp"}
					alt={productName || "Product image"}
					fill
					priority={priority}
					loading={priority ? "eager" : "lazy"}
					sizes={
						viewLayout === "list"
							? "250px"
							: "(min-width: 1280px) 256px, (min-width: 1024px) 192px, (min-width: 768px) 256px, (min-width: 640px) 384px, calc(100vw - 48px)"
					}
					quality={90}
					className={cn(
						"object-contain transition-transform duration-300 group-hover:scale-105",
						!isLoaded && "opacity-0",
					)}
					onLoad={() => setIsLoaded(true)}
				/>
			</div>

			<div
				className={cn(
					"flex flex-1 flex-col",
					variant === "default" ? "mt-6" : "mt-4",
				)}>
				<div className="flex items-center justify-between gap-2">
					<h3
						title={productClass || productName}
						className="min-w-0 flex-1 truncate text-[16px] leading-[150%] font-bold text-[#0F1912] uppercase">
						{highlight(productClass || productName, matches)}
					</h3>
					{inStock && (
						<span className="inline-flex shrink-0 items-center gap-1 rounded bg-[#DCF7E0] px-2 py-1 text-xs font-medium text-[#005522]">
							<BadgeCheck className="h-4 w-4 fill-[#005522] text-white" />
							{t("Search.inMainWarehouse")}
						</span>
					)}
				</div>

				<div className="mt-4 flex gap-1 text-[14px] leading-[150%] text-black">
					<span className="shrink-0 font-bold">
						{t("Common.itemNumber")}:
					</span>
					<span className="truncate font-medium">
						{highlight(productNumber, matches)}
					</span>
				</div>

				<div className="mt-1 flex gap-1 text-[14px] leading-[150%] text-black">
					<span className="shrink-0 font-bold">
						{t("Common.itemName")}:
					</span>
					<span className="font-medium">{productName}</span>
				</div>

				{(searchAttribute1 || searchAttribute2) && (
					<div className="mt-5 flex flex-wrap gap-2">
						{searchAttribute1 && (
							<span className="inline-flex items-center rounded-md border border-[#8A8F8C] bg-white px-2 py-0.5 text-[12px] leading-[150%] font-medium text-[#5A615D]">
								{searchAttribute1}
							</span>
						)}
						{searchAttribute2 && (
							<span className="inline-flex items-center rounded-md border border-[#8A8F8C] bg-white px-2 py-0.5 text-[12px] leading-[150%] font-medium text-[#5A615D]">
								{searchAttribute2}
							</span>
						)}
					</div>
				)}

				<div className="mt-auto pt-6">
				<button
					type="button"
					onClick={openVariants}
					className="flex h-8 w-[220px] max-w-full items-center justify-center rounded-md border border-[#C1C4C2] bg-white px-3 text-[13px] font-medium text-[#0F1912] transition-colors hover:border-[#009640] hover:bg-[#F0FCF2]">
					{t("Product.seeProductVariants")}
					{typeof itemVariantCount === "number" && ` (${itemVariantCount})`}
				</button>

				<div className="mt-6 flex items-center justify-between gap-2">
					{isPriceLoading ? (
						<Skeleton className="h-5 w-24" />
					) : price !== undefined ? (
						<p className="flex items-baseline gap-1 text-[#0F1912]">
							<span className="text-[14px] leading-[125%] font-normal">
								Fra kr
							</span>
							<span className="text-[18px] leading-[125%] font-bold">
								{formatNorwegianCurrency(price)}
							</span>
						</p>
					) : (
						<span />
					)}
					<Button
						variant="default"
						size="sm"
						className="h-[35px] !text-sm">
						Vis produkt
					</Button>
				</div>
				</div>
			</div>
		</div>
		{/* Radix renders Modal via a DOM Portal, but React synthetic events
		    still bubble through the component tree. Since the card sits inside
		    a <Link>, any click inside the modal (X, backdrop, Close) would
		    bubble up and trigger navigation on close. Wrapping Modal with a
		    stopPropagation div breaks that path at the React tree level. */}
		<div
			onClick={(e) => e.stopPropagation()}
			onMouseDown={(e) => e.stopPropagation()}>
		<Modal
			open={isVariantsOpen}
			onOpenChange={(open) => {
				if (!open) {
					setIsVariantsOpen(false);
					setVariations([]);
				}
			}}
			className="max-h-[90vh] min-w-[88%] overflow-y-auto">
			<ModalHeader className="border-b border-gray-200 pb-5">
				<ModalTitle>
					{t("Product.variantTitle", { default: "Velg produktvariant" })}: {productName}
				</ModalTitle>
			</ModalHeader>
			<VariantModalHeader
				productName={productName}
				imageUrl={mediaM}
				detailsHref={detailsHref}
			/>
			<div className="w-full overflow-hidden">
				{loadingVariations ? (
					<div className="p-8 text-center text-sm text-[#5A615D]">
						{t("Product.loadingVariant", { default: "Laster..." })}
					</div>
				) : (
					<ProductVariantTable
						hasQuantity
						variants={variations}
						productNumber={productNumber}
						hasAddToCart
						columnAttributes={columnAttributes}
						loadingAttributes={loadingAttrs}
					/>
				)}
			</div>
		</Modal>
		</div>
		</>
	);
}
