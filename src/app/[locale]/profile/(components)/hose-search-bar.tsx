"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import * as React from "react";

export interface HoseSearchBarProps {
	value: string;
	onChange: (v: string) => void;
	onSearch: () => void;
	onClear: () => void;
	className?: string;
}

export function HoseSearchBar({
	value,
	onChange,
	onSearch,
	onClear,
	className,
}: HoseSearchBarProps) {
	return (
		<div className={cn("relative flex w-full max-w-[480px]", className)}>
			<Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#5A615D]" />
			<Input
				placeholder="Søk etter ID nummer, ordrenummer, fartøy eller utstyr..."
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter") onSearch();
				}}
				className="font-sm h-10 flex-1 rounded-md border border-[#8A8F8C] bg-[#F8F9F8] pr-20 pl-12 text-base text-[#5A615D]"
			/>
			{value && (
				<button
					type="button"
					onClick={onClear}
					className="absolute top-1/2 right-18 z-10 -translate-y-1/2 cursor-pointer rounded-sm p-1 opacity-50 ring-offset-white transition-all hover:bg-[#F8F9F8] hover:opacity-100 focus:ring-2 focus:ring-[#1C6D2C] focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
					<X className="h-4 w-4 text-[#5A615D]" />
					<span className="sr-only">Fjern søk</span>
				</button>
			)}
			<Button
				type="button"
				onClick={onSearch}
				className="absolute top-1/2 right-0 h-10 -translate-y-1/2 rounded-none rounded-r-md border-1 border-l-2 border-[#8A8F8C] bg-white px-4 font-medium text-[#0F1912] hover:bg-white">
				Søk
			</Button>
		</div>
	);
}
