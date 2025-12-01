import React from "react";

import type { SliderConfig } from "@/types/filter.types";

import { Input } from "./input";
import { Slider, SliderRange, SliderThumb, SliderTrack } from "./slider";

interface SliderFilterInputProps {
	filterKey: string;
	sliderConfig: SliderConfig;
	rangeValues: Record<string, [number, number]>;
	tempRangeValues: Record<string, [number, number]>;
	inputStrings: Record<string, [string, string]>;
	onInputChange: (filterKey: string, index: 0 | 1, value: number) => void;
	onSliderChange: (filterKey: string, values: [number, number]) => void;
	onInputStringChange: (filterKey: string, index: 0 | 1, value: string) => void;
	onInputBlur: (filterKey: string, index: 0 | 1) => void;
	debounceTimerRef: React.MutableRefObject<Record<string, NodeJS.Timeout>>;
}

export const SliderFilterInput: React.FC<SliderFilterInputProps> = ({
	filterKey,
	sliderConfig,
	rangeValues,
	tempRangeValues,
	inputStrings,
	onInputChange,
	onSliderChange,
	onInputStringChange,
	onInputBlur,
	debounceTimerRef,
}) => {
	const getUnit = () => {
		if (sliderConfig.unit) {
			return sliderConfig.unit;
		}

		const key = sliderConfig.attributeKey.toLowerCase();
		if (key.includes("temperatur")) {
			return "°C";
		}
		if (key.includes("arbeidstrykk") || key.includes("bar")) {
			return " bar";
		}
		return "";
	};

	const handleInputChange = (
		index: 0 | 1,
		inputValue: string,
		timerKey: string,
	) => {
		let cleanValue = inputValue;
		const unit = getUnit();
		if (unit && inputValue.endsWith(unit)) {
			cleanValue = inputValue.slice(0, -unit.length);
		}

		onInputStringChange(filterKey, index, cleanValue);

		if (debounceTimerRef.current[timerKey]) {
			clearTimeout(debounceTimerRef.current[timerKey]);
		}

		if (cleanValue === "") {
			return;
		}

		if (cleanValue === "-" || cleanValue === "-." || cleanValue.endsWith(".")) {
			debounceTimerRef.current[timerKey] = setTimeout(() => {
				onInputStringChange(filterKey, index, "");
			}, 2000);
			return;
		}

		const value = Number(cleanValue);
		if (!isNaN(value)) {
			onInputChange(filterKey, index, value);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (
			e.key === "Backspace" ||
			e.key === "Delete" ||
			e.key === "Tab" ||
			e.key === "Escape" ||
			e.key === "Enter" ||
			e.key === "ArrowLeft" ||
			e.key === "ArrowRight" ||
			e.key === "-" ||
			e.key === "." ||
			/^\d$/.test(e.key)
		) {
			return;
		}
		e.preventDefault();
	};

	const formatValueWithUnit = (value: number | string) => {
		const unit = getUnit();
		if (unit) {
			return `${value}${unit}`;
		}
		return value;
	};

	const getDisplayValue = (index: 0 | 1) => {
		const inputString = inputStrings[filterKey]?.[index];
		if (inputString !== undefined) {
			return inputString;
		}
		const value =
			tempRangeValues[filterKey]?.[index] ??
			rangeValues[filterKey]?.[index] ??
			(index === 0 ? sliderConfig.min : sliderConfig.max);
		return formatValueWithUnit(value);
	};

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<div className="text-muted-foreground mb-6 flex justify-between gap-2 px-0.5 text-sm">
					<Input
						className="w-20"
						placeholder="Min"
						value={getDisplayValue(0)}
						onChange={(e) =>
							handleInputChange(0, e.target.value, `${filterKey}-min`)
						}
						onBlur={() => onInputBlur(filterKey, 0)}
						onKeyDown={handleKeyDown}
					/>

					<Input
						className="w-20"
						placeholder="Max"
						value={getDisplayValue(1)}
						onChange={(e) =>
							handleInputChange(1, e.target.value, `${filterKey}-max`)
						}
						onBlur={() => onInputBlur(filterKey, 1)}
						onKeyDown={handleKeyDown}
					/>
				</div>
				<Slider
					value={
						tempRangeValues[filterKey] ||
						rangeValues[filterKey] || [sliderConfig.min, sliderConfig.max]
					}
					onValueChange={(values) =>
						onSliderChange(filterKey, values as [number, number])
					}
					min={sliderConfig.min}
					max={sliderConfig.max}
					step={1}
					className="w-full">
					<SliderTrack>
						<SliderRange />
					</SliderTrack>
					<SliderThumb />
					<SliderThumb />
				</Slider>
			</div>
		</div>
	);
};
