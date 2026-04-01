"use client";

import { IProduct } from "@/types/product.types";
import { IRelatedProductRaw } from "@/types/product.types";
import { useKeenSlider } from "keen-slider/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { ProductCard } from "./product-card";
import "keen-slider/keen-slider.min.css";

// eslint-disable-next-line import/order
import { Button } from "@/components/ui/button";

// eslint-disable-next-line import/order
import { useState, useMemo } from "react";

// eslint-disable-next-line import/order
import { useGetProfileData } from "@/hooks/useGetProfileData";
// eslint-disable-next-line import/order
import { useProductPrices } from "@/hooks/useProductPrices";

interface RelatedProductsProps {
	products: IRelatedProductRaw[];
	category: string;
}

export function RelatedProducts({ products, category }: RelatedProductsProps) {
	const t = useTranslations();
	const isEmpty = !products || products.length === 0;
	const { data: profile } = useGetProfileData();

	const productNumbers = useMemo(
		() => products.map((p) => p.product_number ?? p.productNumber ?? ""),
		[products],
	);

	const { prices: productPrices, isFetching: isFetchingPrices } =
		useProductPrices({
			productNumbers,
			customerNumber: profile?.defaultCustomerNumber,
			companyNumber: profile?.defaultCompanyNumber,
			warehouseNumber: profile?.defaultWarehouseNumber,
			enabled: !!profile?.defaultCustomerNumber && products.length > 0,
		});

	const normalizedProducts: IProduct[] = useMemo(
		() =>
			products.map((p: IRelatedProductRaw) => {
				const productNumber = p.product_number ?? p.productNumber ?? "";
				const media = p.media_id ?? p.mediaId;
				return {
					productNumber,
					productName: p.product_name_no ?? p.productName ?? "",
					mediaM: media?.[0]?.url ?? "",
					shortDesc: p.short_desc_no ?? "",
					price: productPrices[productNumber],
				};
			}),
		[products, productPrices],
	);

	const [currentSlide, setCurrentSlide] = useState(0);
	const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
		mode: "free-snap",
		rubberband: true,
		slides: {
			perView: 1.2,
			spacing: 16,
		},
		breakpoints: {
			"(min-width: 640px)": {
				slides: { perView: 2.2, spacing: 16 },
			},
			"(min-width: 1024px)": {
				slides: { perView: 4, spacing: 15 },
			},
		},
		slideChanged(slider) {
			setCurrentSlide(slider.track.details.rel);
		},
	});

	function getPerView(): number {
		const slidesOpt = instanceRef.current?.options.slides;
		if (typeof slidesOpt === "object" && slidesOpt?.perView) {
			return slidesOpt.perView as any;
		}
		return 1;
	}

	return (
		<div className="relative right-1/2 left-1/2 mt-8 -mr-[50vw] -ml-[50vw] w-screen bg-gray-50 py-14 pb-16">
			<section className="container mx-auto px-4">
				<div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
					<h2 className="text-xl font-semibold text-[#0F1912] md:text-2xl">
						{t("Product.relatedProducts")}
					</h2>

					{!isEmpty && (
						<div className="hidden items-center gap-2 md:flex">
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-900 hover:text-white disabled:opacity-50"
								onClick={() => instanceRef.current?.prev()}
								disabled={currentSlide === 0}>
								<ChevronLeft className="h-4 w-4" />
							</Button>

							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-900 hover:text-white disabled:opacity-50"
								onClick={() => instanceRef.current?.next()}
								disabled={
									currentSlide >=
									(instanceRef.current?.track.details.slides.length ?? 1) -
										getPerView()
								}>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					)}
				</div>

				{isEmpty ? (
					<p className="mt-4 text-sm text-gray-500">
						{t("Product.noRelatedProducts")}
					</p>
				) : (
					<>
						{/* Mobile: vertical stack */}
						<div className="flex flex-col gap-4 md:hidden">
							{normalizedProducts.map((product) => (
								<Link
									key={product.productNumber}
									href={product.productNumber}>
									<ProductCard
										{...product}
										variant="default"
										isPriceLoading={isFetchingPrices}
									/>
								</Link>
							))}
						</div>
						{/* Desktop: slider */}
						<div className="hidden px-0 md:block">
							<div
								ref={sliderRef}
								className="keen-slider w-full">
								{normalizedProducts.map((product) => (
									<div
										key={product.productNumber}
										className="keen-slider__slide">
										<Link href={product.productNumber}>
											<ProductCard
												{...product}
												variant="default"
												isPriceLoading={isFetchingPrices}
											/>
										</Link>
									</div>
								))}
							</div>
						</div>
					</>
				)}
			</section>
		</div>
	);
}
