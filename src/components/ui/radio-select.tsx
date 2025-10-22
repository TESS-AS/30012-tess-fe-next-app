"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { ChevronDown, Search } from "lucide-react";

export interface RadioSelectOption {
	label: string;
	value: string;
}

interface RadioSelectProps {
	options: RadioSelectOption[];
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	searchable?: boolean;
	closeOnSelect?: boolean;
}

export function RadioSelect({
	options,
	value,
	onChange,
	placeholder = "Velg...",
	className,
	searchable = true,
	closeOnSelect = true,
}: RadioSelectProps) {
	const [open, setOpen] = React.useState(false);
	const [searchQuery, setSearchQuery] = React.useState("");

	const filteredOptions = React.useMemo(
		() =>
			options.filter((o) =>
				o.label.toLowerCase().includes(searchQuery.toLowerCase()),
			),
		[options, searchQuery],
	);

	const selectedOption = React.useMemo(
		() => options.find((o) => o.value === value),
		[options, value],
	);

	const handleSelect = React.useCallback(
		(selectedValue: string) => {
			onChange(selectedValue);
			if (closeOnSelect) setOpen(false);
		},
		[onChange, closeOnSelect],
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
					<span
						className={cn(
							selectedOption ? "text-[#0F1912]" : "text-[#5A615D]",
						)}>
						{selectedOption ? selectedOption.label : placeholder}
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
					if (target.closest("[data-rs-interactive]")) {
						e.preventDefault();
					}
				}}>
				<div className="flex flex-col">
					{searchable && (
						<div className="border-b border-[#E8EAE9] p-3">
							<div className="relative">
								<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#5A615D]" />
								<Input
									placeholder="Søk..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									onKeyDown={(e) => e.stopPropagation()}
									className="h-9 border-[#C1C4C2] pl-9"
									data-rs-interactive
								/>
							</div>
						</div>
					)}

					<div className="max-h-[240px] overflow-y-auto p-2">
						{filteredOptions.length === 0 ? (
							<div className="py-6 text-center text-sm text-[#5A615D]">
								Ingen resultater funnet
							</div>
						) : (
							<RadioGroup
								value={value}
								onValueChange={handleSelect}
								className="gap-0">
								{filteredOptions.map((option) => {
									const isSelected = value === option.value;
									const id = `radio-${option.value}`;
									return (
										<div
											key={option.value}
											className={cn(
												"flex w-full items-center gap-3 rounded-lg p-2",
												isSelected && "bg-[#F6F7F6]",
											)}
											data-rs-interactive>
											<RadioGroupItem
												value={option.value}
												id={id}
												className="shrink-0 border-[#C1C4C2] data-[state=checked]:border-[#009640]"
												data-rs-interactive
											/>
											<Label
												htmlFor={id}
												className="w-full cursor-pointer text-xs text-[#0F1912]"
												data-rs-interactive>
												{option.label}
											</Label>
										</div>
									);
								})}
							</RadioGroup>
						)}
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
