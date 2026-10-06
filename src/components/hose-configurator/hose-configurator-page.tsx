"use client";

import { useMemo, useState } from "react";

import { useHoseSelection } from "@/hooks/useHoseSelection";
import { cn } from "@/lib/utils";
import type { HoseSelectionItem } from "@/types/hose-configurator.types";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { ConfiguratorStepper } from "./configurator-stepper";
import {
	HoseResultsPanel,
	type ConfiguratorProduct,
} from "./hose-results-panel";
import {
	StepBruksomrade,
	type BruksomradeFormValues,
} from "./step-bruksomrade";
import {
	StepKoblinger,
	type StepKoblingerProduct,
} from "./step-koblinger";
import { StepOppsummering } from "./step-oppsummering";

const HOSE_IMAGE = "/images/category-images/hoses-and-pipes.png";

function mapSelectionToProduct(
	item: HoseSelectionItem,
	locale: string,
): ConfiguratorProduct {
	const name = locale === "en" ? item.productNameEn : item.productNameNo;
	const description =
		locale === "en" ? item.productNameEn : item.productNameNo;

	return {
		id: item.itemNumber,
		name,
		description,
		imageSrc: HOSE_IMAGE,
		href: `/search?q=${encodeURIComponent(item.itemNumber)}`,
		itemNumber: item.itemNumber,
	};
}

export function HoseConfiguratorPage() {
	const t = useTranslations("HoseConfigurator");
	const tCommon = useTranslations();
	const locale = useLocale();
	const hoseSelection = useHoseSelection();

	const [currentStep, setCurrentStep] = useState(0);
	const [bruksomrade, setBruksomrade] = useState<BruksomradeFormValues | null>(
		null,
	);
	const [hasSearched, setHasSearched] = useState(false);
	const [selectedProduct, setSelectedProduct] =
		useState<StepKoblingerProduct | null>(null);

	const steps = [t("steps.usage"), t("steps.connections"), t("steps.summary")];

	const products = useMemo(
		() =>
			(hoseSelection.data ?? []).map((item) =>
				mapSelectionToProduct(item, locale),
			),
		[hoseSelection.data, locale],
	);

	const recommended = products[0] ?? null;
	const others = products.slice(1);

	const handleFindHose = (values: BruksomradeFormValues) => {
		setBruksomrade(values);
		setHasSearched(true);

		const temperature =
			values.temperature.trim() === ""
				? Number.NaN
				: Number(values.temperature);
		const pressure =
			values.workingPressure.trim() === ""
				? Number.NaN
				: Number(values.workingPressure);

		hoseSelection.mutate({
			...(values.medium.trim() ? { medium: values.medium.trim() } : {}),
			...(Number.isFinite(temperature) ? { temperature } : {}),
			...(Number.isFinite(pressure) ? { pressure } : {}),
			...(values.hoseSize.trim()
				? { dimension: values.hoseSize.trim() }
				: {}),
		});
	};

	const handleSelectProduct = (product: ConfiguratorProduct) => {
		setSelectedProduct({
			...product,
			itemNumber: product.itemNumber ?? product.id,
			itemName: product.name,
			stockOptions: ["TESS Logistikk as - 300 MTR"],
			documentCount: 0,
			maxCoilMeters: 40,
		});
		setCurrentStep(1);
	};

	const breadcrumbItems = [
		{ href: "/", label: tCommon("BreadCrumbs.home"), isHome: true },
		{
			href: "/slanger-og-ror",
			label: tCommon("BreadCrumbs.hosesAndPipes"),
		},
		{
			href: "/hose-configurator",
			label: tCommon("BreadCrumbs.hoseConfigurator"),
			current: true,
		},
	];

	return (
		<main className="min-h-screen">
			<div className="container mx-auto px-4 pt-6 lg:px-0">
				<nav
					aria-label="breadcrumb"
					className="inline-flex items-center text-sm">
					<ol className="inline-flex items-center gap-2">
						{breadcrumbItems.map((item, index) => {
							const isLast = index === breadcrumbItems.length - 1;
							const isCurrent = !!item.current || isLast;

							return (
								<li
									key={item.href}
									className="inline-flex items-center gap-2">
									{index > 0 && (
										<ChevronRight
											className="h-4 w-4 text-[#8A8F8C]"
											aria-hidden
										/>
									)}
									{isCurrent ? (
										<span className="text-[#5A615D]">{item.label}</span>
									) : (
										<Link
											href={item.href}
											className={cn(
												"inline-flex items-center gap-1.5 text-[#009640] underline underline-offset-2 hover:text-[#005522]",
											)}>
											{"isHome" in item && item.isHome && (
												<Home className="h-4 w-4" />
											)}
											{item.label}
										</Link>
									)}
								</li>
							);
						})}
					</ol>
				</nav>
			</div>

			<div className="relative right-1/2 left-1/2 mt-4 -mx-[50vw] w-screen bg-[#F3F4F3]">
				<div className="container mx-auto">
					<ConfiguratorStepper
						steps={steps}
						currentStep={currentStep}
						onStepClick={(step) => {
							if (
								step === 0 ||
								(step === 1 && selectedProduct) ||
								(step === 2 && selectedProduct)
							) {
								setCurrentStep(step);
							}
						}}
					/>
				</div>
			</div>

			<div className="container mx-auto px-4 pt-8 lg:px-0">
				<div className="border-b border-[#E8EAE9] pb-4">
					<h1 className="text-2xl font-bold text-[#0F1912]">
						{currentStep + 1}. {steps[currentStep]}
						{currentStep === 2 && (
							<span className="font-normal">
								{" "}
								- {t("step3.titleSuffix")}
							</span>
						)}
					</h1>
				</div>

				<div className="pt-8">
					{currentStep === 0 && (
						<div className="flex flex-col gap-10 lg:flex-row lg:items-start">
							<div className="w-full shrink-0 lg:w-[440px]">
								<StepBruksomrade
									onFindHose={handleFindHose}
									isSearching={hoseSelection.isPending}
								/>
							</div>
							<HoseResultsPanel
								recommended={recommended}
								others={others}
								isLoading={hoseSelection.isPending}
								hasSearched={hasSearched}
								errorMessage={
									hoseSelection.isError ? t("results.error") : null
								}
								onSelectProduct={handleSelectProduct}
							/>
						</div>
					)}
					{currentStep === 1 && selectedProduct && (
						<StepKoblinger
							product={selectedProduct}
							onBack={() => setCurrentStep(0)}
							onContinue={() => setCurrentStep(2)}
						/>
					)}
					{currentStep === 2 && selectedProduct && (
						<StepOppsummering
							product={selectedProduct}
							bruksomrade={bruksomrade}
							onEditSpecs={() => setCurrentStep(0)}
							onEditSetup={() => setCurrentStep(1)}
							onBack={() => setCurrentStep(1)}
							onAddToCart={() => {
								/* mock until cart API is wired */
							}}
						/>
					)}
				</div>
			</div>
		</main>
	);
}
