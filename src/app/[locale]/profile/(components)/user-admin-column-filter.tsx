"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useUserAdminFilterOptions } from "@/hooks/useUserAdminFilterOptions";
import { UserAdminFilterType } from "@/services/user.service";
import { Filter, Loader2, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface UserAdminColumnFilterProps {
	type: UserAdminFilterType;
	label: string;
	selected: string[];
	onChange: (values: string[]) => void;
}

export function UserAdminColumnFilter({
	type,
	label,
	selected,
	onChange,
}: UserAdminColumnFilterProps) {
	const t = useTranslations("UsersBrukere.filters");
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	useEffect(() => {
		const handle = setTimeout(() => setDebouncedSearch(search), 250);
		return () => clearTimeout(handle);
	}, [search]);

	const { options, isLoading } = useUserAdminFilterOptions(
		type,
		debouncedSearch,
		50,
		open,
	);

	const toggle = (value: string) => {
		onChange(
			selected.includes(value)
				? selected.filter((v) => v !== value)
				: [...selected, value],
		);
	};

	const hasActive = selected.length > 0;

	return (
		<span className="ml-1 inline-flex items-center align-middle">
			<Popover
				open={open}
				onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<button
						type="button"
						aria-label={t("open", { label })}
						onClick={(e) => e.stopPropagation()}
						className={`inline-flex h-5 w-5 items-center justify-center rounded ${
							hasActive
								? "bg-[#DCF7E0] text-[#005522]"
								: "text-[#5A615D] hover:bg-[#F7F9F8]"
						}`}>
						<Filter className="h-3 w-3" />
					</button>
				</PopoverTrigger>
				<PopoverContent
					align="start"
					className="w-[260px] p-3"
					onClick={(e) => e.stopPropagation()}>
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<span className="text-xs font-semibold text-[#0F1912]">
								{label}
							</span>
							{hasActive && (
								<button
									type="button"
									className="inline-flex items-center gap-1 text-xs text-[#1C6D2C] hover:underline"
									onClick={() => onChange([])}>
									<X className="h-3 w-3" />
									{t("clear")}
								</button>
							)}
						</div>
						<div className="relative">
							<Search className="pointer-events-none absolute top-1/2 left-2 h-3.5 w-3.5 -translate-y-1/2 text-[#8A8F8C]" />
							<Input
								placeholder={t("searchPlaceholder")}
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="h-8 pl-7 text-xs"
							/>
						</div>
						<div className="max-h-[220px] overflow-y-auto">
							{isLoading ? (
								<div className="flex items-center justify-center py-4">
									<Loader2 className="h-4 w-4 animate-spin text-[#8A8F8C]" />
								</div>
							) : options.length === 0 ? (
								<p className="py-3 text-center text-xs text-[#8A8F8C]">
									{t("empty")}
								</p>
							) : (
								<ul className="space-y-1">
									{options.map((option) => {
										const checked = selected.includes(option.value);
										return (
											<li key={option.value}>
												<label className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 hover:bg-[#F7F9F8]">
													<Checkbox
														checked={checked}
														onCheckedChange={() => toggle(option.value)}
													/>
													<span className="truncate text-xs text-[#0F1912]">
														{option.label}
													</span>
												</label>
											</li>
										);
									})}
								</ul>
							)}
						</div>
						<div className="flex justify-end pt-1">
							<Button
								variant="greenSolid"
								size="sm"
								className="h-8"
								onClick={() => setOpen(false)}>
								{t("done")}
							</Button>
						</div>
					</div>
				</PopoverContent>
			</Popover>
		</span>
	);
}
