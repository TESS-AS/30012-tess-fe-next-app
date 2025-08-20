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
	parentId?: string;
}

export const DimensionSearchInput = ({
	level,
	value,
	onSelect,
	onChange,
	placeholder = "",
	isVisible = true,
	parentId,
}: Props) => {
	const [results, setResults] = useState<SearchDimensionResponse[]>([]);
	const [isFocused, setIsFocused] = useState(false);

	const debouncedSearch = useCallback(
		debounce(async (level: number, query: string) => {
			try {
				const response = await searchDimensions(
					level,
					query.trim() || undefined,
					level > 1 ? parentId : undefined
				);
				setResults(response || []);
			} catch (error) {
				console.error("Search error:", error);
			}
		}, 300),
		[parentId],
	);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		onChange(newValue);
		debouncedSearch(level, newValue);
	};

	const handleSelect = (dimension: SearchDimensionResponse) => {
		onSelect(dimension);
		setResults([]);
	};

	return (
		<div className="relative mb-4">
			<Input
				type="text"
				value={value}
				placeholder={placeholder}
				onChange={handleInputChange}
				onFocus={() => setIsFocused(true)}
				onBlur={() => {
					setTimeout(() => setIsFocused(false), 200);
				}}
			/>
			{isVisible && isFocused && value !== "" && (
				results.length > 0 ? (
				<div className="absolute z-[999999] mt-1 h-[160px] w-full overflow-auto rounded-md border bg-white shadow">
					{(results ?? []).map((dimension) => (
						<div
							key={dimension.dimensionId}
							className="cursor-pointer p-2 hover:bg-gray-100"
							onClick={() => handleSelect(dimension)}>
							{dimension.dimensionName} ({dimension.customerNumber})
						</div>
					))}
				</div>
				) : (
					<div className="absolute z-[999999] mt-1 w-full rounded-md border bg-white p-4 text-center text-gray-500 shadow">
						Ingen resultater funnet
					</div>
				)
			)}
		</div>
	);
};
