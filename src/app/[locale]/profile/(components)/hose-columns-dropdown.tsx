"use client";

import * as React from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from "next-intl";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusIcon, ChevronDown } from "lucide-react";

export interface HoseColumnsDropdownProps {
	options: string[];
	selected: string[];
	onToggle: (value: string) => void;
}

export function HoseColumnsDropdown({
	options,
	selected,
	onToggle,
}: HoseColumnsDropdownProps) {
	const t = useTranslations("HoseColumnsDropdown");
	return (
		<div className="flex items-center">
			<DropdownMenu>
				<DropdownMenuTrigger className="flex w-[200px] items-center justify-between rounded-md border border-[#C1C4C2] bg-white px-3 py-2 text-[#5A615D]">
					<div className="flex items-center gap-2">
						<PlusIcon size={16} />
						<span>{t("addColumn")}</span>
					</div>
					<ChevronDown
						size={16}
						className="text-[#5A615D]"
					/>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-[300px] rounded-2xl bg-white p-4 shadow-lg">
					<div className="space-y-2">
						{options.map((option) => (
							<DropdownMenuItem
								key={option}
								onSelect={(e) => {
									e.preventDefault();
									onToggle(option);
								}}
								className="rounded-md p-0 focus:bg-gray-50">
								<div className="flex items-center space-x-2">
									<Checkbox checked={selected.includes(option)} />
									<span className="text-gray-700">{option}</span>
								</div>
							</DropdownMenuItem>
						))}
					</div>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
