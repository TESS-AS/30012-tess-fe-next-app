"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useGetHoseDiameter } from "@/hooks/useGetHoseDiameter";
import { useGetHoseMedium } from "@/hooks/useGetHoseMedium";
import { useGetHosePressure } from "@/hooks/useGetHosePressure";
import { useGetHoseTemperature } from "@/hooks/useGetHoseTemperature";
import { Loader2, Search } from "lucide-react";
import { useTranslations } from "next-intl";

import { HoseFormSkeleton } from "./hose-configurator-skeletons";

export type BruksomradeFormValues = {
	medium: string;
	workingPressure: string;
	temperatureMin: string;
	temperatureMax: string;
	hoseSize: string;
	customEndSize: boolean;
	moreRequirements: string;
};

type StepBruksomradeProps = {
	onFindHose: (values: BruksomradeFormValues) => void;
	isSearching?: boolean;
	initialValues?: Partial<BruksomradeFormValues>;
	onValuesChange?: (values: BruksomradeFormValues) => void;
};

const CLEAR_VALUE = "__none__";

const FALLBACK_MEDIUMS = ["Hydraulikkolje", "Vann", "Luft"] as const;
const FALLBACK_HOSE_SIZES = ["1/4", "3/8", "1/2", "3/4", "1"] as const;

function formatHoseSizeLabel(size: string) {
	return `${size}"`;
}

