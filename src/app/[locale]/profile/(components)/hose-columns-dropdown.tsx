"use client";

import * as React from "react";

import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, GripVertical, PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export interface HoseColumnsDropdownProps {
	options: string[];
	selected: string[];
	onToggle: (value: string) => void;
	onReorder?: (nextOrder: string[]) => void;
	labels?: Record<string, string>;
}

export function HoseColumnsDropdown({
	options,
	selected,
	onToggle,
	onReorder,
	labels,
}: HoseColumnsDropdownProps) {
	const t = useTranslations("HoseColumnsDropdown");
	const [dragging, setDragging] = React.useState<string | null>(null);

	const move = React.useCallback(
		(from: number, to: number) => {
			if (!onReorder) return;
			if (from === to) return;
			if (from < 0 || to < 0) return;
			if (from >= options.length || to >= options.length) return;

			const next = [...options];
			const [item] = next.splice(from, 1);
			next.splice(to, 0, item);
			onReorder(next);
		},
		[onReorder, options],
	);

	const getLabel = React.useCallback(
		(option: string) => labels?.[option] ?? option,
		[labels],
	);

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
								draggable={Boolean(onReorder)}
								onDragStart={(e) => {
									if (!onReorder) return;
									setDragging(option);
									e.dataTransfer.effectAllowed = "move";
									e.dataTransfer.setData("text/plain", option);
								}}
								onDragEnd={() => setDragging(null)}
								onDragOver={(e) => {
									if (!onReorder) return;
									e.preventDefault();
									e.dataTransfer.dropEffect = "move";
								}}
								onDrop={(e) => {
									if (!onReorder) return;
									e.preventDefault();
									const fromOption = e.dataTransfer.getData("text/plain");
									const fromIndex = options.indexOf(fromOption);
									const toIndex = options.indexOf(option);
									move(fromIndex, toIndex);
									setDragging(null);
								}}
								className="rounded-md p-0 focus:bg-gray-50">
								<div
									className={
										"flex items-center gap-2 py-1.5 pr-2 " +
										(dragging === option ? "opacity-60" : "")
									}>
									<span
										onClick={(e) => e.stopPropagation()}
										className={
											"cursor-grab text-[#8A8F8C] active:cursor-grabbing " +
											(!onReorder ? "hidden" : "")
										}>
										<GripVertical className="h-4 w-4" />
									</span>
									<Checkbox checked={selected.includes(option)} />
									<span className="text-gray-700">{getLabel(option)}</span>
								</div>
							</DropdownMenuItem>
						))}
					</div>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
