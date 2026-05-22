"use client";

import { useGetColumnAttributes } from "@/hooks/useGetColumnAttributes";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

interface VariantModalHeaderProps {
	productName: string;
	itemNumber?: string;
	imageUrl?: string | null;
	detailsHref: string;
}

export function VariantModalHeader({
	productName,
	itemNumber,
	imageUrl,
	detailsHref,
}: VariantModalHeaderProps) {
	const t = useTranslations("Checkout.variantModalHeader");
	const locale = useLocale();

	const { data: columnAttributes } = useGetColumnAttributes(itemNumber);

	const description =
		locale === "no"
			? columnAttributes?.productData?.shortDescNo
			: columnAttributes?.productData?.shortDescEn;

	return (
		<div className="flex items-start justify-between gap-4 border-b border-gray-200 px-4 pb-4 sm:px-6">
			<div className="flex flex-1 items-start gap-6">
				{imageUrl ? (
					<Image
						src={imageUrl}
						alt={productName}
						width={120}
						height={120}
						unoptimized
						className="h-[120px] w-[120px] shrink-0 rounded-md object-contain"
						loading="eager"
					/>
				) : (
					<div
						aria-hidden
						className="h-[120px] w-[120px] shrink-0 rounded-md bg-gray-200"
					/>
				)}
				<p className="line-clamp-3 text-base font-normal leading-relaxed break-words text-[#5A615D]">
					{description?.trim() ? description : t("fallbackDescription")}
				</p>
			</div>
			<Link
				href={detailsHref}
				className="shrink-0 pt-1 text-sm font-medium whitespace-nowrap text-[#009640] hover:underline">
				{t("viewAllDetails")}
			</Link>
		</div>
	);
}
