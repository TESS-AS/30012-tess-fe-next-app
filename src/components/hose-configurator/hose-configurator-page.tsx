"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useGetColumnAttributes } from "@/hooks/useGetColumnAttributes";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import { useHoseSelection } from "@/hooks/useHoseSelection";
import { useAppContext } from "@/lib/appContext";
import {
	clearHoseConfiguratorDraft,
	loadHoseConfiguratorDraft,
	patchHoseConfiguratorDraft,
} from "@/lib/hose-configurator-draft";
import { prefetchHoseConfiguratorLookups } from "@/lib/prefetch-hose-configurator";
import { cn } from "@/lib/utils";
import { resolveWarehouse } from "@/lib/warehouse";
import { addToCart, getCart } from "@/services/carts.service";
import type { HoseSelectionItem } from "@/types/hose-configurator.types";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-toastify";

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

const FALLBACK_HOSE_IMAGE = "/images/category-images/hoses-and-pipes.png";

function mapSelectionToProduct(
	item: HoseSelectionItem,
	locale: string,
): ConfiguratorProduct {
	const name = locale === "en" ? item.productNameEn : item.productNameNo;
	const mainImage =
		item.mediaId.find((m) => m.picture_type === "MainImage") ?? item.mediaId[0];
	const imageSrc =
		mainImage?.thumbnail_url || mainImage?.url || FALLBACK_HOSE_IMAGE;

	return {
		id: item.itemNumber,
		name,
		description: item.shortDescNo?.trim() || name,
		imageSrc,
		href: `/search?q=${encodeURIComponent(item.itemNumber)}`,
		itemNumber: item.itemNumber,
		productNumber: item.productNumber,
	};
}

function toSelectedProduct(product: ConfiguratorProduct): StepKoblingerProduct {
	return {
		...product,
		itemNumber: product.itemNumber ?? product.id,
		itemName: product.name,
		productNumber: product.productNumber,
		stockOptions: [],
		documentCount: 0,
		maxCoilMeters: 40,
	};
}

