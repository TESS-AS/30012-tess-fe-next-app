"use client";

import { useCallback, useState } from "react";

import { Input } from "@/components/ui/input";
import { searchDimensions } from "@/services/dimensions.service";
import { SearchDimensionResponse } from "@/types/dimensions.types";
import debounce from "lodash/debounce";

interface Props {
	level: number;
	value: string;
	onSelect: (dimension: SearchDimensionResponse) => void;
	onChange: (value: string) => void;
	placeholder?: string;
	isVisible?: boolean;
}

export const DimensionSearchInput = ({
	level,
	value,
	onSelect,
	onChange,
	placeholder = "",
	isVisible = true,
}: Props) => {
	const [results, setResults] = useState<SearchDimensionResponse[]>([]);

	const debouncedSearch = useCallback(
		debounce(async (level: number, query: string) => {
			if (!query.trim()) return;
			try {
				const response = await searchDimensions(level, query);
				setResults(response || []);
			} catch (error) {
				console.error("Search error:", error);
			}
		}, 300),
		[],
	);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		onChange(newValue);
		debouncedSearch(level, newValue);
	};

	const handleSelect = (dimension: SearchDimensionResponse) => {
		onSelect(dimension);
		setResults([]); // Clear results on selection
	};


	return (
		<div className="relative mb-4">
			<Input
				type="text"
				value={value}
				placeholder={placeholder}
				onChange={handleInputChange}
			/>
			{isVisible && value !== "" && results.length > 0 && (
				<div className="absolute z-[999999] mt-1 h-[160px] w-full overflow-auto rounded-md border bg-white shadow">
					{results.map((dimension) => (
						<div
							key={dimension.dimensionId}
							className="cursor-pointer p-2 hover:bg-gray-100"
							onClick={() => handleSelect(dimension)}>
							{dimension.dimensionName} ({dimension.customerNumber})
						</div>
					))}
				</div>
			)}
		</div>
	);
};
