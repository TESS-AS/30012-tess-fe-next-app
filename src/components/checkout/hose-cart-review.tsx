"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useGetHoseSystems } from "@/hooks/useGetHoseSystems";
import { Link } from "@/i18n/navigation";
import { getCartKitPartEntries, readCartKitImageUrl } from "@/lib/cart-kit";
import type { CartKitItem, HoseComponent } from "@/types/carts.types";
import {
	ChevronDown,
	ChevronUp,
	Copy,
	Info,
	Minus,
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
	onSave: (
		kit: CartKitItem,
		changes: {
			quantity: number;
			hoseLengthMm?: number;
			s1Id?: number;
			s2Id?: number;
		},
	) => void | Promise<void>;
	removingId?: string;
	saving?: boolean;
	children: (slots: {
		main: React.ReactNode;
		aside: React.ReactNode;
	}) => React.ReactNode;
};

type PartLine = {
	key: string;
	name: string;
	itemNumber: string;
	quantity: number;
	imageUrl?: string;
};

const ADDITION_LETTERS = ["a", "b", "c", "d", "e"] as const;

const SERVICE_NAME_KEYS = {
	pressingItem: "serviceNames.pressingItem",
	jetCleanItem: "serviceNames.jetCleanItem",
	pressureTestItem: "serviceNames.pressureTestItem",
	electricControl: "serviceNames.electricControl",
	pinPrickItem: "serviceNames.pinPrickItem",
	hoseProtection: "serviceNames.hoseProtection",
	spiralGuard: "serviceNames.spiralGuard",
	welding: "serviceNames.welding",
	marking: "serviceNames.marking",
	finalInspection: "serviceNames.finalInspection",
} as const;

function serviceName(
	t: (key: (typeof SERVICE_NAME_KEYS)[keyof typeof SERVICE_NAME_KEYS]) => string,
	key: string,
) {
	const messageKey = SERVICE_NAME_KEYS[key as keyof typeof SERVICE_NAME_KEYS];
	return messageKey ? t(messageKey) : "";
}

function placeLabel(name?: string | null, code?: string | null) {
	const label = name?.trim() || code?.trim();
	return label || "—";
}

type KitDraft = {
	hoseLengthMm: string;
	s1Id: string;
	s2Id: string;
};

type PlaceOption = { id: string; name: string };

function draftFor(kit: CartKitItem): KitDraft {
	return {
		hoseLengthMm:
			kit.hose?.lengthMm != null && kit.hose.lengthMm > 0
				? String(kit.hose.lengthMm)
				: "",
		s1Id: kit.s1?.s1Id != null ? String(kit.s1.s1Id) : "",
		s2Id: kit.s2?.s2Id != null ? String(kit.s2.s2Id) : "",
	};
}

function withCurrentOption(options: PlaceOption[], current?: PlaceOption) {
	if (!current?.id) return options;
	if (options.some((option) => option.id === current.id)) return options;
	return [current, ...options];
}

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

