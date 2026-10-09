"use client";

import { useEffect, useMemo, useState } from "react";

import { ProductDocumentsDrawer } from "@/components/products/product-documents-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ZoomImage } from "@/components/ui/zoom-image";
import { useGetColumnAttributes } from "@/hooks/useGetColumnAttributes";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import {
	loadHoseConfiguratorDraft,
	patchHoseConfiguratorDraft,
} from "@/lib/hose-configurator-draft";
import { resolveProductUnit } from "@/lib/product-unit";
import {
	buildWarehouseOptions,
	pickPreferredWarehouse,
} from "@/lib/warehouse";
import { Info, Minus, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import type { ConfiguratorProduct } from "./hose-results-panel";
import { StepKoblingerSpecs } from "./step-koblinger-specs";

export type StepKoblingerProduct = ConfiguratorProduct & {
	itemNumber: string;
	itemName: string;
	stockOptions: string[];
	documentCount: number;
	maxCoilMeters: number;
};

type StepKoblingerProps = {
	product: StepKoblingerProduct;
	onBack: () => void;
	onContinue: () => void;
	isContinuing?: boolean;
};

type VariantRecord = {
	productNumber: string;
	itemNumber: string;
	itemName?: string;
	itemCount?: number | string;
	SDS?: string;
	GTIN?: string | null;
	inventory?: Array<{
		warehouseId: number;
		warehouseNumber?: string;
		warehouseName: string;
		companyId: number;
		companyNumber?: number;
		balance: number;
	}>;
	attributes: Array<{
		attributeIdentifier: string;
		name: string;
		valueDef: string;
		contentUnit?: string;
	}>;
	mediaId?: Array<{
		url: string;
		filename: string;
		picture_type: string;
		thumbnail_url: string;
	}>;
};

function parseMeters(value: string): number | null {
	const normalized = value.trim().replace(/\s/g, "").replace(",", ".");
	if (!normalized) return null;
	const parsed = Number(normalized);
	return Number.isFinite(parsed) ? parsed : null;
}

function formatMm(meters: number): string {
	const mm = Math.round(meters * 1000);
	return mm.toLocaleString("nb-NO").replace(/\u00a0/g, " ");
}

function getVariantRecord(
	data: ReturnType<typeof useGetColumnAttributes>["data"],
	itemNumber: string,
): VariantRecord | null {
	if (!data) return null;
	const raw = data[itemNumber] ?? data[String(itemNumber)];
	if (!raw || Array.isArray(raw) || typeof raw !== "object") return null;
	if (!("itemNumber" in raw) || !("attributes" in raw)) return null;
	return raw as VariantRecord;
}

function resolveCoilMeters(
	variant: VariantRecord | null,
	fallback: number,
): number {
	const attrs = variant?.attributes ?? [];
	const coilAttr = attrs.find((attr) => {
		const name = attr.name?.toLowerCase() ?? "";
		return (
			name.includes("kveil") ||
			name.includes("coil") ||
			name.includes("max lengde") ||
			name.includes("maks lengde")
		);
	});
	if (coilAttr?.valueDef) {
		const parsed = Number(
			String(coilAttr.valueDef).replace(",", ".").replace(/[^\d.]/g, ""),
		);
		if (Number.isFinite(parsed) && parsed > 0) return parsed;
	}

	if (variant?.itemCount != null) {
		const parsed = Number(variant.itemCount);
		if (Number.isFinite(parsed) && parsed > 0) return parsed;
	}

	return fallback;
}

function StepKoblingerLoading() {
	return (
		<div className="space-y-6 pb-10">
			<Skeleton className="h-6 w-32 bg-[#E8EAE9]" />
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-[5fr_7fr]">
				<Skeleton className="aspect-square w-full rounded-md bg-[#E8EAE9]" />
				<div className="space-y-4">
					<Skeleton className="h-7 w-[70%] bg-[#E8EAE9]" />
					<Skeleton className="h-4 w-full bg-[#E8EAE9]" />
					<Skeleton className="h-4 w-[85%] bg-[#E8EAE9]" />
					<Skeleton className="h-28 w-full rounded-md bg-[#E8EAE9]" />
					<Skeleton className="h-40 w-full rounded-md bg-[#E8EAE9]" />
				</div>
			</div>
		</div>
	);
}

export function StepKoblinger({
	product,
	onBack,
	onContinue,
	isContinuing = false,
}: StepKoblingerProps) {
	const t = useTranslations("HoseConfigurator.step2");
	const locale = useLocale();
	const { data: profile } = useGetProfileData();
	const {
		data: columnAttributes,
		isLoading,
		error,
	} = useGetColumnAttributes(product.itemNumber);

	const [lengthMtr, setLengthMtr] = useState(
		() => loadHoseConfiguratorDraft()?.koblinger?.lengthMtr ?? "12,12",
	);
	const [quantity, setQuantity] = useState(
		() => loadHoseConfiguratorDraft()?.koblinger?.quantity ?? 2,
	);
	const [warehouseNumber, setWarehouseNumber] = useState(
		() => loadHoseConfiguratorDraft()?.koblinger?.warehouseNumber ?? "",
	);

	useEffect(() => {
		patchHoseConfiguratorDraft({
			koblinger: { lengthMtr, quantity, warehouseNumber },
		});
	}, [lengthMtr, quantity, warehouseNumber]);

	const variant = useMemo(
		() => getVariantRecord(columnAttributes, product.itemNumber),
		[columnAttributes, product.itemNumber],
	);

	const productData = columnAttributes?.productData;

	const displayName = useMemo(() => {
		if (!productData) return product.name;
		const localized =
			locale === "en" ? productData.productNameEn : productData.productNameNo;
		return localized?.trim() || product.name;
	}, [locale, product.name, productData]);

	const displayDescription = useMemo(() => {
		if (!productData) return product.description;
		const localized =
			locale === "en" ? productData.shortDescEn : productData.shortDescNo;
		const fallback =
			locale === "en" ? productData.shortDescNo : productData.shortDescEn;
		return localized?.trim() || fallback?.trim() || product.description;
	}, [locale, product.description, productData]);

	const displayImage = useMemo(() => {
		const media = variant?.mediaId ?? [];
		const main =
			media.find((m) => m.picture_type === "MainImage") ?? media[0];
		if (main?.url || main?.thumbnail_url) {
			return main.url || main.thumbnail_url;
		}
		const productMedia = productData?.mediaId;
		if (productMedia && typeof productMedia === "object" && "url" in productMedia) {
			return (
				(productMedia as { url?: string; thumbnail_url?: string }).url ||
				(productMedia as { thumbnail_url?: string }).thumbnail_url ||
				product.imageSrc
			);
		}
		return product.imageSrc;
	}, [product.imageSrc, productData?.mediaId, variant?.mediaId]);

	const itemName = variant?.itemName?.trim() || product.itemName;

	const warehouseOptions = useMemo(
		() =>
			buildWarehouseOptions(variant?.inventory, {
				warehouseLabel: locale === "no" ? "Lager" : "Warehouse",
			}),
		[locale, variant?.inventory],
	);

	const unit = resolveProductUnit(variant?.attributes, t("unit"));
	const maxCoilMeters = resolveCoilMeters(variant, product.maxCoilMeters);

	const hasSDS =
		variant?.SDS === "True" || variant?.SDS === "true";
	const documentCount = 1 + (hasSDS ? 1 : 0);

	useEffect(() => {
		if (!warehouseOptions.length) return;
		const preferred = pickPreferredWarehouse(
			warehouseOptions,
			profile?.defaultWarehouseNumber,
		);
		setWarehouseNumber((current) => {
			if (current && warehouseOptions.some((w) => w.warehouseNumber === current)) {
				return current;
			}
			return preferred?.warehouseNumber ?? warehouseOptions[0].warehouseNumber;
		});
	}, [profile?.defaultWarehouseNumber, warehouseOptions]);

	const lengthMmLabel = useMemo(() => {
		const meters = parseMeters(lengthMtr);
		if (meters === null) return null;
		return `= ${formatMm(meters)} mm`;
	}, [lengthMtr]);

	if (isLoading && !columnAttributes) {
		return <StepKoblingerLoading />;
	}

	return (
		<div className="space-y-6 pb-10">
			<div>
				<h2 className="inline-block border-b-2 border-[#009640] pb-1 text-base font-semibold text-[#0F1912]">
					{t("yourHose")}
				</h2>
			</div>

			{error ? (
				<p className="text-sm text-[#C62828]">{t("loadError")}</p>
			) : null}

			<div className="grid grid-cols-1 gap-8 lg:grid-cols-[5fr_7fr] lg:items-start">
				<div className="w-full rounded-md border border-[#C1C4C2] bg-white p-4">
					<ZoomImage
						src={displayImage}
						alt={displayName}
						width={640}
						height={640}
						className="aspect-square w-full max-w-none rounded-md"
						priority
						sizes="(max-width: 1024px) 100vw, 40vw"
						alwaysShowExpand
						expandAriaLabel={t("expandImage")}
					/>
				</div>

				<div className="min-w-0 space-y-4">
					<div>
						<h3 className="text-xl font-bold text-[#0F1912]">{displayName}</h3>
						{displayDescription ? (
							<p className="mt-2 text-sm leading-relaxed text-[#5A615D]">
								{displayDescription}
							</p>
						) : null}
					</div>

					<div className="rounded-md border border-[#B7E0C2] bg-[#E8F8EB] p-4">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
							<div className="min-w-0 flex-1 space-y-2.5 text-sm text-[#0F1912]">
								<p>
									<span className="font-bold">{t("itemNumber")}: </span>
									{product.itemNumber}
								</p>
								<p>
									<span className="font-bold">{t("itemName")}: </span>
									{itemName}
								</p>
								<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
									<span className="shrink-0 font-bold">
										{t("stockStatus")}:
									</span>
									{warehouseOptions.length > 0 ? (
										<Select
											value={warehouseNumber}
											onValueChange={setWarehouseNumber}>
											<SelectTrigger
												id="stock-status"
												className="h-10 w-full bg-white sm:max-w-md">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{warehouseOptions.map((option) => (
													<SelectItem
														key={`${option.companyNumber}-${option.warehouseNumber}`}
														value={option.warehouseNumber}>
														{option.balance} {unit} på {option.warehouseName}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									) : (
										<span className="text-[#5A615D]">{t("noStock")}</span>
									)}
								</div>
							</div>
							<ProductDocumentsDrawer
								columnAttributes={columnAttributes}
								selectedItemNumber={product.itemNumber}
								firstItemNumber={product.itemNumber}
								locale={locale}
								name={displayName}
								productNumber={
									variant?.productNumber ?? product.productNumber
								}
								imageUrl={displayImage}
								gtin={variant?.GTIN}
								variants={[{ itemNumber: product.itemNumber }]}
								profile={profile}
								trigger={
									<Button
										type="button"
										variant="outlineGrey"
										className="h-10 shrink-0 self-start bg-white sm:self-center">
										{t("documentation", { count: documentCount })}
									</Button>
								}
							/>
						</div>
					</div>

					<div className="rounded-md border border-[#C1C4C2] bg-white p-4">
						<div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
							<div className="min-w-0 flex-1">
								<div className="flex flex-col gap-4 sm:flex-row sm:items-start">
									<div className="min-w-0 flex-1 space-y-1.5">
										<Label
											htmlFor="desired-length"
											className="text-sm font-semibold text-[#0F1912]">
											{t("desiredLength")}
										</Label>
										<Input
											id="desired-length"
											value={lengthMtr}
											onChange={(event) => setLengthMtr(event.target.value)}
											className="h-10 max-w-[140px] bg-white"
										/>
										{lengthMmLabel && (
											<p className="text-sm text-[#5A615D]">
												{lengthMmLabel}
											</p>
										)}
									</div>

									<div className="min-w-0 flex-1 space-y-1.5">
										<Label
											htmlFor="quantity"
											className="text-sm font-semibold text-[#0F1912]">
											{t("fullLengths")}
										</Label>
										<div className="flex h-10 max-w-[200px] items-stretch overflow-hidden rounded-md border border-[#C1C4C2] bg-white">
											<button
												type="button"
												aria-label={t("decreaseQuantity")}
												onClick={() =>
													setQuantity((prev) => Math.max(1, prev - 1))
												}
												className="flex w-10 items-center justify-center bg-[#E8EAE9] text-[#0F1912] hover:bg-[#DCE0DD]">
												<Minus className="h-4 w-4" />
											</button>
											<span
												id="quantity"
												className="flex flex-1 items-center justify-center text-sm font-medium text-[#0F1912]">
												{quantity} {unit}
											</span>
											<button
												type="button"
												aria-label={t("increaseQuantity")}
												onClick={() => setQuantity((prev) => prev + 1)}
												className="flex w-10 items-center justify-center bg-[#E8EAE9] text-[#0F1912] hover:bg-[#DCE0DD]">
												<Plus className="h-4 w-4" />
											</button>
										</div>
									</div>
								</div>

								<div className="mt-4 border-t border-[#E8EAE9] pt-3">
									<p className="text-sm text-[#5A615D]">
										{t("coilNote", { max: maxCoilMeters })}
									</p>
								</div>
							</div>

							<aside className="flex gap-2 rounded-md bg-[#E8F8EB] p-3 lg:w-[240px] lg:shrink-0">
								<Info
									className="mt-0.5 h-4 w-4 shrink-0 text-[#009640]"
									aria-hidden
								/>
								<div className="text-sm leading-snug text-[#005522]">
									<p className="font-bold text-[#009640]">
										{t("lengthInfoTitle")}
									</p>
									<p className="mt-1">{t("lengthInfoText")}</p>
								</div>
							</aside>
						</div>
					</div>
				</div>
			</div>

			<div className="pt-4">
				<StepKoblingerSpecs
					onBack={onBack}
					onContinue={onContinue}
					isContinuing={isContinuing}
				/>
			</div>
		</div>
	);
}
