import React from "react";
import { Input } from "./input";
import { Slider, SliderRange, SliderThumb, SliderTrack } from "./slider";

interface SliderConfig {
	min: number;
	max: number;
}

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
	const handleInputChange = (
		index: 0 | 1,
		inputValue: string,
		timerKey: string,
	) => {
		onInputStringChange(filterKey, index, inputValue);

		if (debounceTimerRef.current[timerKey]) {
			clearTimeout(debounceTimerRef.current[timerKey]);
		}

		if (inputValue === "") {
			return;
		}

		if (inputValue === "-" || inputValue === "-." || inputValue.endsWith(".")) {
			debounceTimerRef.current[timerKey] = setTimeout(() => {
				onInputStringChange(filterKey, index, "");
			}, 2000);
			return;
		}

		const value = Number(inputValue);
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

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<div className="text-muted-foreground mb-6 flex justify-between gap-2 px-0.5 text-sm">
					<Input
						className="w-20"
						placeholder="Min"
						value={
							inputStrings[filterKey]?.[0] !== undefined
								? inputStrings[filterKey]?.[0]
								: (tempRangeValues[filterKey]?.[0] ??
									rangeValues[filterKey]?.[0] ??
									sliderConfig.min)
						}
						onChange={(e) =>
							handleInputChange(0, e.target.value, `${filterKey}-min`)
						}
						onBlur={() => onInputBlur(filterKey, 0)}
						onKeyDown={handleKeyDown}
					/>

					<Input
						className="w-20"
						placeholder="Max"
						value={
							inputStrings[filterKey]?.[1] !== undefined
								? inputStrings[filterKey]?.[1]
								: (tempRangeValues[filterKey]?.[1] ??
									rangeValues[filterKey]?.[1] ??
									sliderConfig.max)
						}
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
