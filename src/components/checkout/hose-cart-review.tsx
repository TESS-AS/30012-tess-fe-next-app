"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import QuantityButtons from "@/components/ui/quantity-buttons";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Link } from "@/i18n/navigation";
import { getCartKitPartEntries, readCartKitImageUrl } from "@/lib/cart-kit";
import type { CartKitItem, HoseComponent } from "@/types/carts.types";
import { formatNorwegianCurrency } from "@/utils/formatCurrency";
import {
	ChevronDown,
	ChevronUp,
	Copy,
	Info,
	Plus,
	Shield,
	Trash2,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

type LineTotal = (itemNumber: string, quantity: number) => number;

type HoseCartReviewProps = {
	kits: CartKitItem[];
	kitTotal: (kit: CartKitItem) => number;
	lineTotal: LineTotal;
	onRemove: (kit: CartKitItem) => void;
	onSave: (kit: CartKitItem, quantity: number) => void | Promise<void>;
	removingId?: string;
	saving?: boolean;
};

type PartLine = {
	key: string;
	name: string;
	itemNumber: string;
	quantity: number;
	imageUrl?: string;
};

const ADDITION_LETTERS = ["a", "b", "c", "d", "e"] as const;

function hasItemNumber(
	part: Partial<HoseComponent> | null | undefined,
): part is HoseComponent {
	return (
		!!part &&
		typeof part.itemNumber === "string" &&
		part.itemNumber.trim().length > 0
	);
}

function groupParts(
	parts: Array<HoseComponent | null | undefined>,
	keyPrefix: string,
): PartLine[] {
	const grouped = new Map<string, PartLine>();
	for (const part of parts) {
		if (!hasItemNumber(part)) continue;
		const itemNumber = part.itemNumber.trim();
		const quantity =
			Number.isFinite(Number(part.quantity)) && Number(part.quantity) > 0
				? Number(part.quantity)
				: 1;
		const imageUrl = readCartKitImageUrl(part);
		const existing = grouped.get(itemNumber);
		if (existing) {
			existing.quantity += quantity;
			existing.imageUrl ??= imageUrl;
			continue;
		}
		grouped.set(itemNumber, {
			key: `${keyPrefix}-${itemNumber}`,
			name: part.name?.trim() || itemNumber,
			itemNumber,
			quantity,
			imageUrl,
		});
	}
	return [...grouped.values()];
}

function formatQuantity(quantity: number) {
	return new Intl.NumberFormat("nb-NO", {
		maximumFractionDigits: 2,
	}).format(quantity);
}

function Accordion({
	title,
	open,
	onToggle,
	children,
}: {
	title: string;
	open: boolean;
	onToggle: () => void;
	children: React.ReactNode;
}) {
	return (
		<div className="border-t border-[#E8EAE9]">
			<button
				type="button"
				onClick={onToggle}
				className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold text-[#0F1912]">
				{title}
				{open ? (
					<ChevronUp className="h-4 w-4 text-[#5A615D]" />
				) : (
					<ChevronDown className="h-4 w-4 text-[#5A615D]" />
				)}
			</button>
			{open ? <div className="space-y-3 pb-4">{children}</div> : null}
		</div>
	);
}

function PartCard({
	label,
	line,
	price,
	seeDetails,
	nameLabel,
	itemNumberLabel,
}: {
	label: string;
	line: PartLine;
	price: number;
	seeDetails: string;
	nameLabel: string;
	itemNumberLabel: string;
}) {
	return (
		<div className="space-y-2">
			<p className="text-sm text-[#5A615D]">{label}</p>
			<div className="flex flex-col gap-3 rounded-md border border-[#E8EAE9] bg-[#FAFBFA] p-3 sm:flex-row sm:items-center">
				<div className="relative h-14 w-14 shrink-0 overflow-hidden rounded border border-[#E8EAE9] bg-white">
					{line.imageUrl ? (
						<Image
							src={line.imageUrl}
							alt=""
							fill
							sizes="56px"
							className="object-contain"
						/>
					) : null}
				</div>
				<div className="min-w-0 flex-1">
					<p className="text-sm text-[#0F1912]">
						<span className="text-[#5A615D]">{nameLabel}: </span>
						<span className="font-semibold">{line.name}</span>
					</p>
					<p className="mt-0.5 text-xs text-[#5A615D]">
						{itemNumberLabel}: {line.itemNumber}
					</p>
				</div>
				<div className="flex shrink-0 items-center gap-3">
					<Link
						href={`/search?q=${encodeURIComponent(line.itemNumber)}`}
						className="rounded-full border border-[#D5D9D7] bg-white px-3 py-1.5 text-xs text-[#0F1912]">
						{seeDetails}
					</Link>
					<div className="flex items-center border-l border-[#E8EAE9] pl-3">
						<span className="w-14 shrink-0 text-sm text-[#5A615D] tabular-nums">
							{formatQuantity(line.quantity)}x
						</span>
						<span className="w-28 shrink-0 text-sm font-semibold text-[#0F1912] tabular-nums">
							{formatNorwegianCurrency(price)}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}

export function HoseCartReview({
	kits,
	kitTotal,
	lineTotal,
	onRemove,
	onSave,
	removingId,
	saving = false,
}: HoseCartReviewProps) {
	const t = useTranslations("Cart.review");
	const [index, setIndex] = useState(0);
	const [mainOpen, setMainOpen] = useState(true);
	const [articlesOpen, setArticlesOpen] = useState(true);
	const [extrasOpen, setExtrasOpen] = useState(true);
	const [quantities, setQuantities] = useState<Record<string, number>>({});
	const [subunit, setSubunit] = useState("");
	const [step, setStep] = useState(0);

	const kit = kits[Math.min(index, kits.length - 1)];
	const quantity = quantities[kit.hexagonId] ?? kit.ferrule1?.quantity ?? 1;

	const ferrules = useMemo(
		() => groupParts([kit.ferrule1, kit.ferrule2], "ferrule"),
		[kit],
	);
	const inserts = useMemo(
		() => groupParts([kit.insert1, kit.insert2], "insert"),
		[kit],
	);
	const hoseLine: PartLine | null = hasItemNumber(kit.hose)
		? {
				key: "hose",
				name: kit.hose.itemName?.trim() || kit.hose.itemNumber,
				itemNumber: kit.hose.itemNumber.trim(),
				quantity:
					Number(kit.hose.quantity) > 0 ? Number(kit.hose.quantity) : 1,
				imageUrl: readCartKitImageUrl(kit.hose),
			}
		: null;
	const mainCount = (hoseLine ? 1 : 0) + ferrules.length + inserts.length;

	const additionals = getCartKitPartEntries(kit.additionals);
	const otherSlots = ADDITION_LETTERS.flatMap((letter) =>
		[1, 2].map((end) => {
			const key = `${letter}End${end}`;
			const match = additionals.find(
				(entry) => entry.key.toLowerCase() === key.toLowerCase(),
			);
			return {
				key,
				label: t("additionSlot", {
					letter: letter.toUpperCase(),
					end: String(end),
				}),
				value: match?.name || match?.itemNumber || "—",
			};
		}),
	);
	const filledArticles = otherSlots.filter((slot) => slot.value !== "—").length;
	const extraParts = additionals.filter(
		(entry) => !/^([a-e])end[12]$/i.test(entry.key),
	);

	const title =
		kit.hose?.itemDescription?.trim() ||
		[kit.hose?.itemNumber, kit.hose?.lengthMm ? `${kit.hose.lengthMm} mm` : ""]
			.filter(Boolean)
			.join(" × ");

	const setQuantity = (next: number) => {
		setQuantities((prev) => ({
			...prev,
			[kit.hexagonId]: Math.max(1, next),
		}));
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center gap-3">
				<h2 className="text-xl font-semibold text-[#0F1912]">{t("title")}</h2>
				<Select
					value={String(kit.cartLine)}
					onValueChange={(id) => {
						setIndex(
							kits.findIndex((item) => String(item.cartLine) === id),
						);
						setStep(0);
					}}>
					<SelectTrigger className="h-10 w-auto min-w-[240px] rounded-full px-3">
						<span className="mr-2 h-2 w-2 shrink-0 rounded-full bg-[#009640]" />
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{kits.map((item, itemIndex) => (
							<SelectItem
								key={item.cartLine}
								value={String(item.cartLine)}>
								{t("hoseOption", {
									id: item.hexagonId,
									current: itemIndex + 1,
									total: kits.length,
								})}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="flex items-center border-b border-[#E8EAE9] pb-4">
				<button
					type="button"
					onClick={() => setStep(0)}
					className={`text-sm ${
						step === 0 ? "font-semibold text-[#003D1A]" : "text-[#009640]"
					}`}>
					2. {t("stepReview")}
				</button>
				<div className="mx-4 h-px flex-1 bg-[#E5E7E5]" />
				<button
					type="button"
					onClick={() => setStep(1)}
					className={`text-sm ${
						step === 1 ? "font-semibold text-[#003D1A]" : "text-[#8A8F8C]"
					}`}>
					3. {t("stepPosition")}
				</button>
			</div>

			{step === 0 ? (
				<div className="rounded-xl border border-[#E8EAE9] p-4 sm:p-5">
					<div className="flex items-start gap-2 rounded-md bg-[#E7F8EE] px-3 py-2 text-sm text-[#0F1912]">
						<Info className="mt-0.5 h-4 w-4 shrink-0 text-[#009640]" />
						<p>
							{quantity === 1
								? t("newId", { id: kit.hexagonId })
								: t("newIds", { count: quantity, id: kit.hexagonId })}
						</p>
					</div>

					<div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<p className="min-w-0 text-sm text-[#0F1912]">
							<span className="font-semibold">ID: {kit.hexagonId}</span>
							{title ? (
								<span className="ml-2 text-[#5A615D]">{title}</span>
							) : null}
						</p>
						<div className="flex items-center gap-4">
							<QuantityButtons
								quantity={quantity}
								min={1}
								onIncrease={() => setQuantity(quantity + 1)}
								onDecrease={() => setQuantity(quantity - 1)}
							/>
							<span className="font-semibold whitespace-nowrap">
								{formatNorwegianCurrency(kitTotal(kit))}
							</span>
							<Button
								className="w-4 p-0"
								size="icon"
								variant="ghost"
								onClick={() => onRemove(kit)}>
								{removingId === kit.hexagonId ? (
									<div className="border-t-primary h-4 w-4 animate-spin rounded-full border-2 border-gray-300" />
								) : (
									<Trash2 className="h-4 w-4 text-[#C81E1E]" />
								)}
							</Button>
						</div>
					</div>

					<Accordion
						title={t("mainComponents", { count: mainCount })}
						open={mainOpen}
						onToggle={() => setMainOpen((open) => !open)}>
						{hoseLine ? (
							<PartCard
								label={t("hose")}
								line={hoseLine}
								price={lineTotal(hoseLine.itemNumber, hoseLine.quantity)}
								seeDetails={t("seeDetails")}
								nameLabel={t("name")}
								itemNumberLabel={t("itemNumber")}
							/>
						) : null}
						{ferrules.map((line) => (
							<PartCard
								key={line.key}
								label={t("ferrule")}
								line={line}
								price={lineTotal(line.itemNumber, line.quantity)}
								seeDetails={t("seeDetails")}
								nameLabel={t("name")}
								itemNumberLabel={t("itemNumber")}
							/>
						))}
						{inserts.length > 0 ? (
							<div className="space-y-2">
								<p className="text-sm text-[#5A615D]">{t("insert")}</p>
								{inserts.map((line) => (
									<div
										key={line.key}
										className="flex flex-col gap-3 rounded-md border border-[#E8EAE9] bg-[#FAFBFA] p-3 sm:flex-row sm:items-center">
										<div className="relative h-14 w-14 shrink-0 overflow-hidden rounded border border-[#E8EAE9] bg-white">
											{line.imageUrl ? (
												<Image
													src={line.imageUrl}
													alt=""
													fill
													sizes="56px"
													className="object-contain"
												/>
											) : null}
										</div>
										<div className="min-w-0 flex-1">
											<p className="text-sm text-[#0F1912]">
												<span className="text-[#5A615D]">{t("name")}: </span>
												<span className="font-semibold">{line.name}</span>
											</p>
											<p className="mt-0.5 text-xs text-[#5A615D]">
												{t("itemNumber")}: {line.itemNumber}
											</p>
										</div>
										<div className="flex shrink-0 items-center gap-3">
											<Link
												href={`/search?q=${encodeURIComponent(line.itemNumber)}`}
												className="rounded-full border border-[#D5D9D7] bg-white px-3 py-1.5 text-xs text-[#0F1912]">
												{t("seeDetails")}
											</Link>
											<div className="flex items-center border-l border-[#E8EAE9] pl-3">
												<span className="w-14 shrink-0 text-sm text-[#5A615D] tabular-nums">
													{formatQuantity(line.quantity)}x
												</span>
												<span className="w-28 shrink-0 text-sm font-semibold text-[#0F1912] tabular-nums">
													{formatNorwegianCurrency(
														lineTotal(line.itemNumber, line.quantity),
													)}
												</span>
											</div>
										</div>
									</div>
								))}
							</div>
						) : null}
					</Accordion>

					<Accordion
						title={t("otherArticles", { count: filledArticles })}
						open={articlesOpen}
						onToggle={() => setArticlesOpen((open) => !open)}>
						<div className="overflow-hidden rounded-md border border-[#E8EAE9]">
							{Array.from({ length: otherSlots.length / 2 }, (_, rowIndex) => {
								const left = otherSlots[rowIndex * 2];
								const right = otherSlots[rowIndex * 2 + 1];
								return (
									<div
										key={left.key}
										className={`grid grid-cols-2 ${
											rowIndex > 0 ? "border-t border-[#E8EAE9]" : ""
										}`}>
										<div className="flex items-center justify-between bg-[#FAFBFA] px-3 py-2 text-sm">
											<span className="text-[#0F1912]">{left.label}</span>
											<span className="text-[#8A8F8C]">{left.value}</span>
										</div>
										<div className="flex items-center justify-between border-l border-[#E8EAE9] bg-[#FAFBFA] px-3 py-2 text-sm">
											<span className="text-[#0F1912]">{right?.label}</span>
											<span className="text-[#8A8F8C]">{right?.value}</span>
										</div>
									</div>
								);
							})}
						</div>
					</Accordion>

					<Accordion
						title={t("extraEquipment", { count: extraParts.length })}
						open={extrasOpen}
						onToggle={() => setExtrasOpen((open) => !open)}>
						{extraParts.map((part) => (
							<div
								key={part.key}
								className="rounded-md border border-[#E8EAE9] bg-[#FAFBFA] px-3 py-2 text-sm">
								<p className="font-medium text-[#0F1912]">
									{part.name || part.itemNumber}
								</p>
								<p className="text-xs text-[#5A615D]">{part.itemNumber}</p>
							</div>
						))}
						<div className="rounded-md bg-[#E7F8EE] p-4">
							<p className="flex items-center gap-2 text-sm font-semibold text-[#009640]">
								<Shield className="h-4 w-4" />
								{t("protectTitle")}
							</p>
							<p className="mt-1 text-sm text-[#0F1912]">{t("protectBody")}</p>
							<div className="mt-3 flex flex-wrap gap-2">
								<Button
									type="button"
									variant="outline"
									className="h-9 bg-white">
									<Plus className="mr-1 h-4 w-4" />
									{t("addProtection")}
								</Button>
								<Button
									type="button"
									variant="outline"
									className="h-9 bg-white">
									<Copy className="mr-1 h-4 w-4" />
									{t("copyPrevious")}
								</Button>
							</div>
						</div>
					</Accordion>
					<Button
						type="button"
						variant="greenSolid"
						className="mt-5 h-11"
						onClick={() => setStep(1)}>
						{t("next")}
					</Button>
				</div>
			) : (
				<div className="rounded-xl border border-[#E8EAE9] p-4 sm:p-5">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-semibold text-[#0F1912]">
							{t("positionTitle")}
						</h3>
						<Info className="h-4 w-4 text-[#009640]" />
					</div>
					<dl className="mt-4 space-y-3 text-sm">
						<div>
							<dt className="font-semibold text-[#0F1912]">S1</dt>
							<dd className="text-[#5A615D]">—</dd>
						</div>
						<div>
							<dt className="font-semibold text-[#0F1912]">S2</dt>
							<dd className="text-[#5A615D]">—</dd>
						</div>
						<div>
							<dt className="font-semibold text-[#0F1912]">{t("otherInfo")}</dt>
							<dd className="text-[#5A615D]">—</dd>
						</div>
						<div>
							<dt className="font-semibold text-[#0F1912]">
								{t("equipmentSubunit")}
							</dt>
							<dd>
								<input
									value={subunit}
									onChange={(event) => setSubunit(event.target.value)}
									className="mt-1 h-10 w-full rounded-md border border-[#D5D9D7] px-3 text-sm"
								/>
								<p className="mt-1 text-xs text-[#8A8F8C]">
									{t("subunitHint")}
								</p>
							</dd>
						</div>
					</dl>
					<div className="mt-5 flex flex-col gap-2 sm:flex-row">
						<Button
							type="button"
							variant="outline"
							className="h-11 sm:w-40"
							onClick={() => setStep(0)}>
							{t("back")}
						</Button>
						<Button
							variant="greenSolid"
							className="h-11 sm:flex-1"
							disabled={saving}
							onClick={() => void onSave(kit, quantity)}>
							{t("saveToCart")}
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