function clampToRange(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

export function StepBruksomrade({
	onFindHose,
	isSearching = false,
	initialValues,
	onValuesChange,
}: StepBruksomradeProps) {
	const t = useTranslations("HoseConfigurator");
	const { diameters, isLoading: isLoadingDiameters } = useGetHoseDiameter();
	const { mediums, isLoading: isLoadingMediums } = useGetHoseMedium();
	const {
		minPressure,
		maxPressure,
		isLoading: isLoadingPressure,
	} = useGetHosePressure();
	const {
		minTemperature,
		maxTemperature,
		isLoading: isLoadingTemperature,
	} = useGetHoseTemperature();

	const mediumOptions = useMemo(
		() => (mediums.length > 0 ? mediums : [...FALLBACK_MEDIUMS]),
		[mediums],
	);
	const hoseSizeOptions = useMemo(
		() => (diameters.length > 0 ? diameters : [...FALLBACK_HOSE_SIZES]),
		[diameters],
	);

	const pressureMin = minPressure ?? 0;
	const pressureMax = maxPressure ?? 420;
	const temperatureMinBound = Number(minTemperature ?? "-80");
	const temperatureMaxBound = Number(maxTemperature ?? "120");

	const [medium, setMedium] = useState(initialValues?.medium ?? "");
	const [workingPressure, setWorkingPressure] = useState(
		initialValues?.workingPressure ?? "",
	);
	const [temperatureMin, setTemperatureMin] = useState(
		initialValues?.temperatureMin ?? "",
	);
	const [temperatureMax, setTemperatureMax] = useState(
		initialValues?.temperatureMax ?? "",
	);
	const [hoseSize, setHoseSize] = useState(initialValues?.hoseSize ?? "");
	const [customEndSize, setCustomEndSize] = useState(
		initialValues?.customEndSize ?? false,
	);
	const [moreRequirements, setMoreRequirements] = useState(
		initialValues?.moreRequirements ?? "",
	);

	// Re-apply draft values if the parent restores them after mount (or when
	// returning to step 1). Don't stomp in-progress edits unless the form is
	// still empty / matches a previous sync.
	const lastSyncedRef = useRef<string>("");
	useEffect(() => {
		if (!initialValues) return;
		const syncKey = JSON.stringify(initialValues);
		if (syncKey === lastSyncedRef.current) return;
		lastSyncedRef.current = syncKey;
		setMedium(initialValues.medium ?? "");
		setWorkingPressure(initialValues.workingPressure ?? "");
		setTemperatureMin(initialValues.temperatureMin ?? "");
		setTemperatureMax(initialValues.temperatureMax ?? "");
		setHoseSize(initialValues.hoseSize ?? "");
		setCustomEndSize(initialValues.customEndSize ?? false);
		setMoreRequirements(initialValues.moreRequirements ?? "");
	}, [initialValues]);

	useEffect(() => {
		if (!onValuesChange) return;
		onValuesChange({
			medium,
			workingPressure,
			temperatureMin,
			temperatureMax,
			hoseSize,
			customEndSize,
			moreRequirements,
		});
	}, [
		medium,
		workingPressure,
		temperatureMin,
		temperatureMax,
		hoseSize,
		customEndSize,
		moreRequirements,
		onValuesChange,
	]);

	// Only validate against the real API lists — never against temporary
	// FALLBACK options, or a restored draft value gets wiped before load.
	useEffect(() => {
		if (isLoadingMediums || mediums.length === 0) return;
		if (!medium) return;
		if (!mediums.includes(medium)) {
			setMedium("");
		}
	}, [isLoadingMediums, mediums, medium]);

	useEffect(() => {
		if (isLoadingDiameters || diameters.length === 0) return;
		if (!hoseSize) return;
		if (!diameters.includes(hoseSize)) {
			setHoseSize("");
		}
	}, [isLoadingDiameters, diameters, hoseSize]);

	useEffect(() => {
		if (minPressure == null || maxPressure == null) return;
		if (workingPressure === "") return;
		const numeric = Number(workingPressure);
		if (!Number.isFinite(numeric)) return;
		const clamped = clampToRange(numeric, minPressure, maxPressure);
		if (clamped !== numeric) {
			setWorkingPressure(String(clamped));
		}
	}, [minPressure, maxPressure, workingPressure]);

	useEffect(() => {
		if (minTemperature == null || maxTemperature == null) return;
		const min = Number(minTemperature);
		const max = Number(maxTemperature);
		if (!Number.isFinite(min) || !Number.isFinite(max)) return;

		const clampField = (value: string) => {
			if (value === "") return value;
			const numeric = Number(value);
			if (!Number.isFinite(numeric)) return value;
			return String(clampToRange(numeric, min, max));
		};

		const nextMin = clampField(temperatureMin);
		const nextMax = clampField(temperatureMax);
		if (nextMin !== temperatureMin) setTemperatureMin(nextMin);
		if (nextMax !== temperatureMax) setTemperatureMax(nextMax);
	}, [minTemperature, maxTemperature, temperatureMin, temperatureMax]);

	const isFormLoading =
		(isLoadingMediums && mediums.length === 0) ||
		(isLoadingDiameters && diameters.length === 0) ||
		(isLoadingPressure && minPressure == null) ||
		(isLoadingTemperature && minTemperature == null);

	const handleSubmit = (event: FormEvent) => {
		event.preventDefault();
		onFindHose({
			medium,
			workingPressure,
			temperatureMin,
			temperatureMax,
			hoseSize,
			customEndSize,
			moreRequirements,
		});
	};

	if (isFormLoading) {
		return <HoseFormSkeleton />;
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="w-full max-w-none space-y-5 border-[#E8EAE9] pb-8 lg:border-r lg:pr-10">
			<h2 className="text-base font-semibold text-[#0F1912]">
				{t("step1.formTitle")}
			</h2>

			<div className="space-y-1.5">
				<Label
					htmlFor="medium"
					className="text-sm font-medium text-[#0F1912]">
					{t("step1.medium")}
				</Label>
				<Select
					value={medium || undefined}
					onValueChange={(value) =>
						setMedium(value === CLEAR_VALUE ? "" : value)
					}>
					<SelectTrigger
						id="medium"
						className="h-11 bg-white">
						<SelectValue placeholder={t("step1.selectPlaceholder")} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={CLEAR_VALUE}>
							{t("step1.noSelection")}
						</SelectItem>
						{mediumOptions.map((option) => (
							<SelectItem
								key={option}
								value={option}>
								{option}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-1.5">
				<Label
					htmlFor="workingPressure"
					className="text-sm font-medium text-[#0F1912]">
					{t("step1.workingPressure")}
				</Label>
				<Input
					id="workingPressure"
					type="number"
					inputMode="decimal"
					min={pressureMin}
					max={pressureMax}
					step="any"
					value={workingPressure}
					placeholder={t("step1.selectPlaceholder")}
					onChange={(event) => setWorkingPressure(event.target.value)}
					className="h-11 bg-white"
				/>
				{minPressure != null && maxPressure != null && (
					<p className="text-xs text-[#5A615D]">
						{t("step1.rangeHint", {
							min: String(minPressure),
							max: String(maxPressure),
						})}
					</p>
				)}
			</div>

			<div className="space-y-1.5">
				<Label className="text-sm font-medium text-[#0F1912]">
					{t("step1.temperature")}
				</Label>
				<div className="grid grid-cols-2 gap-3">
					<div className="space-y-1">
						<Label
							htmlFor="temperatureMin"
							className="text-xs font-normal text-[#5A615D]">
							{t("step1.temperatureFrom")}
						</Label>
						<Input
							id="temperatureMin"
							type="number"
							inputMode="numeric"
							min={temperatureMinBound}
							max={temperatureMaxBound}
							step="1"
							value={temperatureMin}
							placeholder={t("step1.selectPlaceholder")}
							onChange={(event) => setTemperatureMin(event.target.value)}
							className="h-11 bg-white"
						/>
					</div>
					<div className="space-y-1">
						<Label
							htmlFor="temperatureMax"
							className="text-xs font-normal text-[#5A615D]">
							{t("step1.temperatureTo")}
						</Label>
						<Input
							id="temperatureMax"
							type="number"
							inputMode="numeric"
							min={temperatureMinBound}
							max={temperatureMaxBound}
							step="1"
							value={temperatureMax}
							placeholder={t("step1.selectPlaceholder")}
							onChange={(event) => setTemperatureMax(event.target.value)}
							className="h-11 bg-white"
						/>
					</div>
				</div>
				{minTemperature != null && maxTemperature != null && (
					<p className="text-xs text-[#5A615D]">
						{t("step1.rangeHint", {
							min: minTemperature,
							max: maxTemperature,
						})}
					</p>
				)}
			</div>

			<div className="space-y-1.5">
				<Label
					htmlFor="hoseSize"
					className="text-sm font-medium text-[#0F1912]">
					{t("step1.hoseSize")}
				</Label>
				<Select
					value={hoseSize || undefined}
					onValueChange={(value) =>
						setHoseSize(value === CLEAR_VALUE ? "" : value)
					}>
					<SelectTrigger
						id="hoseSize"
						className="h-11 bg-white">
						<SelectValue placeholder={t("step1.selectPlaceholder")} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={CLEAR_VALUE}>
							{t("step1.noSelection")}
						</SelectItem>
						{hoseSizeOptions.map((size) => (
							<SelectItem
								key={size}
								value={size}>
								{formatHoseSizeLabel(size)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="flex items-start gap-2.5 pt-1">
				<Checkbox
					id="customEndSize"
					checked={customEndSize}
					onCheckedChange={(checked) => setCustomEndSize(checked === true)}
					className="mt-0.5"
				/>
				<Label
					htmlFor="customEndSize"
					className="cursor-pointer text-sm leading-snug font-normal text-[#0F1912]">
					{t("step1.customEndSize")}
				</Label>
			</div>

			<Button
				type="submit"
				variant="greenSolid"
				disabled={isSearching}
				className="mt-2 h-11 w-full gap-2 text-base font-medium">
				{isSearching ? (
					<Loader2 className="h-4 w-4 animate-spin" />
				) : (
					<Search className="h-4 w-4" />
				)}
				{isSearching ? t("step1.searching") : t("step1.findHose")}
			</Button>
		</form>
	);
}
