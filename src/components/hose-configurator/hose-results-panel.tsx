"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { HoseResultsSkeleton } from "./hose-configurator-skeletons";

export type ConfiguratorProduct = {
	id: string;
	name: string;
	description: string;
	imageSrc: string;
	href: string;
	itemNumber?: string;
	productNumber?: string;
};

type HoseResultsPanelProps = {
	recommended: ConfiguratorProduct | null;
	others: ConfiguratorProduct[];
	isLoading?: boolean;
	hasSearched?: boolean;
	errorMessage?: string | null;
	onSelectProduct: (product: ConfiguratorProduct) => void;
};

function MatchChecks() {
	const t = useTranslations("HoseConfigurator.results");

	const checks = [
		t("matches.medium"),
		t("matches.pressure"),
		t("matches.temperature"),
	];

	return (
		<ul className="space-y-2">
			{checks.map((label) => (
				<li
					key={label}
					className="flex items-start gap-2 text-sm text-[#0F1912]">
					<span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#009640]">
						<Check
							className="h-2.5 w-2.5 text-white"
							strokeWidth={3}
						/>
					</span>
					{label}
				</li>
			))}
		</ul>
	);
}

function OtherProductCard({
	product,
	onSelect,
}: {
	product: ConfiguratorProduct;
	onSelect: (product: ConfiguratorProduct) => void;
}) {
	const t = useTranslations("HoseConfigurator.results");

	return (
		<article className="flex flex-col rounded-lg border border-[#C1C4C2] bg-white p-4">
			<h3 className="text-base font-bold text-[#0F1912]">{product.name}</h3>
			<p className="mt-2 line-clamp-3 flex-1 text-sm leading-snug text-[#5A615D]">
				{product.description}
			</p>
			<div className="relative mx-auto mt-4 h-28 w-full max-w-[220px]">
				<Image
					src={product.imageSrc}
					alt={product.name}
					fill
					className="object-contain"
					sizes="220px"
				/>
			</div>
			<Button
				type="button"
				variant="outlineGrey"
				className="mt-4 w-full justify-center"
				onClick={() => onSelect(product)}>
				<ArrowRight className="h-4 w-4" />
				{t("goToProduct")}
			</Button>
		</article>
	);
}

export function HoseResultsPanel({
	recommended,
	others,
	isLoading = false,
	hasSearched = false,
	errorMessage = null,
	onSelectProduct,
}: HoseResultsPanelProps) {
	const t = useTranslations("HoseConfigurator.results");

	if (isLoading) {
		return <HoseResultsSkeleton />;
	}

	if (errorMessage) {
		return (
			<div className="min-w-0 flex-1 pb-8 text-sm text-[#C62828]">
				{errorMessage}
			</div>
		);
	}

	if (!recommended) {
		return (
			<div className="min-w-0 flex-1 pb-8 text-sm text-[#5A615D]">
				{hasSearched ? t("noResults") : t("idleHint")}
			</div>
		);
	}

	return (
		<div className="min-w-0 flex-1 space-y-8 pb-8">
			<section className="space-y-3">
				<h2 className="text-base font-bold text-[#0F1912]">
					{t("recommendedTitle")}
				</h2>
				<div className="border-y border-x-0 border-[#C1C4C2] bg-white py-5">
					<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
						<div className="min-w-0 flex-1">
							<h3 className="text-xl font-bold text-[#0F1912]">
								{recommended.name}
							</h3>
							<p className="mt-3 text-sm leading-relaxed text-[#5A615D]">
								{recommended.description}
							</p>
							<div className="relative mt-6 h-36 w-full max-w-[280px]">
								<Image
									src={recommended.imageSrc}
									alt={recommended.name}
									fill
									className="object-contain object-left"
									sizes="280px"
									priority
								/>
							</div>
						</div>
						<div className="flex flex-col justify-between gap-4 rounded-md border border-[#009640]/40 bg-[#DCF7E0] p-4">
							<MatchChecks />
							<Button
								type="button"
								variant="greenSolid"
								className="w-full justify-center"
								onClick={() => onSelectProduct(recommended)}>
								<ArrowRight className="h-4 w-4" />
								{t("goToProduct")}
							</Button>
						</div>
					</div>
				</div>
			</section>

			{others.length > 0 && (
				<section className="space-y-3">
					<h2 className="text-base font-bold text-[#0F1912]">
						{t("othersTitle")}
					</h2>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{others.map((product) => (
							<OtherProductCard
								key={product.id}
								product={product}
								onSelect={onSelectProduct}
							/>
						))}
					</div>
				</section>
			)}
		</div>
	);
}
