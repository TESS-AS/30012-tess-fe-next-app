"use client";

import { useMemo, useState } from "react";

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
import { Expand, Info, Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

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

export function StepKoblinger({
	product,
	onBack,
	onContinue,
}: StepKoblingerProps) {
	const t = useTranslations("HoseConfigurator.step2");
	const [lengthMtr, setLengthMtr] = useState("12,12");
	const [quantity, setQuantity] = useState(2);
	const [stock, setStock] = useState(product.stockOptions[0] ?? "");

	const lengthMmLabel = useMemo(() => {
		const meters = parseMeters(lengthMtr);
		if (meters === null) return null;
		return `= ${formatMm(meters)} mm`;
	}, [lengthMtr]);

	return (
		<div className="space-y-6 pb-10">
			<div>
				<h2 className="inline-block border-b-2 border-[#009640] pb-1 text-base font-semibold text-[#0F1912]">
					{t("yourHose")}
				</h2>
			</div>

			<div className="grid grid-cols-1 gap-8 lg:grid-cols-[5fr_7fr] lg:items-start">
				<div className="relative aspect-square w-full overflow-hidden rounded-md border border-[#C1C4C2] bg-white">
					<Image
						src={product.imageSrc}
						alt={product.name}
						fill
						className="object-contain p-6"
						sizes="(max-width: 1024px) 100vw, 50vw"
						priority
					/>
					<button
						type="button"
						aria-label={t("expandImage")}
						className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-md border border-[#C1C4C2] bg-white text-[#0F1912] hover:bg-[#F3F4F3]">
						<Expand className="h-4 w-4" />
					</button>
				</div>

				<div className="min-w-0 space-y-4">
					<div>
						<h3 className="text-xl font-bold text-[#0F1912]">
							{product.name}
						</h3>
						<p className="mt-2 text-sm leading-relaxed text-[#5A615D]">
							{product.description}
						</p>
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
									{product.itemName}
								</p>
								<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
									<span className="shrink-0 font-bold">
										{t("stockStatus")}:
									</span>
									<Select
										value={stock}
										onValueChange={setStock}>
										<SelectTrigger
											id="stock-status"
											className="h-10 w-full bg-white sm:max-w-md">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{product.stockOptions.map((option) => (
												<SelectItem
													key={option}
													value={option}>
													{option}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
							<Button
								type="button"
								variant="outlineGrey"
								className="h-10 shrink-0 self-start bg-white sm:self-center">
								{t("documentation", { count: product.documentCount })}
							</Button>
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
												{quantity} {t("unit")}
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
										{t("coilNote", { max: product.maxCoilMeters })}
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
				/>
			</div>
		</div>
	);
}
