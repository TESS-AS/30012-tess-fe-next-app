"use client";

import { useEffect, useState } from "react";

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
import { cn } from "@/lib/utils";
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

const DEFAULT_END: EndConfig = {
	fittingType: "jic",
	connection: "female",
	size: "1/2",
	design: "rett",
	material: "karbonstal",
};

const ANGLE_OPTIONS = ["0", "90", "180", "270"] as const;

type StepKoblingerSpecsProps = {
	onBack: () => void;
	onContinue: () => void;
};

function EndFieldSelect({
	label,
	value,
	onChange,
	options,
	disabled,
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
	options: { value: string; label: string }[];
	disabled?: boolean;
}) {
	return (
		<div className="flex items-center gap-1.5">
			<ChevronRight
				className="h-4 w-4 shrink-0 text-[#009640]"
				aria-hidden
			/>
			<Select
				value={value}
				onValueChange={onChange}
				disabled={disabled}>
				<SelectTrigger className="h-11 w-full gap-2 bg-white px-3">
					<span className="shrink-0 text-sm text-[#5A615D]">{label}</span>
					<SelectValue />
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
	const [specsOpen, setSpecsOpen] = useState(true);
	const [endsEqual, setEndsEqual] = useState(false);
	const [end1, setEnd1] = useState<EndConfig>(DEFAULT_END);
	const [end2, setEnd2] = useState<EndConfig>(DEFAULT_END);
	const [angle, setAngle] = useState<(typeof ANGLE_OPTIONS)[number]>("90");
	const [options, setOptions] = useState({
		innerCleaning: true,
		flushing: false,
		testCertificate: false,
		spiralProtection: true,
		protectionSleeve: true,
		heatFireProtection: false,
		rfid: true,
		hoseTag: false,
		extraMarking: false,
	});
	const [customMarking, setCustomMarking] = useState("");
	const [angleHelpOpen, setAngleHelpOpen] = useState(false);

	useEffect(() => {
		if (endsEqual) {
			setEnd2(end1);
		}
	}, [endsEqual, end1]);

	const fittingOptions = [
		{ value: "jic", label: t("fittingOptions.jic") },
		{ value: "bsp", label: t("fittingOptions.bsp") },
		{ value: "orfs", label: t("fittingOptions.orfs") },
	];
	const connectionOptions = [
		{ value: "female", label: t("connectionOptions.female") },
		{ value: "male", label: t("connectionOptions.male") },
	];
	const sizeOptions = [
		{ value: "1/4", label: '1/4"' },
		{ value: "3/8", label: '3/8"' },
		{ value: "1/2", label: '1/2"' },
		{ value: "3/4", label: '3/4"' },
	];
	const designOptions = [
		{ value: "rett", label: t("designOptions.straight") },
		{ value: "45", label: t("designOptions.angle45") },
		{ value: "90", label: t("designOptions.angle90") },
	];
	const materialOptions = [
		{ value: "karbonstal", label: t("materialOptions.carbonSteel") },
		{ value: "rustfritt", label: t("materialOptions.stainless") },
	];

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
				options={fittingOptions}
				disabled={disabled}
			/>
			<EndFieldSelect
				label={t("fields.connection")}
				value={config.connection}
				onChange={(value) => onUpdate("connection", value)}
				options={connectionOptions}
				disabled={disabled}
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
			/>
			<EndFieldSelect
				label={t("fields.material")}
				value={config.material}
				onChange={(value) => onUpdate("material", value)}
				options={materialOptions}
				disabled={disabled}
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
							<RadioGroup
								value={angle}
								onValueChange={(value) =>
									setAngle(value as (typeof ANGLE_OPTIONS)[number])
								}
								className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
								{ANGLE_OPTIONS.map((value) => {
									const selected = angle === value;
									return (
										<label
											key={value}
											className={cn(
												"flex cursor-pointer flex-col rounded-lg border-2 p-4 transition-colors",
												selected
													? "border-[#009640] bg-[#E8F8EB]"
													: "border-[#009640] bg-white hover:bg-[#F7FBF8]",
											)}>
											<div className="flex items-center gap-2.5 pb-3">
												<RadioGroupItem
													value={value}
													id={`angle-${value}`}
													className="border-[#009640] data-[state=checked]:border-[#009640]"
												/>
												<span className="text-sm font-bold text-[#003D1A]">
													V = {value}°
												</span>
											</div>
											<div className="border-t border-[#009640] pt-3">
												<div className="mb-3 flex justify-between text-sm text-[#0F1912]">
													<span>{t("end1")}</span>
													<span>{t("end2")}</span>
												</div>
												<div className="flex min-h-[48px] items-center justify-center">
													<Image
														src={`/icons/angle/${value}.svg`}
														alt={`V = ${value}°`}
														width={164}
														height={40}
														className="h-auto w-full max-w-[180px]"
													/>
												</div>
											</div>
										</label>
									);
								})}
							</RadioGroup>
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
