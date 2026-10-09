"use client";

import { Button } from "@/components/ui/button";
import { loadHoseConfiguratorDraft } from "@/lib/hose-configurator-draft";
import { cn } from "@/lib/utils";
import type {
	HoseAssemblyFerrule,
	HoseAssemblyInsert,
	HoseAssemblyInsertMatch,
	HoseAssemblyResponse,
	HoseAssemblyService,
} from "@/types/hose-configurator.types";
import { ArrowLeft, Check, Loader2, Pencil, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import type { BruksomradeFormValues } from "./step-bruksomrade";
import type { StepKoblingerProduct } from "./step-koblinger";

type StepOppsummeringProps = {
	product: StepKoblingerProduct;
	assembly?: HoseAssemblyResponse | null;
	isLoadingAssembly?: boolean;
	bruksomrade: BruksomradeFormValues | null;
	onEditSpecs: () => void;
	onEditSetup: () => void;
	onBack: () => void;
	onAddToCart: () => void | Promise<void>;
	isAddingToCart?: boolean;
};

const OPTION_KEYS = [
	"innerCleaning",
	"flushing",
	"testCertificate",
	"spiralProtection",
	"protectionSleeve",
	"heatFireProtection",
	"rfid",
	"hoseTag",
	"extraMarking",
] as const;

const MOCK_PRICING = {
	price: "184,30",
	vat: "50,00",
	total: "234,30",
};

function SpecCell({
	label,
	value,
	showDivider,
}: {
	label: string;
	value: string;
	showDivider?: boolean;
}) {
	return (
		<div
			className={cn(
				"min-w-0 px-3 py-1 first:pl-0 last:pr-0",
				showDivider && "border-l border-[#E8EAE9]",
			)}>
			<p className="text-xs text-[#5A615D]">{label}</p>
			<p className="mt-0.5 text-sm font-medium text-[#0F1912]">{value}</p>
		</div>
	);
}

const PIPE_ASSETS = {
	femaleTop: "/icons/pipe/carboonsteel-female-top.svg",
	femaleBottom: "/icons/pipe/carboonsteel-female-bottom.svg",
	pipeTop: "/icons/pipe/carboonsteel-pipe-top.svg",
	pipeBottom: "/icons/pipe/carboonsteel-pipe-bottom.svg",
} as const;

function SetupColumn({
	title,
	subtitle,
	imageSrc,
	diagramSrc,
	mirrorImages,
	wide,
}: {
	title: string;
	subtitle: string;
	imageSrc: string;
	diagramSrc: string;
	mirrorImages?: boolean;
	wide?: boolean;
}) {
	const imageClass = cn("object-contain", mirrorImages && "scale-x-[-1]");

	return (
		<div
			className={cn(
				"flex min-w-0 flex-col gap-3",
				wide ? "md:col-span-2" : "md:col-span-1",
			)}>
			<div className="rounded-md border border-[#E8EAE9] bg-[#F8F9F8] px-3 py-4 text-center">
				<p className="text-sm font-bold text-[#0F1912]">{title}</p>
				<p className="mt-1 text-xs leading-snug text-[#5A615D]">{subtitle}</p>
			</div>
			<div className="flex min-h-[140px] items-center justify-center rounded-md border border-[#E8EAE9] bg-[#F8F9F8] p-4">
				<div
					className={cn(
						"relative h-28 w-full",
						wide ? "max-w-[320px]" : "max-w-[160px]",
					)}>
					<Image
						src={imageSrc}
						alt={title}
						fill
						className={imageClass}
						sizes={wide ? "320px" : "160px"}
					/>
				</div>
			</div>
			<div className="flex min-h-[100px] items-center justify-center rounded-md border border-[#E8EAE9] bg-[#F8F9F8] p-4">
				<div
					className={cn(
						"relative h-16 w-full",
						wide ? "max-w-[280px]" : "max-w-[140px]",
					)}>
					<Image
						src={diagramSrc}
						alt=""
						fill
						className={imageClass}
						sizes={wide ? "280px" : "140px"}
					/>
				</div>
			</div>
		</div>
	);
}

function localizedPartName(
	item: {
		productNameNo?: string;
		productNameEn?: string;
		product_name_no?: string;
		product_name_en?: string;
		itemName?: string;
	},
	locale: string,
) {
	const norwegian = item.productNameNo || item.product_name_no || item.itemName;
	const english = item.productNameEn || item.product_name_en || item.itemName;
	return (locale === "en" ? english || norwegian : norwegian || english) || "—";
}

function isInsertMatch(value: HoseAssemblyInsert): value is HoseAssemblyInsertMatch {
	return typeof value === "object" && value != null && "itemNumber" in value;
}

function matchedInserts(inserts: HoseAssemblyInsert[] | undefined) {
	return (inserts ?? []).filter(isInsertMatch);
}

function insertMessage(inserts: HoseAssemblyInsert[] | undefined) {
	return (inserts ?? []).find((insert) => typeof insert === "string") ?? null;
}

function hasFerrule(ferrule: HoseAssemblyFerrule | undefined) {
	if (!ferrule) return false;
	return Boolean(
		ferrule.itemNumber || ferrule.productNameNo || ferrule.productNameEn,
	);
}

function endTitle(insert: HoseAssemblyInsertMatch | undefined, message: string | null) {
	if (insert) {
		return [insert.fittingType, insert.gender].filter(Boolean).join(" ") || "—";
	}
	return message || "—";
}

function AssemblyPartList({
	title,
	ferruleLabel,
	insertLabel,
	ferrules,
	inserts,
	locale,
}: {
	title: string;
	ferruleLabel: string;
	insertLabel: string;
	ferrules: HoseAssemblyFerrule[];
	inserts: HoseAssemblyInsert[];
	locale: string;
}) {
	const presentFerrules = ferrules.filter(hasFerrule);
	const presentInserts = matchedInserts(inserts);
	const message = insertMessage(inserts);
	if (presentFerrules.length === 0 && presentInserts.length === 0 && !message) {
		return null;
	}

	return (
		<div>
			<h3 className="text-sm font-bold text-[#0F1912]">{title}</h3>
			<ul className="mt-2 space-y-1.5 text-sm text-[#5A615D]">
				{presentFerrules.map((ferrule, index) => (
					<li key={`ferrule-${ferrule.itemNumber}-${index}`}>
						{ferruleLabel}: {localizedPartName(ferrule, locale)} ·{" "}
						{ferrule.itemNumber}
						{ferrule.quantity ? ` · ${ferrule.quantity}` : ""}
					</li>
				))}
				{presentInserts.map((insert, index) => (
					<li key={`insert-${insert.itemNumber}-${index}`}>
						{insertLabel}: {localizedPartName(insert, locale)} ·{" "}
						{insert.itemNumber}
						{insert.quantity ? ` · ${insert.quantity}` : ""}
					</li>
				))}
				{message && presentInserts.length === 0 && <li>{message}</li>}
			</ul>
		</div>
	);
}

function endSubtitle(
	insert: HoseAssemblyInsertMatch | undefined,
	ferrule: HoseAssemblyFerrule | undefined,
) {
	const presentFerrule = hasFerrule(ferrule) ? ferrule : undefined;
	return (
		[insert?.angle, presentFerrule?.material, presentFerrule?.dimension]
			.filter(Boolean)
			.join(" · ") || "—"
	);
}

export function StepOppsummering({
	product,
	assembly = null,
	isLoadingAssembly = false,
	bruksomrade,
	onEditSpecs,
	onEditSetup,
	onBack,
	onAddToCart,
	isAddingToCart = false,
}: StepOppsummeringProps) {
	const t = useTranslations("HoseConfigurator.step3");
	const locale = useLocale();
	const draft = loadHoseConfiguratorDraft();
	const configuredHose = assembly?.hose[0];
	const quantity = configuredHose?.quantity ?? draft?.koblinger?.quantity ?? 1;
	const lengthMtr =
		configuredHose?.lengthMeters != null
			? String(configuredHose.lengthMeters)
			: (draft?.koblinger?.lengthMtr ?? "");
	const selectedOptions = OPTION_KEYS.filter(
		(key) => draft?.specs?.options?.[key],
	);
	const services: HoseAssemblyService[] = assembly?.service ?? [];

	const mediumLabel = configuredHose
		? configuredHose.medium || "—"
		: bruksomrade?.medium || t("specs.mediumValue");

	const sizeLabel = configuredHose?.dimension
		? `${configuredHose.dimension}"`
		: bruksomrade?.hoseSize
			? `${bruksomrade.hoseSize}"`
			: '1/2"';

	const pressureLabel =
		configuredHose?.pressure != null
			? `${configuredHose.pressure} bar`
			: bruksomrade?.workingPressure
				? `${bruksomrade.workingPressure} bar`
				: "250 bar";

	const temperatureFrom = bruksomrade?.temperatureMin ?? "";
	const temperatureTo = bruksomrade?.temperatureMax ?? "";
	const temperatureLabel =
		configuredHose?.temperature != null
			? `${configuredHose.temperature} °C`
			: temperatureFrom && temperatureTo && temperatureFrom !== temperatureTo
				? `${temperatureFrom} – ${temperatureTo} °C`
				: temperatureFrom || temperatureTo
					? `${temperatureFrom || temperatureTo} °C`
					: "-80 °C";

	const moreLabel = configuredHose?.otherRequirments?.trim() || "—";
	const productTitle = configuredHose
		? locale === "en"
			? configuredHose.productNameEn || configuredHose.productNameNo
			: configuredHose.productNameNo || configuredHose.productNameEn
		: t("productBrand");
	const productDescription = configuredHose?.itemName || product.description;
	const [end1Insert] = matchedInserts(assembly?.insert1);
	const [end2Insert] = matchedInserts(assembly?.insert2);
	const end1Ferrule = assembly?.ferrule1.find(hasFerrule);
	const end2Ferrule = assembly?.ferrule2.find(hasFerrule);
	const end1Title = assembly
		? endTitle(end1Insert, insertMessage(assembly.insert1))
		: t("setup.fittingSummary");
	const end2Title = assembly
		? endTitle(end2Insert, insertMessage(assembly.insert2))
		: t("setup.fittingSummary");
	const end1Subtitle = assembly
		? endSubtitle(end1Insert, end1Ferrule)
		: t("setup.fittingMeta");
	const end2Subtitle = assembly
		? endSubtitle(end2Insert, end2Ferrule)
		: t("setup.fittingMeta");
	const lengthLabel = lengthMtr
		? t("setup.lengthDynamic", { length: lengthMtr })
		: t("setup.length");

	if (isLoadingAssembly) {
		return (
			<div className="flex items-center gap-2 py-16 text-sm text-[#5A615D]">
				<Loader2 className="h-4 w-4 animate-spin text-[#009640]" />
				{t("assemblyLoading")}
			</div>
		);
	}

	return (
		<div className="pb-10">
			<div className="flex flex-col gap-8 lg:flex-row lg:items-start">
				{/* Main column */}
				<div className="min-w-0 flex-1 space-y-8">
					{/* Spesifikasjoner */}
					<section>
						<div className="mb-4 flex items-center justify-between gap-3">
							<div className="flex items-center gap-2">
								<Image
									src="/icons/HoseIcon.svg"
									alt=""
									width={22}
									height={12}
									className="h-3 w-auto"
								/>
								<h2 className="text-base font-bold text-[#0F1912]">
									{t("specifications")}
								</h2>
							</div>
							<button
								type="button"
								onClick={onEditSpecs}
								className="inline-flex items-center gap-1.5 text-sm font-medium text-[#009640] hover:text-[#005522]">
								<Pencil className="h-3.5 w-3.5" />
								{t("edit")}
							</button>
						</div>

						<h3 className="text-xl font-bold text-[#0F1912]">
							{productTitle}
						</h3>
						<p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#5A615D]">
							{productDescription}
						</p>

						<div className="mt-5 grid grid-cols-2 gap-y-4 sm:grid-cols-3 xl:grid-cols-7 xl:gap-0">
							<SpecCell
								label={t("specs.itemNumber")}
								value={configuredHose?.itemNumber || product.itemNumber}
							/>
							<SpecCell
								label={t("specs.itemName")}
								value={configuredHose?.itemName || product.itemName}
								showDivider
							/>
							<SpecCell
								label={t("specs.medium")}
								value={mediumLabel}
								showDivider
							/>
							<SpecCell
								label={t("specs.size")}
								value={sizeLabel}
								showDivider
							/>
							<SpecCell
								label={t("specs.pressure")}
								value={pressureLabel}
								showDivider
							/>
							<SpecCell
								label={t("specs.temperature")}
								value={temperatureLabel}
								showDivider
							/>
							<SpecCell
								label={t("specs.more")}
								value={moreLabel}
								showDivider
							/>
						</div>
					</section>

					{/* Slangeoppsett */}
					<section className="border-t border-[#E8EAE9] pt-8">
						<div className="mb-1 flex items-center justify-between gap-3">
							<div className="flex items-center gap-2">
								<Image
									src="/icons/code-branch-outline.svg"
									alt=""
									width={18}
									height={18}
									className="h-[18px] w-[18px]"
								/>
								<h2 className="text-base font-bold text-[#0F1912]">
									{t("setup.title")}
								</h2>
							</div>
							<button
								type="button"
								onClick={onEditSetup}
								className="inline-flex items-center gap-1.5 text-sm font-medium text-[#009640] hover:text-[#005522]">
								<Pencil className="h-3.5 w-3.5" />
								{t("edit")}
							</button>
						</div>
						<p className="mb-4 text-sm text-[#5A615D]">
							{t("setup.subtitle")}
						</p>

						<div className="mb-4 flex items-center gap-2 rounded-md bg-[#E8F8EB] px-4 py-3 text-sm font-medium text-[#0F1912]">
							<span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#009640]">
								<Check
									className="h-2.5 w-2.5 text-white"
									strokeWidth={3}
								/>
							</span>
							{t("setup.quantity", { count: quantity })}
						</div>

						<div className="grid grid-cols-1 gap-3 md:grid-cols-4">
							<SetupColumn
								title={end1Title}
								subtitle={end1Subtitle}
								imageSrc={PIPE_ASSETS.femaleTop}
								diagramSrc={PIPE_ASSETS.femaleBottom}
							/>
							<SetupColumn
								title={lengthLabel}
								subtitle={t("setup.lengthNote")}
								imageSrc={PIPE_ASSETS.pipeTop}
								diagramSrc={PIPE_ASSETS.pipeBottom}
								wide
							/>
							<SetupColumn
								title={end2Title}
								subtitle={end2Subtitle}
								imageSrc={PIPE_ASSETS.femaleTop}
								diagramSrc={PIPE_ASSETS.femaleBottom}
								mirrorImages
							/>
						</div>
						{assembly && (
							<div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
								<AssemblyPartList
									title={t("parts.end1")}
									ferruleLabel={t("parts.ferrule")}
									insertLabel={t("parts.insert")}
									ferrules={assembly.ferrule1}
									inserts={assembly.insert1}
									locale={locale}
								/>
								<AssemblyPartList
									title={t("parts.end2")}
									ferruleLabel={t("parts.ferrule")}
									insertLabel={t("parts.insert")}
									ferrules={assembly.ferrule2}
									inserts={assembly.insert2}
									locale={locale}
								/>
							</div>
						)}
					</section>

					{/* Tilvalg */}
					<section className="border-t border-[#E8EAE9] pt-8">
						<h2 className="mb-4 text-base font-bold text-[#0F1912]">
							{t("optionsTitle")}
						</h2>
						<div className="flex flex-wrap gap-2">
							{services.length > 0 ? (
								services.map((service) => (
									<span
										key={`${service.serviceType}-${service.itemNumber}`}
										className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F8EB] px-3 py-1.5 text-sm font-medium text-[#005522]">
										<Check
											className="h-3.5 w-3.5 text-[#009640]"
											strokeWidth={3}
										/>
										{service.itemName || service.description || service.serviceType}
										{service.quantity ? ` · ${service.quantity}` : ""}
									</span>
								))
							) : selectedOptions.length === 0 ? (
								<p className="text-sm text-[#5A615D]">{t("noOptions")}</p>
							) : (
								selectedOptions.map((key) => (
									<span
										key={key}
										className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F8EB] px-3 py-1.5 text-sm font-medium text-[#005522]">
										<Check
											className="h-3.5 w-3.5 text-[#009640]"
											strokeWidth={3}
										/>
										{t(`options.${key}`)}
									</span>
								))
							)}
						</div>
					</section>
				</div>

				{/* Price sidebar */}
				<aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-[300px]">
					<div className="rounded-md border border-[#E8EAE9] bg-white p-5">
						<h2 className="text-base font-bold text-[#0F1912]">
							{t("pricing.title")}
						</h2>
						<dl className="mt-4 space-y-3 text-sm">
							<div className="flex justify-between gap-3">
								<dt className="text-[#5A615D]">{t("pricing.price")}</dt>
								<dd className="font-medium text-[#0F1912]">
									{MOCK_PRICING.price} kr
								</dd>
							</div>
							<div className="flex justify-between gap-3">
								<dt className="text-[#5A615D]">{t("pricing.discount")}</dt>
								<dd className="font-medium text-[#0F1912]">-</dd>
							</div>
							<div className="flex justify-between gap-3">
								<dt className="text-[#5A615D]">
									{t("pricing.sumAfterDiscount")}
								</dt>
								<dd className="font-medium text-[#0F1912]">-</dd>
							</div>
							<div className="flex justify-between gap-3">
								<dt className="text-[#5A615D]">{t("pricing.vat")}</dt>
								<dd className="font-medium text-[#0F1912]">
									{MOCK_PRICING.vat} kr
								</dd>
							</div>
						</dl>
						<div className="mt-4 flex justify-between gap-3 border-t border-[#E8EAE9] pt-4">
							<span className="text-sm font-bold text-[#0F1912]">
								{t("pricing.total")}
							</span>
							<span className="text-sm font-bold text-[#0F1912]">
								{MOCK_PRICING.total} kr
							</span>
						</div>

						<div className="mt-5 space-y-3">
							<Button
								type="button"
								variant="greenSolid"
								onClick={onAddToCart}
								disabled={isAddingToCart}
								className="h-11 w-full gap-2">
								{isAddingToCart ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<ShoppingCart className="h-4 w-4" />
								)}
								{isAddingToCart ? t("addingToCart") : t("addToCart")}
							</Button>
							<Button
								type="button"
								variant="outlineGreen"
								onClick={onBack}
								disabled={isAddingToCart}
								className="h-11 w-full gap-2 bg-white">
								<ArrowLeft className="h-4 w-4" />
								{t("backToConfig")}
							</Button>
						</div>
					</div>
				</aside>
			</div>

			{/* Bottom actions */}
			<div className="mt-10 flex flex-col items-center justify-center gap-4 border-t border-[#E8EAE9] py-8 sm:flex-row sm:gap-5">
				<Button
					type="button"
					variant="outlineGrey"
					onClick={onBack}
					disabled={isAddingToCart}
					className="h-11 w-full gap-2 px-8 sm:w-auto">
					<ArrowLeft className="h-4 w-4" />
					{t("back")}
				</Button>
				<Button
					type="button"
					variant="greenSolid"
					onClick={onAddToCart}
					disabled={isAddingToCart}
					className="h-11 w-full gap-2 px-8 sm:w-auto">
					{isAddingToCart ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<ShoppingCart className="h-4 w-4" />
					)}
					{isAddingToCart ? t("addingToCart") : t("addToCart")}
				</Button>
			</div>
		</div>
	);
}