function formatReviewAmount(amount: number) {
	return new Intl.NumberFormat("nb-NO", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);
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
	label?: string;
	line: PartLine;
	price: number;
	seeDetails: string;
	nameLabel: string;
	itemNumberLabel: string;
}) {
	return (
		<div className="space-y-2">
			{label ? <p className="text-sm text-[#5A615D]">{label}</p> : null}
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
						className="rounded-md border border-[#D5D9D7] bg-white px-3 py-1.5 text-xs text-[#0F1912]">
						{seeDetails}
					</Link>
					<div className="flex items-center border-l border-[#E8EAE9] pl-3">
						<span className="w-10 shrink-0 text-sm text-[#5A615D] tabular-nums">
							{formatQuantity(line.quantity)}x
						</span>
						<span className="w-24 shrink-0 text-sm font-semibold text-[#0F1912] tabular-nums">
							{formatReviewAmount(price)},-
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
	children,
}: HoseCartReviewProps) {
	const t = useTranslations("Cart.review");
	const tKit = useTranslations("Cart.kit");
	const [index, setIndex] = useState(0);
	const [mainOpen, setMainOpen] = useState(true);
	const [servicesOpen, setServicesOpen] = useState(true);
	const [articlesOpen, setArticlesOpen] = useState(true);
	const [extrasOpen, setExtrasOpen] = useState(true);
	const [quantities, setQuantities] = useState<Record<string, number>>({});
	const [drafts, setDrafts] = useState<Record<number, KitDraft>>({});
	const [subunit, setSubunit] = useState("");
	const { locations } = useGetHoseSystems();

	const kit = kits[Math.min(index, kits.length - 1)];
	// ferrule quantity is the number of assemblies already in the cart.
	// One assembly uses both ends, so ferrule and insert show 2x at quantity 1.
	const savedQuantity = Math.max(1, Number(kit.ferrule1?.quantity) || 1);
	const quantity = quantities[kit.hexagonId] ?? savedQuantity;
	const multiple = quantity / savedQuantity;
	const draft = drafts[kit.cartLine] ?? draftFor(kit);
	const s1Options = withCurrentOption(
		locations.map((location) => ({ id: location.id, name: location.name })),
		kit.s1?.s1Id != null
			? {
					id: String(kit.s1.s1Id),
					name: placeLabel(kit.s1.s1Name, kit.s1.s1Code),
				}
			: undefined,
	);
	const s2Options = withCurrentOption(
		(locations.find((location) => location.id === draft.s1Id)?.children ??
			[]).map((child) => ({ id: child.id, name: child.name })),
		draft.s2Id === String(kit.s2?.s2Id ?? "") && kit.s2?.s2Id != null
			? {
					id: String(kit.s2.s2Id),
					name: placeLabel(kit.s2.s2Name, kit.s2.s2Code),
				}
			: undefined,
	);

	const setDraft = (patch: Partial<KitDraft>) => {
		setDrafts((prev) => ({
			...prev,
			[kit.cartLine]: { ...(prev[kit.cartLine] ?? draftFor(kit)), ...patch },
		}));
	};

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

	const scaleLine = (line: PartLine) => ({
		line: { ...line, quantity: line.quantity * multiple },
		price: lineTotal(line.itemNumber, line.quantity) * multiple,
	});
	const scaledHose = hoseLine ? scaleLine(hoseLine) : null;
	const scaledFerrules = ferrules.map(scaleLine);
	const scaledInserts = inserts.map(scaleLine);
	const scaledServices = getCartKitPartEntries(kit.services).map((entry) =>
		scaleLine({
			key: entry.key,
			name: serviceName(tKit, entry.key) || entry.name || entry.itemNumber,
			itemNumber: entry.itemNumber,
			quantity: entry.quantity,
			imageUrl: entry.imageUrl,
		}),
	);
	const mainCount = (hoseLine ? 1 : 0) + ferrules.length + inserts.length;

	const additionals = getCartKitPartEntries(kit.additionals);
	const otherSlots = ADDITION_LETTERS.flatMap((letter) =>
		[1, 2].map((end) => {
			const key = `${letter}End${end}`;
			const match = additionals.find(
				(entry) => entry.key.toLowerCase() === key.toLowerCase(),
			);
			const baseQuantity = match?.quantity ?? 0;
			const quantityLabel =
				match && baseQuantity * multiple > 1
					? ` × ${formatQuantity(baseQuantity * multiple)}`
					: "";
			return {
				key,
				label: t("additionSlot", {
					letter: letter.toUpperCase(),
					end: String(end),
				}),
				value: match
					? `${match.name || match.itemNumber}${quantityLabel}`
					: "—",
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

	const main = (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center gap-3">
				<h2 className="text-xl font-semibold text-[#0F1912]">{t("title")}</h2>
				<Select
					value={String(kit.cartLine)}
					onValueChange={(id) =>
						setIndex(kits.findIndex((item) => String(item.cartLine) === id))
					}>
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

			<div className="space-y-4 rounded-xl border border-[#E8EAE9] p-4 sm:p-5">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<p className="min-w-0 text-sm text-[#0F1912]">
							<span>ID: {kit.hexagonId}</span>
							{title ? (
								<span className="ml-2 font-semibold">{title}</span>
							) : null}
						</p>
						<div className="flex items-center gap-3">
							<div className="flex items-center gap-1">
								<button
									type="button"
									aria-label="-"
									disabled={quantity <= 1}
									onClick={() => setQuantity(quantity - 1)}
									className="flex h-8 w-8 items-center justify-center rounded-md border border-[#D5D9D7] bg-white text-[#0F1912] disabled:opacity-40">
									<Minus className="h-3.5 w-3.5" />
								</button>
								<span className="flex h-8 min-w-8 items-center justify-center rounded-md border border-[#D5D9D7] bg-white px-2 text-sm">
									{quantity}
								</span>
								<button
									type="button"
									aria-label="+"
									onClick={() => setQuantity(quantity + 1)}
									className="flex h-8 w-8 items-center justify-center rounded-md border border-[#D5D9D7] bg-white text-[#0F1912]">
									<Plus className="h-3.5 w-3.5" />
								</button>
							</div>
							<span className="text-base font-semibold whitespace-nowrap">
								{formatReviewAmount(kitTotal(kit) * multiple)}
							</span>
							<Button
								className="w-4 p-0"
								size="icon"
								variant="ghost"
								onClick={() => onRemove(kit)}>
								{removingId === kit.hexagonId ? (
									<div className="border-t-primary h-4 w-4 animate-spin rounded-full border-2 border-gray-300" />
								) : (
									<Trash2 className="h-4 w-4 text-[#5A615D]" />
								)}
							</Button>
						</div>
					</div>

					<div className="flex items-start gap-2 rounded-md bg-[#E7F8EE] px-3 py-2 text-sm text-[#0F1912]">
						<Info className="mt-0.5 h-4 w-4 shrink-0 text-[#009640]" />
						<p>
							{quantity === 1
								? t("newId", { id: kit.hexagonId })
								: t("newIds", { count: quantity, id: kit.hexagonId })}
						</p>
					</div>

					<Accordion
						title={t("mainComponents", { count: mainCount })}
						open={mainOpen}
						onToggle={() => setMainOpen((open) => !open)}>
						{scaledHose ? (
							<PartCard
								label={t("hose")}
								line={scaledHose.line}
								price={scaledHose.price}
								seeDetails={t("seeDetails")}
								nameLabel={t("name")}
								itemNumberLabel={t("itemNumber")}
							/>
						) : null}
						{scaledFerrules.length > 0 ? (
							<div className="space-y-2">
								<p className="text-sm text-[#5A615D]">{t("ferrule")}</p>
								{scaledFerrules.map(({ line, price }) => (
									<PartCard
										key={line.key}
										line={line}
										price={price}
										seeDetails={t("seeDetails")}
										nameLabel={t("name")}
										itemNumberLabel={t("itemNumber")}
									/>
								))}
							</div>
						) : null}
						{scaledInserts.length > 0 ? (
							<div className="space-y-2">
								<p className="text-sm text-[#5A615D]">{t("insert")}</p>
								{scaledInserts.map(({ line, price }) => (
									<PartCard
										key={line.key}
										line={line}
										price={price}
										seeDetails={t("seeDetails")}
										nameLabel={t("name")}
										itemNumberLabel={t("itemNumber")}
									/>
								))}
							</div>
						) : null}
					</Accordion>

					{scaledServices.length > 0 ? (
						<Accordion
							title={tKit("services", { count: scaledServices.length })}
							open={servicesOpen}
							onToggle={() => setServicesOpen((open) => !open)}>
							{scaledServices.map(({ line, price }) => (
								<PartCard
									key={line.key}
									line={line}
									price={price}
									seeDetails={t("seeDetails")}
									nameLabel={t("name")}
									itemNumberLabel={t("itemNumber")}
								/>
							))}
						</Accordion>
					) : null}

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
								className="flex items-center gap-3 rounded-md border border-[#E8EAE9] bg-[#FAFBFA] px-3 py-2 text-sm">
								{part.imageUrl ? (
									<div className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-[#E8EAE9] bg-white">
										<Image
											src={part.imageUrl}
											alt=""
											fill
											sizes="40px"
											className="object-contain"
										/>
									</div>
								) : null}
								<div className="min-w-0 flex-1">
									<p className="font-medium text-[#0F1912]">
										{part.name || part.itemNumber}
									</p>
									<p className="text-xs text-[#5A615D]">{part.itemNumber}</p>
								</div>
								<span className="shrink-0 text-[#5A615D] tabular-nums">
									{formatQuantity(part.quantity * multiple)}x
								</span>
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
				</div>
		</div>
	);

	const aside = (
		<aside className="h-fit rounded-xl border border-[#E8EAE9] p-4 sm:p-5">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-semibold text-[#0F1912]">
							{t("positionTitle")}
						</h3>
						<Info className="h-4 w-4 text-[#009640]" />
					</div>
					<dl className="mt-4 space-y-3 text-sm">
						<div>
							<dt className="font-semibold text-[#0F1912]">S1</dt>
							<dd className="mt-1">
								<Select
									value={draft.s1Id || undefined}
									onValueChange={(s1Id) => {
										const s2StillValid = locations
											.find((location) => location.id === s1Id)
											?.children?.some((child) => child.id === draft.s2Id);
										setDraft({
											s1Id,
											s2Id: s2StillValid ? draft.s2Id : "",
										});
									}}>
									<SelectTrigger className="h-10 w-full">
										<SelectValue
											placeholder={placeLabel(kit.s1?.s1Name, kit.s1?.s1Code)}
										/>
									</SelectTrigger>
									<SelectContent>
										{s1Options.map((option) => (
											<SelectItem
												key={option.id}
												value={option.id}>
												{option.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</dd>
						</div>
						<div>
							<dt className="font-semibold text-[#0F1912]">S2</dt>
							<dd className="mt-1">
								<Select
									value={draft.s2Id || undefined}
									onValueChange={(s2Id) => setDraft({ s2Id })}>
									<SelectTrigger className="h-10 w-full">
										<SelectValue
											placeholder={placeLabel(kit.s2?.s2Name, kit.s2?.s2Code)}
										/>
									</SelectTrigger>
									<SelectContent>
										{s2Options.map((option) => (
											<SelectItem
												key={option.id}
												value={option.id}>
												{option.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</dd>
						</div>
						<div>
							<dt className="font-semibold text-[#0F1912]">
								{tKit("changeLength")}
							</dt>
							<dd className="mt-1 flex items-center">
								<input
									inputMode="numeric"
									value={draft.hoseLengthMm}
									aria-label={tKit("changeLength")}
									onChange={(event) =>
										setDraft({
											hoseLengthMm: event.target.value.replace(/[^\d]/g, ""),
										})
									}
									className="h-10 w-full rounded-l-md border border-[#D5D9D7] px-3 text-sm"
								/>
								<span className="flex h-10 items-center rounded-r-md border border-l-0 border-[#D5D9D7] bg-[#F3F4F3] px-3 text-sm text-[#5A615D]">
									{tKit("unitMm")}
								</span>
							</dd>
						</div>
						<div>
							<dt className="font-semibold text-[#0F1912]">{t("otherInfo")}</dt>
							<dd className="text-[#5A615D]">
								{placeLabel(kit.work?.workName, kit.work?.workCode)}
							</dd>
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
					<Button
						variant="greenSolid"
						className="mt-5 h-11 w-full"
						disabled={saving}
						onClick={() => {
							const hoseLengthMm = Number(draft.hoseLengthMm);
							void onSave(kit, {
								quantity,
								hoseLengthMm:
									Number.isFinite(hoseLengthMm) && hoseLengthMm > 0
										? hoseLengthMm
										: undefined,
								s1Id: draft.s1Id ? Number(draft.s1Id) : undefined,
								s2Id: draft.s2Id ? Number(draft.s2Id) : undefined,
							});
						}}>
						{t("saveToCart")}
					</Button>
		</aside>
	);

	return children({ main, aside });
}