export function HoseConfiguratorPage() {
	const t = useTranslations("HoseConfigurator");
	const tCommon = useTranslations();
	const locale = useLocale();
	const hoseSelection = useHoseSelection();
	const { data: profile } = useGetProfileData();
	const {
		isCartChanging,
		setIsCartChanging,
		setIsAuthOpen,
		showCartNotification,
	} = useAppContext();

	const [hydrated, setHydrated] = useState(false);
	const [currentStep, setCurrentStep] = useState(0);
	const [bruksomrade, setBruksomrade] = useState<BruksomradeFormValues | null>(
		null,
	);
	const [hasSearched, setHasSearched] = useState(false);
	const [selectedProduct, setSelectedProduct] =
		useState<StepKoblingerProduct | null>(null);
	const [cachedResults, setCachedResults] = useState<HoseSelectionItem[] | null>(
		null,
	);
	const [isAddingToCart, setIsAddingToCart] = useState(false);
	const restoredSearchRef = useRef(false);

	const { data: columnAttributes } = useGetColumnAttributes(
		selectedProduct?.itemNumber,
	);

	useEffect(() => {
		const draft = loadHoseConfiguratorDraft();
		if (draft) {
			setCurrentStep(
				draft.currentStep >= 0 && draft.currentStep <= 2 ? draft.currentStep : 0,
			);
			setBruksomrade(draft.bruksomrade);
			setHasSearched(draft.hasSearched);
			setSelectedProduct(draft.selectedProduct);
			setCachedResults(draft.selectionResults);
		}
		setHydrated(true);
		// Warm step 1 + step 2 lookup caches in the background.
		prefetchHoseConfiguratorLookups();
	}, []);

	useEffect(() => {
		if (!hydrated) return;
		// Never overwrite a saved form with a null/empty shell from a brief
		// remount — keep the previous draft bruksomrade when local state is empty.
		const existing = loadHoseConfiguratorDraft();
		const nextBruksomrade =
			bruksomrade &&
			(bruksomrade.medium ||
				bruksomrade.workingPressure ||
				bruksomrade.temperature ||
				bruksomrade.hoseSize ||
				bruksomrade.moreRequirements ||
				bruksomrade.customEndSize)
				? bruksomrade
				: (existing?.bruksomrade ?? bruksomrade);

		patchHoseConfiguratorDraft({
			currentStep,
			bruksomrade: nextBruksomrade,
			hasSearched,
			selectedProduct,
			selectionResults: cachedResults,
		});
	}, [
		hydrated,
		currentStep,
		bruksomrade,
		hasSearched,
		selectedProduct,
		cachedResults,
	]);

	useEffect(() => {
		if (hoseSelection.data) {
			setCachedResults(hoseSelection.data);
		}
	}, [hoseSelection.data]);

	// Re-run the last search after reload so results stay fresh, while cached
	// results render immediately.
	useEffect(() => {
		if (!hydrated || restoredSearchRef.current) return;
		if (!hasSearched || !bruksomrade) return;
		restoredSearchRef.current = true;

		const temperature =
			bruksomrade.temperature.trim() === ""
				? Number.NaN
				: Number(bruksomrade.temperature);
		const pressure =
			bruksomrade.workingPressure.trim() === ""
				? Number.NaN
				: Number(bruksomrade.workingPressure);

		hoseSelection.mutate({
			...(bruksomrade.medium.trim()
				? { medium: bruksomrade.medium.trim() }
				: {}),
			...(Number.isFinite(temperature) ? { temperature } : {}),
			...(Number.isFinite(pressure) ? { pressure } : {}),
			...(bruksomrade.hoseSize.trim()
				? { dimension: bruksomrade.hoseSize.trim() }
				: {}),
		});
		// Intentionally once after hydrate — mutate identity is unstable.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hydrated, hasSearched, bruksomrade]);

	const steps = [t("steps.usage"), t("steps.connections"), t("steps.summary")];

	const selectionSource = hoseSelection.data ?? cachedResults ?? [];
	const products = useMemo(
		() => selectionSource.map((item) => mapSelectionToProduct(item, locale)),
		[selectionSource, locale],
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
		setSelectedProduct(toSelectedProduct(product));
		setCurrentStep(1);
	};

	const handleAddToCart = async () => {
		if (!profile) {
			setIsAuthOpen(true);
			return;
		}
		if (!selectedProduct?.itemNumber || !selectedProduct.productNumber) {
			toast(t("step3.addToCartMissingData"), {
				type: "error",
				position: "top-right",
				autoClose: 3000,
			});
			return;
		}

		const draft = loadHoseConfiguratorDraft();
		const quantity = Math.max(1, draft?.koblinger?.quantity ?? 1);
		const variant =
			columnAttributes?.[selectedProduct.itemNumber] &&
			!Array.isArray(columnAttributes[selectedProduct.itemNumber])
				? (columnAttributes[selectedProduct.itemNumber] as {
						inventory?: Array<{
							warehouseId?: number;
							warehouseNumber?: string;
							warehouseName?: string;
							companyNumber?: string | number;
							balance?: number;
						}>;
					})
				: null;

		const warehouse = resolveWarehouse(
			variant?.inventory,
			draft?.koblinger?.warehouseNumber,
			{
				warehouseNumber: profile.defaultWarehouseNumber,
				companyNumber: profile.defaultCompanyNumber
					? String(profile.defaultCompanyNumber)
					: undefined,
			},
		);

		if (!warehouse?.warehouseNumber) {
			toast(t("step3.addToCartMissingData"), {
				type: "error",
				position: "top-right",
				autoClose: 3000,
			});
			return;
		}

		setIsAddingToCart(true);
		try {
			const response = await addToCart({
				productNumber: selectedProduct.productNumber,
				itemNumber: selectedProduct.itemNumber,
				quantity,
				warehouseNumber: warehouse.warehouseNumber,
				companyNumber: warehouse.companyNumber,
			});

			if (response?.message === "Error adding to cart") {
				throw new Error(response.message);
			}

			setIsCartChanging(!isCartChanging);
			showCartNotification({
				itemName: selectedProduct.itemName || selectedProduct.name,
				itemNumber: selectedProduct.itemNumber,
				quantity,
				imageUrl: selectedProduct.imageSrc,
			});
			await getCart();

			clearHoseConfiguratorDraft();
			setCurrentStep(0);
			setBruksomrade(null);
			setHasSearched(false);
			setSelectedProduct(null);
			setCachedResults(null);
		} catch (error) {
			console.error("Error adding configured hose to cart:", error);
			toast(t("step3.addToCartError"), {
				type: "error",
				position: "top-right",
				autoClose: 3000,
			});
		} finally {
			setIsAddingToCart(false);
		}
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

	if (!hydrated) {
		return (
			<main className="min-h-screen">
				<div className="container mx-auto px-4 pt-10 lg:px-0">
					<div className="h-8 w-64 animate-pulse rounded bg-[#E8EAE9]" />
					<div className="mt-8 h-12 w-full animate-pulse rounded bg-[#E8EAE9]" />
				</div>
			</main>
		);
	}

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
									initialValues={bruksomrade ?? undefined}
									onValuesChange={setBruksomrade}
									onFindHose={handleFindHose}
									isSearching={hoseSelection.isPending}
								/>
							</div>
							<HoseResultsPanel
								recommended={recommended}
								others={others}
								isLoading={
									hoseSelection.isPending && selectionSource.length === 0
								}
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
							onAddToCart={handleAddToCart}
							isAddingToCart={isAddingToCart}
						/>
					)}
				</div>
			</div>
		</main>
	);
}
