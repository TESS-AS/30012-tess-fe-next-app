"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { X, ChevronDown, Search } from "lucide-react";

export interface MultiSelectOption {
	label: string;
	value: string;
}

export interface BaseProps {
	options: MultiSelectOption[];
	selected: string[];
	onChange: (selected: string[]) => void;
	placeholder?: string;
	className?: string;
	onSearchChange?: (value: string) => void;
	page?: number;
	onNextPage?: () => void;
	onPrevPage?: () => void;
	canNextPage?: boolean;
	canPrevPage?: boolean;
	isLoading?: boolean;
}

function useMultiSelectLogic({
	options,
	selected,
	onChange,
	onSearchChange,
}: Pick<BaseProps, "options" | "selected" | "onChange" | "onSearchChange">) {
	const [open, setOpen] = React.useState(false);
	const [searchQuery, setSearchQueryState] = React.useState("");

	const setSearchQuery = React.useCallback(
		(value: string) => {
			setSearchQueryState(value);
			onSearchChange?.(value);
		},
		[onSearchChange],
	);

	const filteredOptions = React.useMemo(() => {
		if (onSearchChange) return options;
		return options.filter((o) => {
			const q = searchQuery.toLowerCase();
			const matchLabel = o?.label?.toLowerCase().includes(q);
			const matchValue = o?.value?.toLowerCase().includes(q);
			return matchLabel || matchValue;
		});
	}, [options, searchQuery, onSearchChange]);

	const toggleValue = React.useCallback(
		(value: string) => {
			const next = selected.includes(value)
				? selected.filter((v) => v !== value)
				: [...selected, value];
			onChange(next);
		},
		[selected, onChange],
	);

	const removeValue = React.useCallback(
		(value: string) => {
			onChange(selected.filter((v) => v !== value));
		},
		[selected, onChange],
	);

	return {
		open,
		setOpen,
		searchQuery,
		setSearchQuery,
		filteredOptions,
		toggleValue,
		removeValue,
	} as const;
}

