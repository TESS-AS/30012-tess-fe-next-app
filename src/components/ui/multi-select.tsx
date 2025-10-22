"use client";

import * as React from "react";
import { X, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export interface MultiSelectOption {
	label: string;
	value: string;
}

interface BaseProps {
	options: MultiSelectOption[];
	selected: string[];
	onChange: (selected: string[]) => void;
	placeholder?: string;
	className?: string;
}

function useMultiSelectLogic({
	options,
	selected,
	onChange,
}: Pick<BaseProps, "options" | "selected" | "onChange">) {
	const [open, setOpen] = React.useState(false);
	const [searchQuery, setSearchQuery] = React.useState("");

	const filteredOptions = React.useMemo(
		() =>
			options.filter((o) =>
				o.label.toLowerCase().includes(searchQuery.toLowerCase()),
			),
		[options, searchQuery],
	);

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

	const selectedLabels = React.useMemo(
		() =>
			selected
				.map((v) => options.find((o) => o.value === v)?.label)
				.filter((v): v is string => Boolean(v)),
		[selected, options],
	);

	return {
		open,
		setOpen,
		searchQuery,
		setSearchQuery,
		filteredOptions,
		toggleValue,
		removeValue,
		selectedLabels,
	} as const;
}

export function MultiSelect({
	options,
	selected,
	onChange,
	placeholder = "Velg...",
	className,
}: BaseProps) {
	const {
		open,
		setOpen,
		searchQuery,
		setSearchQuery,
		filteredOptions,
		toggleValue,
	} = useMultiSelectLogic({
		options,
		selected,
		onChange,
	});

	const selectedCountText =
		selected.length === 0 ? (
			<span className="text-[#5A615D]">{placeholder}</span>
		) : (
			<span className="text-[#0F1912]">
				{selected.length} kunde{selected.length !== 1 ? "r" : ""} valgt
			</span>
		);

	return (
		<Popover
			open={open}
			onOpenChange={setOpen}
			modal>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={cn(
						"h-auto min-h-[40px] w-full justify-between border-[#C1C4C2] bg-white px-3 py-2 text-left font-normal hover:bg-white",
						className,
					)}>
					<div className="flex flex-wrap gap-1">{selectedCountText}</div>
					<ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-[var(--radix-popover-trigger-width)] p-0"
				align="start"
				onOpenAutoFocus={(e) => e.preventDefault()}
				onCloseAutoFocus={(e) => e.preventDefault()}
				onInteractOutside={(e) => {
					const target = e.target as HTMLElement;
					if (target.closest("[data-ms-interactive]")) {
						e.preventDefault();
					}
				}}>
				<div className="flex flex-col">
					<div className="border-b border-[#E8EAE9] p-3">
						<div className="relative">
							<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#5A615D]" />
							<Input
								placeholder="Søk etter kunde..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								onKeyDown={(e) => e.stopPropagation()}
								className="h-9 border-[#C1C4C2] pl-9"
								data-ms-interactive
							/>
						</div>
					</div>

					<div className="max-h-[200px] overflow-y-auto p-2">
						{filteredOptions.length === 0 ? (
							<div className="py-6 text-center text-sm text-[#5A615D]">
								Ingen resultater funnet
							</div>
						) : (
							filteredOptions.map((option) => {
								const isSelected = selected.includes(option.value);
								return (
									<label
										key={option.value}
										htmlFor={`option-${option.value}`}
										className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 hover:bg-[#F8F9F8]"
										onPointerDown={(e) => e.preventDefault()}
										data-ms-interactive>
										<Checkbox
											id={`option-${option.value}`}
											checked={isSelected}
											onCheckedChange={() => toggleValue(option.value)}
											onClick={(e) => e.stopPropagation()}
											data-ms-interactive
										/>
										<span className="text-sm text-[#0F1912]">
											{option.label}
										</span>
									</label>
								);
							})
						)}
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}

export function MultiSelectWithTags({
	options,
	selected,
	onChange,
	placeholder = "Velg...",
	className,
}: BaseProps) {
	const {
		open,
		setOpen,
		searchQuery,
		setSearchQuery,
		filteredOptions,
		toggleValue,
		removeValue,
	} = useMultiSelectLogic({
		options,
		selected,
		onChange,
	});

	const [expanded, setExpanded] = React.useState(false);
	const maxCollapsedTags = 2;
	const shouldCollapse = selected.length > 3;
	const remainingCount = Math.max(selected.length - maxCollapsedTags, 0);

	const visibleValues =
		expanded || !shouldCollapse
			? selected
			: selected.slice(0, maxCollapsedTags);

	return (
		<div className="space-y-2">
			<Popover
				open={open}
				onOpenChange={setOpen}
				modal>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={open}
						className={cn(
							"h-auto min-h-[40px] w-full justify-between border-[#C1C4C2] bg-white px-3 py-2 text-left font-normal hover:bg-white",
							className,
						)}>
						<span className="text-[#0F1912]">
							{selected.length} kunde{selected.length !== 1 ? "r" : ""} valgt
						</span>
						<ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className="w-[var(--radix-popover-trigger-width)] p-0"
					align="start"
					onOpenAutoFocus={(e) => e.preventDefault()}
					onCloseAutoFocus={(e) => e.preventDefault()}
					onInteractOutside={(e) => {
						const target = e.target as HTMLElement;
						if (target.closest("[data-ms-interactive]")) {
							e.preventDefault();
						}
					}}>
					<div className="flex flex-col">
						<div className="border-b border-[#E8EAE9] p-3">
							<div className="relative">
								<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#5A615D]" />
								<Input
									placeholder="Søk etter kunde..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									onKeyDown={(e) => e.stopPropagation()}
									className="h-9 border-[#C1C4C2] pl-9"
									data-ms-interactive
								/>
							</div>
						</div>

						<div className="max-h-[200px] overflow-y-auto p-2">
							{filteredOptions.length === 0 ? (
								<div className="py-6 text-center text-sm text-[#5A615D]">
									Ingen resultater funnet
								</div>
							) : (
								filteredOptions.map((option) => {
									const isSelected = selected.includes(option.value);
									return (
										<label
											key={option.value}
											htmlFor={`option-multi-${option.value}`}
											className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 hover:bg-[#F8F9F8]"
											onPointerDown={(e) => e.preventDefault()}
											data-ms-interactive>
											<Checkbox
												id={`option-multi-${option.value}`}
												checked={isSelected}
												onCheckedChange={() => toggleValue(option.value)}
												onClick={(e) => e.stopPropagation()}
												data-ms-interactive
											/>
											<span className="text-sm text-[#0F1912]">
												{option.label}
											</span>
										</label>
									);
								})
							)}
						</div>
					</div>
				</PopoverContent>
			</Popover>

			{selected.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{visibleValues.map((value) => {
						const label =
							options.find((o) => o.value === value)?.label ?? value;
						return (
							<Badge
								key={value}
								variant="secondary"
								className="h-[22px] gap-1 rounded-md bg-[#E8EAE9] px-2 py-0 text-xs font-normal text-[#0F1912] hover:bg-[#E8EAE9]">
								{label}
								<button
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										removeValue(value);
									}}
									className="ml-1 rounded-sm hover:bg-[#C1C4C2]"
									aria-label={`Remove ${label}`}
									data-ms-interactive>
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
