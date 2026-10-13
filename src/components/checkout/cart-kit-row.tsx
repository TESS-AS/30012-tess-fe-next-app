"use client";

import { ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import QuantityButtons from "@/components/ui/quantity-buttons";
import { Link } from "@/i18n/navigation";
import { getCartKitPartEntries, readCartKitImageUrl } from "@/lib/cart-kit";
import type { CartKitItem, HoseComponent } from "@/types/carts.types";
import { formatNorwegianCurrency } from "@/utils/formatCurrency";
import {
	ChevronDown,
	ChevronUp,
	CircleAlert,
	CircleCheck,
	Info,
	Link2,
	Pencil,
	Plus,
	Trash2,
	X,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

type LineTotal = (itemNumber: string, quantity: number) => number;

type CartKitRowProps = {
	kit: CartKitItem;
	expanded: boolean;
	onToggle: () => void;
	quantity: number;
	quantityLoading: boolean;
	onIncrease: (event: React.MouseEvent) => void;
	onDecrease: (event: React.MouseEvent) => void;
	onRemove: (event: React.MouseEvent) => void;
	removing: boolean;
	kitTotal: number;
	lineTotal: LineTotal;
	priceInputSlot?: (itemNumber: string) => ReactNode;
	warehouseName?: string;
	inStock?: boolean;
};

type PartLine = {
	key: string;
	name: string;
	itemNumber: string;
	quantity: number;
	note?: string;
	imageUrl?: string;
};

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

function readOriginalLengthMm(
	hose: CartKitItem["hose"] | undefined,
): number | undefined {
	if (!hose) return undefined;
	const record = hose as Record<string, unknown>;
	for (const key of [
		"originalLengthMm",
		"previousLengthMm",
		"lengthMmFrom",
		"oldLengthMm",
	]) {
		const value = Number(record[key]);
		if (Number.isFinite(value) && value > 0) return value;
	}
	return undefined;
}

function formatQuantity(quantity: number) {
	return new Intl.NumberFormat("nb-NO", {
		maximumFractionDigits: 2,
	}).format(quantity);
}

function Section({
	title,
	open,
	onToggle,
	children,
}: {
	title: string;
	open: boolean;
	onToggle: () => void;
	children?: ReactNode;
}) {
	return (
		<div className="border-t border-[#E8EAE9]">
			<button
				type="button"
				onClick={onToggle}
				className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-[#0F1912]">
				{title}
				{open ? (
					<ChevronUp className="h-4 w-4 text-[#5A615D]" />
				) : (
					<ChevronDown className="h-4 w-4 text-[#5A615D]" />
				)}
			</button>
			{open ? <div className="space-y-3 px-4 pb-4">{children}</div> : null}
		</div>
	);
}

function PartCard({
	label,
	line,
	price,
	priceInputSlot,
	seeDetailsLabel,
	nameLabel,
	itemNumberLabel,
	extra,
}: {
	label?: string;
	line: PartLine;
	price: number;
	priceInputSlot?: ReactNode;
	seeDetailsLabel: string;
	nameLabel: string;
	itemNumberLabel: string;
	extra?: ReactNode;
}) {
	return (
		<div className="space-y-2">
			{label ? (
				<p className="text-xs font-medium text-[#5A615D]">{label}</p>
			) : null}
			<div className="space-y-3 rounded-md border border-[#E8EAE9] bg-[#FAFBFA] p-3">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
					{line.note ? (
						<p className="mt-1 text-xs text-[#5A615D]">{line.note}</p>
					) : null}
				</div>
				<div className="flex shrink-0 items-center gap-3">
					<Link
						href={`/search?q=${encodeURIComponent(line.itemNumber)}`}
						className="rounded-md border border-[#D5D9D7] bg-white px-3 py-1.5 text-xs text-[#0F1912] hover:border-[#009640]">
						{seeDetailsLabel}
					</Link>
					{priceInputSlot}
					<div className="flex items-center border-l border-[#E8EAE9] pl-3">
						<span className="w-14 shrink-0 text-sm whitespace-nowrap text-[#5A615D] tabular-nums">
							{formatQuantity(line.quantity)}x
						</span>
						<span className="w-28 shrink-0 text-sm font-semibold whitespace-nowrap text-[#0F1912] tabular-nums">
							{formatNorwegianCurrency(price)}
						</span>
					</div>
				</div>
				</div>
				{extra}
			</div>
		</div>
	);
}

function ExtraEquipmentCard({
	line,
	price,
	seeDetailsLabel,
	editLabel,
	removeLabel,
}: {
	line: PartLine;
	price: number;
	seeDetailsLabel: string;
	editLabel: string;
	removeLabel: string;
}) {
	return (
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
				<p className="text-sm font-semibold text-[#0F1912]">{line.name}</p>
				{line.note ? (
					<ul className="mt-1 list-disc pl-4 text-xs text-[#5A615D]">
						<li>{line.note}</li>
					</ul>
				) : null}
			</div>
			<div className="flex shrink-0 items-center gap-2">
				<Link
					href={`/search?q=${encodeURIComponent(line.itemNumber)}`}
					className="rounded-md border border-[#D5D9D7] bg-white px-3 py-1.5 text-xs text-[#0F1912] hover:border-[#009640]">
					{seeDetailsLabel}
				</Link>
				<button
					type="button"
					aria-label={editLabel}
					className="flex h-8 w-8 items-center justify-center rounded-md border border-[#D5D9D7] bg-white text-[#0F1912]">
					<Pencil className="h-3.5 w-3.5" />
				</button>
				<button
					type="button"
					aria-label={removeLabel}
					className="flex h-8 w-8 items-center justify-center rounded-md border border-[#D5D9D7] bg-white text-[#0F1912]">
					<Trash2 className="h-3.5 w-3.5" />
				</button>
				<div className="flex items-center border-l border-[#E8EAE9] pl-3">
					<span className="w-14 shrink-0 text-sm whitespace-nowrap text-[#5A615D] tabular-nums">
						{formatQuantity(line.quantity)}x
					</span>
					<span className="w-28 shrink-0 text-sm font-semibold whitespace-nowrap text-[#0F1912] tabular-nums">
						{formatNorwegianCurrency(price)}
					</span>
				</div>
			</div>
		</div>
	);
}

export function CartKitRow({
	kit,
	expanded,
	onToggle,
	quantity,
	quantityLoading,
	onIncrease,
	onDecrease,
	onRemove,
	removing,
	kitTotal,
	lineTotal,
	priceInputSlot,
	warehouseName,
	inStock,
}: CartKitRowProps) {
	const t = useTranslations("Cart.kit");
	const [selected, setSelected] = useState(false);
	const [mainOpen, setMainOpen] = useState(true);
	const [extrasOpen, setExtrasOpen] = useState(true);
	const [servicesOpen, setServicesOpen] = useState(false);
	const [lengthChangeDismissed, setLengthChangeDismissed] = useState(false);

	const ferrules = groupParts([kit.ferrule1, kit.ferrule2], "ferrule");
	const inserts = groupParts([kit.insert1, kit.insert2], "insert");
	const hoseLine: PartLine | null = hasItemNumber(kit.hose)
		? {
				key: "hose",
				name: kit.hose.itemName?.trim() || kit.hose.itemNumber,
				itemNumber: kit.hose.itemNumber.trim(),
				imageUrl: readCartKitImageUrl(kit.hose),
				quantity:
					Number.isFinite(Number(kit.hose.quantity)) &&
					Number(kit.hose.quantity) > 0
						? Number(kit.hose.quantity)
						: 1,
			}
		: null;

	const mainCount = (hoseLine ? 1 : 0) + ferrules.length + inserts.length;
	const extras = getCartKitPartEntries(kit.additionals).map((entry) => {
		const endMatch = entry.key.match(/End([12])$/i);
		return {
			key: entry.key,
			name: entry.name || entry.itemNumber,
			itemNumber: entry.itemNumber,
			quantity: entry.quantity,
			imageUrl: entry.imageUrl,
			note: endMatch ? t("endYes", { end: endMatch[1] }) : undefined,
		} satisfies PartLine;
	});
	const services = getCartKitPartEntries(kit.services).map((entry) => ({
		key: entry.key,
		name: serviceName(t, entry.key) || entry.name || entry.itemNumber,
		itemNumber: entry.itemNumber,
		quantity: entry.quantity,
		imageUrl: entry.imageUrl,
	}));

	const lengthMm = kit.hose?.lengthMm;
	const originalLengthMm = readOriginalLengthMm(kit.hose);
	const title = kit.hose?.itemDescription?.trim()
		? kit.hose.itemDescription
		: [kit.hose?.itemNumber, lengthMm ? `${lengthMm} mm` : ""]
				.filter(Boolean)
				.join(" × ");

	const partLabels = {
		seeDetailsLabel: t("seeDetails"),
		nameLabel: t("name"),
		itemNumberLabel: t("itemNumber"),
	};

	return (
		<div className="border-lightGray overflow-hidden rounded-md border">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between">
				<div className="flex min-w-0 flex-1 items-stretch">
					<div className="flex items-center border-r border-[#E8EAE9] px-6 sm:px-8">
						<Checkbox
							checked={selected}
							onCheckedChange={(checked) => setSelected(checked === true)}
							aria-label={title || kit.hexagonId}
							className="mx-2.5 my-10"
						/>
					</div>
					<button
						type="button"
						aria-expanded={expanded}
						onClick={onToggle}
						className="flex min-w-0 flex-1 items-start gap-3 py-5 pl-5 text-left">
						{expanded ? (
							<ChevronUp className="h-4 w-4 shrink-0 self-center text-[#5A615D]" />
						) : (
							<ChevronDown className="h-4 w-4 shrink-0 self-center text-[#5A615D]" />
						)}
						<span className="min-w-0">
							<span className="block text-sm text-[#0F1912]">
								<span className="font-semibold">ID: {kit.hexagonId}</span>
								{title ? (
									<span className="ml-2 text-[#5A615D]">{title}</span>
								) : null}
							</span>
							{warehouseName ? (
								<span
									className={`mt-1 flex items-center gap-1 text-xs ${
										inStock ? "text-[#009640]" : "text-[#5A615D]"
									}`}>
									{inStock ? (
										<CircleCheck className="h-3.5 w-3.5" />
									) : (
										<CircleAlert className="h-3.5 w-3.5 text-[#E3A008]" />
									)}
									{inStock
										? t("inStock", { warehouse: warehouseName })
										: t("outOfStock", { warehouse: warehouseName })}
								</span>
							) : null}
							{(lengthMm || extras.length > 0 || services.length > 0) && (
								<span className="mt-3 flex flex-wrap gap-2">
									{lengthMm ? (
										<span className="rounded-full bg-[#F3F4F3] px-2.5 py-1 text-xs text-[#0F1912]">
											{t("length", { length: formatQuantity(lengthMm) })}
										</span>
									) : null}
									{extras.length > 0 ? (
										<span className="rounded-full bg-[#F3F4F3] px-2.5 py-1 text-xs text-[#0F1912]">
											{t("extraEquipment", { count: extras.length })}
										</span>
									) : null}
									{services.length > 0 ? (
										<span className="rounded-full bg-[#F3F4F3] px-2.5 py-1 text-xs text-[#0F1912]">
											{t("services", { count: services.length })}
										</span>
									) : null}
								</span>
							)}
						</span>
					</button>
				</div>

				<div className="flex items-center justify-between gap-4 px-4 py-3 md:justify-end md:py-0 md:pr-6 md:pl-4">
					<QuantityButtons
						isLoading={quantityLoading}
						quantity={quantity}
						onIncrease={onIncrease}
						onDecrease={onDecrease}
					/>
					<span className="font-semibold whitespace-nowrap">
						{formatNorwegianCurrency(kitTotal)}
					</span>
					<Button
						className="w-4 p-0"
						size="icon"
						variant="ghost"
						onClick={onRemove}>
						{removing ? (
							<div className="border-t-primary h-4 w-4 animate-spin rounded-full border-2 border-gray-300" />
						) : (
							<Trash2 className="h-4 w-4 text-[#C81E1E]" />
						)}
					</Button>
				</div>
			</div>

			{expanded ? (
				<div>
					<Section
						title={t("mainComponents", { count: mainCount })}
						open={mainOpen}
						onToggle={() => setMainOpen((open) => !open)}>
						{hoseLine ? (
							<PartCard
								label={t("hose")}
								line={hoseLine}
								price={lineTotal(hoseLine.itemNumber, hoseLine.quantity)}
								priceInputSlot={priceInputSlot?.(hoseLine.itemNumber)}
								{...partLabels}
								extra={
									lengthMm ? (
										<div className="flex flex-wrap items-center gap-3 border-t border-[#E8EAE9] pt-3">
											<span className="flex items-center gap-1.5 text-sm text-[#0F1912]">
												{t("changeLength")}
												<Info
													className="h-4 w-4 text-[#009640]"
													aria-hidden
												/>
											</span>
											<div className="flex items-center">
												<input
													readOnly
													value={formatQuantity(lengthMm)}
													aria-label={t("changeLength")}
													className="h-9 w-20 rounded-l-md border border-[#D5D9D7] bg-white px-3 text-sm text-[#0F1912]"
												/>
												<span className="flex h-9 items-center rounded-r-md border border-l-0 border-[#D5D9D7] bg-[#F3F4F3] px-3 text-sm text-[#5A615D]">
													{t("unitMm")}
												</span>
											</div>
											{!lengthChangeDismissed ? (
												<span className="inline-flex items-center gap-1.5 rounded-md bg-[#EEF0FF] px-2.5 py-1 text-xs text-[#5B4DFF]">
													<Link2 className="h-3.5 w-3.5" aria-hidden />
													{originalLengthMm != null &&
													originalLengthMm !== lengthMm
														? t("lengthChanged", {
																from: formatQuantity(originalLengthMm),
																to: formatQuantity(lengthMm),
															})
														: t("lengthChangedCurrent", {
																to: formatQuantity(lengthMm),
															})}
													<button
														type="button"
														aria-label={t("dismissLengthChange")}
														onClick={() => setLengthChangeDismissed(true)}
														className="text-[#5B4DFF]">
														<X className="h-3.5 w-3.5" />
													</button>
												</span>
											) : null}
										</div>
									) : null
								}
							/>
						) : null}
						{ferrules.length > 0 ? (
							<div className="space-y-2">
								<p className="text-xs font-medium text-[#5A615D]">
									{t("ferrule")}
								</p>
								{ferrules.map((line) => (
									<PartCard
										key={line.key}
										line={line}
										price={lineTotal(line.itemNumber, line.quantity)}
										priceInputSlot={priceInputSlot?.(line.itemNumber)}
										{...partLabels}
									/>
								))}
							</div>
						) : null}
						{inserts.length > 0 ? (
							<div className="space-y-2">
								<p className="text-xs font-medium text-[#5A615D]">
									{t("insert")}
								</p>
								{inserts.map((line) => (
									<PartCard
										key={line.key}
										line={line}
										price={lineTotal(line.itemNumber, line.quantity)}
										priceInputSlot={priceInputSlot?.(line.itemNumber)}
										{...partLabels}
									/>
								))}
							</div>
						) : null}
					</Section>

					<Section
						title={t("extraEquipment", { count: extras.length })}
						open={extrasOpen}
						onToggle={() => setExtrasOpen((open) => !open)}>
						{extras.map((line) => (
							<ExtraEquipmentCard
								key={line.key}
								line={line}
								price={lineTotal(line.itemNumber, line.quantity)}
								seeDetailsLabel={t("seeDetails")}
								editLabel={t("editEquipment")}
								removeLabel={t("removeEquipment")}
							/>
						))}
						<Button
							type="button"
							variant="outline"
							className="h-9 bg-white">
							<Plus className="mr-1 h-4 w-4" />
							{t("addProtection")}
						</Button>
					</Section>

					<Section
						title={t("services", { count: services.length })}
						open={servicesOpen}
						onToggle={() => setServicesOpen((open) => !open)}>
						{services.map((line) => (
							<PartCard
								key={line.key}
								line={line}
								price={lineTotal(line.itemNumber, line.quantity)}
								priceInputSlot={priceInputSlot?.(line.itemNumber)}
								{...partLabels}
							/>
						))}
					</Section>
				</div>
			) : null}
		</div>
	);
}