export function MultiSelectWithTags({
	options,
	selected,
	onChange,
	placeholder = "Velg...",
	className,
	onSearchChange,
	page,
	onNextPage,
	onPrevPage,
	canNextPage,
	canPrevPage,
	isLoading,
}: BaseProps) {
	const effectiveOptions = React.useMemo(() => {
		const missingSelected = selected.filter(
			(value) => !options.some((o) => o.value === value),
		);

		if (missingSelected.length === 0) return options;

		const syntheticOptions = missingSelected.map((value) => ({
			value,
			label: value,
		}));

		return [...options, ...syntheticOptions];
	}, [options, selected]);

	const {
		open,
		setOpen,
		searchQuery,
		setSearchQuery,
		filteredOptions,
		toggleValue,
		removeValue,
	} = useMultiSelectLogic({
		options: effectiveOptions,
		selected,
		onChange,
		onSearchChange,
	});

	React.useEffect(() => {
		if (process.env.NODE_ENV === "production") return;
		if (!open) return;
		const missingSelected = selected.filter(
			(value) => !options.some((o) => o.value === value),
		);
		console.debug("[MultiSelect] open", {
			selectedCount: selected.length,
			optionsCount: options.length,
			effectiveOptionsCount: effectiveOptions.length,
			missingSelected,
		});
		console.debug(
			"[MultiSelect] option values sample",
			effectiveOptions.slice(0, 15).map((o) => o.value),
		);
	}, [open, options, effectiveOptions, selected]);

	React.useEffect(() => {
		if (process.env.NODE_ENV === "production") return;
		if (!open) return;
		console.debug("[MultiSelect] search", {
			searchQuery,
			filteredOptionsCount: filteredOptions.length,
		});
	}, [open, searchQuery, filteredOptions.length]);

	const [expanded, setExpanded] = React.useState(false);
	const maxCollapsedTags = 2;
	const shouldCollapse = selected.length > 3;
	const remainingCount = Math.max(selected.length - maxCollapsedTags, 0);
	const [hasRequestedNextPage, setHasRequestedNextPage] = React.useState(false);
	const scrollRafRef = React.useRef<number | null>(null);

	const maybeRequestNextPage = React.useCallback(
		(target: HTMLDivElement) => {
			if (isLoading) return;
			if (hasRequestedNextPage) return;
			if (!canNextPage || !onNextPage) return;
			if (target.scrollHeight <= target.clientHeight + 1) return;

			const thresholdPx = 80;
			const distanceToBottom =
				target.scrollHeight - (target.scrollTop + target.clientHeight);
			const nearBottom = distanceToBottom <= thresholdPx;

			if (nearBottom) {
				setHasRequestedNextPage(true);
				onNextPage();
			}
		},
		[isLoading, hasRequestedNextPage, canNextPage, onNextPage],
	);

	const handleScroll = React.useCallback(
		(e: React.UIEvent<HTMLDivElement>) => {
			const target = e.currentTarget;
			if (scrollRafRef.current != null) return;
			scrollRafRef.current = window.requestAnimationFrame(() => {
				scrollRafRef.current = null;
				maybeRequestNextPage(target);
			});
		},
		[maybeRequestNextPage],
	);

	React.useEffect(() => {
		setHasRequestedNextPage(false);
	}, [page]);

	React.useEffect(() => {
		return () => {
			if (scrollRafRef.current != null) {
				window.cancelAnimationFrame(scrollRafRef.current);
				scrollRafRef.current = null;
			}
		};
	}, []);

	const visibleValues =
		expanded || !shouldCollapse
			? selected
			: selected.slice(0, maxCollapsedTags);

	return (
		<div className="space-y-2">
			<DropdownMenu
				open={open}
				onOpenChange={setOpen}>
				<DropdownMenuTrigger asChild>
					<Button
						variant="outline"
						className={cn(
							"h-auto min-h-[40px] w-full justify-between border-[#C1C4C2] bg-white px-3 py-2 text-left font-normal hover:bg-white",
							className,
						)}>
						{selected.length === 0 ? (
							<span className="text-[#5A615D]">{placeholder}</span>
						) : (
							<span className="text-[#0F1912]">
								{selected.length} kunde{selected.length !== 1 ? "r" : ""} valgt
							</span>
						)}
						<ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent
					align="start"
					className="w-[var(--radix-dropdown-menu-trigger-width)] p-0"
					onCloseAutoFocus={(e) => e.preventDefault()}>
					<div className="border-b border-[#E8EAE9] p-3">
						<div className="relative">
							<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#5A615D]" />
							<Input
								placeholder="Søk etter kunde..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								onKeyDown={(e) => e.stopPropagation()}
								onPointerDown={(e) => e.stopPropagation()}
								className="h-9 border-[#C1C4C2] pl-9"
							/>
						</div>
					</div>

					<div
						className="max-h-[200px] overflow-y-auto p-2"
						onScroll={handleScroll}>
						{filteredOptions.length === 0 && isLoading ? (
							<div className="py-6 text-center text-sm text-[#5A615D]">
								Laster...
							</div>
						) : filteredOptions.length === 0 ? (
							<div className="py-6 text-center text-sm text-[#5A615D]">
								Ingen resultater funnet
							</div>
						) : (
							filteredOptions.map((option) => {
								const isSelected = selected.includes(option.value);
								const displayLabel =
									option.value && option.value !== option.label
										? `${option.label} (${option.value})`
										: option.label;
								return (
									<DropdownMenuCheckboxItem
										key={option.value}
										checked={isSelected}
										onSelect={(e) => e.preventDefault()}
										onCheckedChange={() => toggleValue(option.value)}
										className="flex items-start gap-2">
										<span
											className="min-w-0 flex-1 break-words whitespace-normal"
											title={displayLabel}>
											{displayLabel}
										</span>
									</DropdownMenuCheckboxItem>
								);
							})
						)}
						{filteredOptions.length > 0 && isLoading && (
							<div className="py-3 text-center text-sm text-[#5A615D]">
								Laster...
							</div>
						)}
						{canNextPage && <div className="h-8" />}
					</div>
				</DropdownMenuContent>
			</DropdownMenu>

			{selected.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{visibleValues.map((value) => {
						const matchedOption = effectiveOptions.find(
							(o) => o.value === value,
						);
						const displayLabel =
							matchedOption && matchedOption.value !== matchedOption.label
								? `${matchedOption.label} (${matchedOption.value})`
								: (matchedOption?.label ?? value);
						return (
							<Badge
								key={value}
								variant="secondary"
								className="min-h-[22px] max-w-full gap-1 rounded-md bg-[#E8EAE9] px-2 py-1 text-xs font-normal text-[#0F1912] hover:bg-[#E8EAE9]">
								<span
									className="min-w-0 flex-1 break-words whitespace-normal"
									title={displayLabel}>
									{displayLabel}
								</span>
								<button
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										removeValue(value);
									}}
									className="ml-1 rounded-sm hover:bg-[#C1C4C2]"
									aria-label={`Remove ${displayLabel}`}>
									<X className="h-3 w-3 cursor-pointer" />
								</button>
							</Badge>
						);
					})}

					{!expanded && shouldCollapse && remainingCount > 0 && (
						<Button
							type="button"
							variant="outline"
							onClick={() => setExpanded(true)}
							className="h-[22px] rounded-md border-[#009640] py-0 text-xs text-[#009640] hover:bg-white">
							+{remainingCount} ›
						</Button>
					)}

					{expanded && shouldCollapse && (
						<Button
							type="button"
							variant="outline"
							onClick={() => setExpanded(false)}
							className="h-[22px] rounded-md border-[#009640] py-0 text-xs text-[#009640] hover:bg-white">
							Lukk ‹
						</Button>
					)}
				</div>
			)}
		</div>
	);
}
