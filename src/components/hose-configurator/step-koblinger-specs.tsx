"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useHoseFittingOptions } from "@/hooks/useHoseFittingOptions";
import {
	loadHoseConfiguratorDraft,
	patchHoseConfiguratorDraft,
	type HoseSpecsDraft,
} from "@/lib/hose-configurator-draft";
import { cn } from "@/lib/utils";
import type { SelectOption } from "@/types/hose-fitting.types";
import {
	ArrowLeft,
	ChevronRight,
	ImageIcon,
	Info,
	Plus,
	ShoppingCart,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { AngleHelpDrawer } from "./angle-help-drawer";

type EndConfig = {
	fittingType: string;
	connection: string;
	size: string;
	design: string;
	material: string;
};

const EMPTY_END: EndConfig = {
	fittingType: "",
	connection: "",
	size: "1/2",
	design: "",
	material: "",
};

/** No size API yet — keep local options until BE exposes one. */
const SIZE_OPTIONS: SelectOption[] = [
	{ value: "1/4", label: '1/4"' },
	{ value: "3/8", label: '3/8"' },
	{ value: "1/2", label: '1/2"' },
	{ value: "3/4", label: '3/4"' },
];

const ROTATION_ICON_DEGREES = new Set(["0", "90", "180", "270"]);

type StepKoblingerSpecsProps = {
	onBack: () => void;
	onContinue: () => void;
};

function firstOptionValue(options: SelectOption[]): string {
	return options[0]?.value ?? "";
}

function pickValidValue(current: string, options: SelectOption[]): string {
	if (current && options.some((option) => option.value === current)) {
		return current;
	}
	return firstOptionValue(options);
}

function EndFieldSelect({
	label,
	value,
	onChange,
	options,
	disabled,
	placeholder,
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
	options: SelectOption[];
	disabled?: boolean;
	placeholder?: string;
}) {
	const hasOptions = options.length > 0;

	return (
		<div className="flex items-center gap-1.5">
			<ChevronRight
				className="h-4 w-4 shrink-0 text-[#009640]"
				aria-hidden
			/>
			<Select
				value={value || undefined}
				onValueChange={onChange}
				disabled={disabled || !hasOptions}>
				<SelectTrigger className="h-11 w-full gap-2 bg-white px-3">
					<span className="shrink-0 text-sm text-[#5A615D]">{label}</span>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					{options.map((option) => (
						<SelectItem
							key={option.value}
							value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}

function OptionCheckbox({
	checked,
	onChange,
	label,
}: {
	checked: boolean;
	onChange: () => void;
	label: string;
}) {
	return (
		<label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#0F1912]">
			<Checkbox
				checked={checked}
				onCheckedChange={onChange}
			/>
			{label}
		</label>
	);
}

export function StepKoblingerSpecs({
	onBack,
	onContinue,
}: StepKoblingerSpecsProps) {
	const t = useTranslations("HoseConfigurator.step2");
	const {
		fittingTypeOptions,
		connectionOptions,
		designOptions,
		materialOptions,
		rotationAngles,
		isLoading: isLoadingFittingOptions,
	} = useHoseFittingOptions();

	const [specsOpen, setSpecsOpen] = useState(true);
	const [endsEqual, setEndsEqual] = useState(
		() => loadHoseConfiguratorDraft()?.specs?.endsEqual ?? false,
	);
	const [end1, setEnd1] = useState<EndConfig>(
		() => loadHoseConfiguratorDraft()?.specs?.end1 ?? EMPTY_END,
	);
	const [end2, setEnd2] = useState<EndConfig>(
		() => loadHoseConfiguratorDraft()?.specs?.end2 ?? EMPTY_END,
	);
	const [angle, setAngle] = useState(
		() => loadHoseConfiguratorDraft()?.specs?.angle ?? "",
	);
	const [options, setOptions] = useState(
		() =>
			loadHoseConfiguratorDraft()?.specs?.options ?? {
				innerCleaning: false,
				flushing: false,
				testCertificate: false,
				spiralProtection: false,
				protectionSleeve: false,
				heatFireProtection: false,
				rfid: false,
				hoseTag: false,
				extraMarking: false,
			},
	);
	const [customMarking, setCustomMarking] = useState(
		() => loadHoseConfiguratorDraft()?.specs?.customMarking ?? "",
	);
	const [angleHelpOpen, setAngleHelpOpen] = useState(false);

	const sizeOptions = useMemo(() => SIZE_OPTIONS, []);

	useEffect(() => {
		const specs: HoseSpecsDraft = {
			endsEqual,
			end1,
			end2,
			angle,
			options,
			customMarking,
		};
		patchHoseConfiguratorDraft({ specs });
	}, [endsEqual, end1, end2, angle, options, customMarking]);

	useEffect(() => {
		const syncEnd = (prev: EndConfig): EndConfig => ({
			...prev,
			fittingType: pickValidValue(prev.fittingType, fittingTypeOptions),
			connection: pickValidValue(prev.connection, connectionOptions),
			design: pickValidValue(prev.design, designOptions),
			material: pickValidValue(prev.material, materialOptions),
			size: pickValidValue(prev.size, sizeOptions),
		});

		setEnd1(syncEnd);
		if (!endsEqual) {
			setEnd2(syncEnd);
		}
	}, [
		connectionOptions,
		designOptions,
		endsEqual,
		fittingTypeOptions,
		materialOptions,
		sizeOptions,
	]);

	useEffect(() => {
		if (endsEqual) {
			setEnd2(end1);
		}
	}, [endsEqual, end1]);

	useEffect(() => {
		if (!rotationAngles.length) return;
		setAngle((current) =>
			current && rotationAngles.some((item) => item.value === current)
				? current
				: (rotationAngles.find((item) => item.degrees === "90")?.value ??
					rotationAngles[0].value),
		);
	}, [rotationAngles]);

	const updateEnd1 = (key: keyof EndConfig, value: string) => {
		setEnd1((prev) => ({ ...prev, [key]: value }));
	};

	const updateEnd2 = (key: keyof EndConfig, value: string) => {
		setEnd2((prev) => ({ ...prev, [key]: value }));
	};

	const toggleOption = (key: keyof typeof options) => {
		setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	const endFields = (
		config: EndConfig,
		onUpdate: (key: keyof EndConfig, value: string) => void,
		disabled?: boolean,
	) => (
		<div className="space-y-2.5">
			<EndFieldSelect
				label={t("fields.fittingType")}
				value={config.fittingType}
				onChange={(value) => onUpdate("fittingType", value)}
				options={fittingTypeOptions}
				disabled={disabled}
				placeholder={
					isLoadingFittingOptions ? t("loadingOptions") : t("selectOption")
				}
			/>
			<EndFieldSelect
				label={t("fields.connection")}
				value={config.connection}
				onChange={(value) => onUpdate("connection", value)}
				options={connectionOptions}
				disabled={disabled}
				placeholder={
					isLoadingFittingOptions ? t("loadingOptions") : t("selectOption")
				}
			/>
			<EndFieldSelect
				label={t("fields.size")}
				value={config.size}
				onChange={(value) => onUpdate("size", value)}
				options={sizeOptions}
				disabled={disabled}
			/>
			<EndFieldSelect
				label={t("fields.design")}
				value={config.design}
				onChange={(value) => onUpdate("design", value)}
				options={designOptions}
				disabled={disabled}
				placeholder={
					isLoadingFittingOptions ? t("loadingOptions") : t("selectOption")
				}
			/>
			<EndFieldSelect
				label={t("fields.material")}
				value={config.material}
				onChange={(value) => onUpdate("material", value)}
				options={materialOptions}
				disabled={disabled}
				placeholder={
					isLoadingFittingOptions ? t("loadingOptions") : t("selectOption")
				}
			/>
		</div>
	);

	return (
		<div className="space-y-8">
			<div>
				<button
					type="button"
					onClick={() => setSpecsOpen((open) => !open)}
					className="flex w-full items-center justify-between bg-[#E8EAE9] px-4 py-3 text-left">
					<span className="text-sm font-semibold text-[#0F1912]">
						{t("technicalSpecs")}
					</span>
					<Plus className="h-4 w-4 text-[#0F1912]" />
				</button>

				{specsOpen && (
					<div className="pt-6">
						{/* Spesifiser ende 1 og 2 */}
						<section>
							<h3 className="mb-4 text-base font-semibold text-[#0F1912]">
								{t("specifyEnds")}
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-[1fr_1.15fr]">
								<div className="space-y-3 border-[#E8EAE9] pb-6 md:border-r md:pr-8 md:pb-0">
									<h4 className="text-sm font-bold text-[#0F1912]">
										{t("end1")}
									</h4>
									{endFields(end1, updateEnd1)}
								</div>
								<div className="space-y-3 pt-6 md:pt-0 md:pl-8">
									<div className="flex flex-wrap items-center justify-between gap-3">
										<h4 className="text-sm font-bold text-[#0F1912]">
											{t("end2")}
										</h4>
										<label className="flex cursor-pointer items-center gap-2 text-sm text-[#0F1912]">
											<Checkbox
												checked={endsEqual}
												onCheckedChange={(checked) =>
													setEndsEqual(checked === true)
												}
											/>
											{t("endsEqual")}
										</label>
									</div>
									{endFields(end2, updateEnd2, endsEqual)}
								</div>
							</div>
						</section>

						{/* Velg ende */}
						<section className="mt-8 border-t border-[#E8EAE9] pt-6">
							<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
								<h3 className="text-lg font-bold text-[#003D1A]">
									{t("selectEnd")}
								</h3>
								<Button
									type="button"
									variant="outlineGreen"
									className="h-9 gap-2 px-3 text-sm font-medium"
									onClick={() => setAngleHelpOpen(true)}>
									<ImageIcon className="h-4 w-4" />
									{t("angleHelp")}
								</Button>
							</div>
							{rotationAngles.length === 0 ? (
								<p className="text-sm text-[#5A615D]">
									{isLoadingFittingOptions
										? t("loadingOptions")
										: t("noRotationAngles")}
								</p>
							) : (
								<RadioGroup
									value={angle || undefined}
									onValueChange={setAngle}
									className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
									{rotationAngles.map((option) => {
										const selected = angle === option.value;
										const iconDegrees = ROTATION_ICON_DEGREES.has(
											option.degrees,
										)
											? option.degrees
											: null;
										return (
											<label
												key={option.value}
												className={cn(
													"flex cursor-pointer flex-col rounded-lg border-2 p-4 transition-colors",
													selected
														? "border-[#009640] bg-[#E8F8EB]"
														: "border-[#009640] bg-white hover:bg-[#F7FBF8]",
												)}>
												<div className="flex items-center gap-2.5 pb-3">
													<RadioGroupItem
														value={option.value}
														id={`angle-${option.value}`}
														className="border-[#009640] data-[state=checked]:border-[#009640]"
													/>
													<span className="text-sm font-bold text-[#003D1A]">
														V = {option.label.replace(/^V\s*=\s*/i, "")}
													</span>
												</div>
												<div className="border-t border-[#009640] pt-3">
													<div className="mb-3 flex justify-between text-sm text-[#0F1912]">
														<span>{t("end1")}</span>
														<span>{t("end2")}</span>
													</div>
													<div className="flex min-h-[48px] items-center justify-center">
														{iconDegrees ? (
															<Image
																src={`/icons/angle/${iconDegrees}.svg`}
																alt={`V = ${option.label}`}
																width={164}
																height={40}
																className="h-auto w-full max-w-[180px]"
															/>
														) : (
															<span className="text-sm font-medium text-[#5A615D]">
																{option.label}
															</span>
														)}
													</div>
												</div>
											</label>
										);
									})}
								</RadioGroup>
							)}
						</section>

						{/* Velg tilvalg */}
						<section className="mt-8 border-t border-[#E8EAE9] pt-6">
							<h3 className="mb-5 text-base font-semibold text-[#0F1912]">
								{t("selectOptions")}
							</h3>
							<div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1.35fr]">
								{/* Test og rengjøring */}
								<div className="space-y-3 border-[#E8EAE9] pb-6 lg:border-r lg:pr-8 lg:pb-0">
									<h4 className="text-sm font-bold text-[#0F1912]">
										{t("options.testCleaning")}
									</h4>
									<div className="space-y-2.5">
										<OptionCheckbox
											checked={options.innerCleaning}
											onChange={() => toggleOption("innerCleaning")}
											label={t("options.innerCleaning")}
										/>
										<OptionCheckbox
											checked={options.flushing}
											onChange={() => toggleOption("flushing")}
											label={t("options.flushing")}
										/>
										<OptionCheckbox
											checked={options.testCertificate}
											onChange={() => toggleOption("testCertificate")}
											label={t("options.testCertificate")}
										/>
									</div>
									<aside className="mt-5 flex gap-2 rounded-md bg-[#E8F8EB] p-3">
										<span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#009640]">
											<Info
												className="h-2.5 w-2.5 text-white"
												strokeWidth={3}
												aria-hidden
											/>
										</span>
										<div className="text-sm leading-snug text-[#0F1912]">
											<p className="font-bold">{t("pressureTestTitle")}</p>
											<p className="mt-1 text-[#5A615D]">
												{t("pressureTestText")}
											</p>
										</div>
									</aside>
								</div>

								{/* Beskyttelse */}
								<div className="space-y-3 border-[#E8EAE9] py-6 lg:border-r lg:px-8 lg:py-0">
									<h4 className="text-sm font-bold text-[#0F1912]">
										{t("options.protection")}
									</h4>
									<div className="space-y-2.5">
										<OptionCheckbox
											checked={options.spiralProtection}
											onChange={() => toggleOption("spiralProtection")}
											label={t("options.spiralProtection")}
										/>
										<OptionCheckbox
											checked={options.protectionSleeve}
											onChange={() => toggleOption("protectionSleeve")}
											label={t("options.protectionSleeve")}
										/>
										<OptionCheckbox
											checked={options.heatFireProtection}
											onChange={() => toggleOption("heatFireProtection")}
											label={t("options.heatFireProtection")}
										/>
									</div>
								</div>

								{/* Merking */}
								<div className="space-y-3 pt-6 lg:pt-0 lg:pl-8">
									<h4 className="text-sm font-bold text-[#0F1912]">
										{t("options.marking")}
									</h4>
									<p className="text-sm text-[#0F1912]">
										{t("options.tessIdStandard")}
									</p>
									<div className="space-y-2.5">
										<OptionCheckbox
											checked={options.rfid}
											onChange={() => toggleOption("rfid")}
											label={t("options.rfid")}
										/>
										<OptionCheckbox
											checked={options.hoseTag}
											onChange={() => toggleOption("hoseTag")}
											label={t("options.hoseTag")}
										/>
										<OptionCheckbox
											checked={options.extraMarking}
											onChange={() => toggleOption("extraMarking")}
											label={t("options.extraMarking")}
										/>
									</div>
									<div className="pt-1">
										<Label
											htmlFor="custom-marking"
											className="sr-only">
											{t("options.customMarking")}
										</Label>
										<Textarea
											id="custom-marking"
											value={customMarking}
											onChange={(event) =>
												setCustomMarking(event.target.value)
											}
											placeholder={t("options.customMarkingPlaceholder")}
											className="min-h-[100px] resize-none bg-white"
										/>
									</div>
								</div>
							</div>
						</section>
					</div>
				)}
			</div>

			<div className="mt-8 flex flex-col items-center justify-center gap-4 border-t border-[#E8EAE9] py-8 sm:flex-row sm:gap-5">
				<Button
					type="button"
					variant="outlineGreen"
					onClick={onBack}
					className="h-11 w-full gap-2 bg-white px-6 sm:w-auto">
					<ArrowLeft className="h-4 w-4" />
					{t("back")}
				</Button>
				<Button
					type="button"
					variant="greenSolid"
					onClick={onContinue}
					className="h-11 w-full gap-2 px-8 sm:w-auto">
					<ShoppingCart className="h-4 w-4" />
					{t("toSummary")}
				</Button>
			</div>

			<AngleHelpDrawer
				open={angleHelpOpen}
				onOpenChange={setAngleHelpOpen}
			/>
		</div>
	);
}
