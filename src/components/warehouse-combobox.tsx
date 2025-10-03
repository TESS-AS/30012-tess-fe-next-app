"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, ChevronDown, Search } from "lucide-react";

import { Label } from "./ui/label";

type Warehouse = {
	warehouseNumber: string;
	warehouseName: string;
	inStockCount: number;
	cartItemCount: number;
	isMyWarehouse?: boolean;
};

const WAREHOUSE_SELECTION_KEY = "warehouse-selection";

function clearWarehouseSelection() {
	localStorage.removeItem(WAREHOUSE_SELECTION_KEY);
}

export function WarehouseCombobox({
	warehouseBalance,
	value,
	onChange,
	placeholder = "Velg lager",
}: {
	warehouseBalance: Warehouse[];
	value?: string | null;
	onChange: (warehouseNumber: string) => void;
	placeholder?: string;
}) {
	const [open, setOpen] = React.useState(false);
	const [query, setQuery] = React.useState("");

	const selected = React.useMemo(() => {
		const savedSelection = localStorage.getItem(WAREHOUSE_SELECTION_KEY);
		const effectiveValue = value || savedSelection;
		return warehouseBalance.find((w) => w.warehouseNumber === effectiveValue);
	}, [warehouseBalance, value]);

	const filtered = React.useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return warehouseBalance;
		return warehouseBalance.filter(
			(w) =>
				w.warehouseName.toLowerCase().includes(q) ||
				w.warehouseNumber.toLowerCase().includes(q),
		);
	}, [warehouseBalance, query]);

	const handleSelect = (val: string) => {
		if (val) {
			localStorage.setItem(WAREHOUSE_SELECTION_KEY, val);
		} else {
			clearWarehouseSelection();
		}
		onChange(val);
		setOpen(false);
	};

	React.useEffect(() => {
		return () => {
			if (!value) {
				clearWarehouseSelection();
			}
		};
	}, [value]);

	return (
		<Popover
			open={open}
			onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"w-[300px] justify-between rounded-md border-[#8A8F8C] bg-[#F8F9F8] text-[#5A615D]",
						"shadow-sm transition-colors duration-200",
						open &&
							"border-[#ADEEBE bg-[#005522] text-white outline-[2px] outline-[#ADEEBE]",
					)}>
					<span className="truncate">
						{selected ? `Mitt lager: ${selected.warehouseName}` : placeholder}
					</span>
					<ChevronDown
						className={cn(
							"h-4 w-4 opacity-60 transition-transform duration-200",
							open && "rotate-180",
						)}
					/>
				</Button>
			</PopoverTrigger>

			<PopoverContent
				align="start"
				className="w-[360px] border border-[#E3E5E4] p-0 shadow-xl"
				onOpenAutoFocus={(e) => e.preventDefault()}>
				<div className="relative w-full px-3 pt-3">
					<Search className="pointer-events-none absolute top-[22px] left-5 h-4 w-4 opacity-60" />
					<Input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Søk etter lager"
						className="w-full rounded-md border border-[#8A8F8C] bg-[#F8F9F8] pl-9 text-sm text-[#5A615D] placeholder-[#5A615D] focus-visible:ring-0"
					/>
				</div>

				<div className="max-h-[300px] overflow-auto p-2">
					{filtered.length === 0 ? (
						<div className="px-2 py-1 text-sm text-[#858A87]">
							Ingen resultater.
						</div>
					) : (
						<RadioGroup
							value={
								value || localStorage.getItem(WAREHOUSE_SELECTION_KEY) || ""
							}
							onValueChange={handleSelect}
							className="gap-0">
							{filtered.map((w) => {
								const ok = w.inStockCount >= w.cartItemCount;
								const savedSelection = localStorage.getItem(
									WAREHOUSE_SELECTION_KEY,
								);
								const selectedRow =
									(value || savedSelection) === w.warehouseNumber;
								const id = `wh-${w.warehouseNumber}`;

								return (
									<div
										key={w.warehouseNumber}
										className={cn(
											"flex w-full items-start gap-2 rounded-lg p-1",
											selectedRow && "bg-[#F6F7F6] ring-1 ring-[#2F9D62]",
										)}>
										<RadioGroupItem
											value={w.warehouseNumber}
											id={id}
											className="mt-0.5 shrink-0 border-[#C9CECB] data-[state=checked]:border-[#2F9D62]"
										/>

										<Label
											htmlFor={id}
											className="flex w-full cursor-pointer items-center justify-between">
											<div className="min-w-0">
												<div className="truncate text-sm font-medium text-[#1C211F]">
													{w.warehouseName}
													{w.isMyWarehouse && (
														<span className="ml-2 align-middle text-xs font-normal text-[#858A87]">
															(mitt lager)
														</span>
													)}
												</div>
											</div>

											<div className="ml-2 flex flex-shrink-0 items-center gap-1">
												{ok ? (
													<CheckCircle className="h-4 w-4 text-[#2F9D62]" />
												) : (
													<AlertCircle className="h-4 w-4 text-[#D39200]" />
												)}
												<span className="text-sm text-[#1F2B24]">
													{w.inStockCount}/{w.cartItemCount} tilgjengelig
												</span>
											</div>
										</Label>
									</div>
								);
							})}
						</RadioGroup>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
