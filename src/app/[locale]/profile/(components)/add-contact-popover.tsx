"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { editableUsersKeys } from "@/hooks/useGetEditableUsers";
import { useSearchTessEmployees } from "@/hooks/useSearchTessEmployees";
import { postUserContacts } from "@/services/user.service";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, UserPlus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

interface AddContactPopoverProps {
	targetUserId: number;
	existingContactIds?: number[];
	trigger: React.ReactNode;
}

interface SelectedContact {
	userId: number;
	label: string;
}

export function AddContactPopover({
	targetUserId,
	existingContactIds = [],
	trigger,
}: AddContactPopoverProps) {
	const t = useTranslations("UsersBrukere.addContact");
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [selected, setSelected] = useState<SelectedContact[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { results, isFetching } = useSearchTessEmployees(search);

	const existingSet = new Set(existingContactIds);
	const selectedSet = new Set(selected.map((c) => c.userId));
	const filtered = results.filter(
		(r) => !existingSet.has(r.userId) && !selectedSet.has(r.userId),
	);

	const contactLabel = (
		firstName: string | null,
		lastName: string | null,
		email: string,
	) => {
		const name = `${firstName ?? ""} ${lastName ?? ""}`.trim();
		return name ? `${name} (${email})` : email;
	};

	const handleSubmit = async () => {
		if (selected.length === 0) return;
		setIsSubmitting(true);
		try {
			await postUserContacts(
				selected.map((c) => c.userId),
				targetUserId,
			);
			queryClient.invalidateQueries({ queryKey: editableUsersKeys.all });
			toast(t("success"), { type: "success" });
			setSelected([]);
			setSearch("");
			setOpen(false);
		} catch (err) {
			console.error("Failed to add contacts", err);
			toast(t("error"), { type: "error" });
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Popover
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				if (!next) {
					setSelected([]);
					setSearch("");
				}
			}}>
			<PopoverTrigger asChild>{trigger}</PopoverTrigger>
			<PopoverContent
				align="end"
				className="w-[320px] p-3"
				onClick={(e) => e.stopPropagation()}>
				<div className="space-y-3">
					<div className="flex items-center gap-2">
						<UserPlus className="h-4 w-4 text-[#0F1912]" />
						<span className="text-sm font-semibold text-[#0F1912]">
							{t("title")}
						</span>
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
					{selected.length > 0 && (
						<div className="flex flex-wrap gap-1.5">
							{selected.map((c) => (
								<span
									key={c.userId}
									className="inline-flex items-center gap-1 rounded-full bg-[#E8F5E9] px-2 py-0.5 text-xs text-[#0F1912]">
									{c.label}
									<button
										type="button"
										onClick={() =>
											setSelected((prev) =>
												prev.filter((s) => s.userId !== c.userId),
											)
										}
										className="text-[#5A615D] hover:text-[#0F1912]">
										<X className="h-3 w-3" />
									</button>
								</span>
							))}
						</div>
					)}
					<div className="max-h-[200px] overflow-y-auto rounded border border-[#E5E7E6]">
						{isFetching ? (
							<div className="flex items-center justify-center py-4">
								<Loader2 className="h-4 w-4 animate-spin text-[#8A8F8C]" />
							</div>
						) : search.trim().length === 0 ? (
							<p className="px-3 py-3 text-center text-xs text-[#8A8F8C]">
								{t("hint")}
							</p>
						) : filtered.length === 0 ? (
							<p className="px-3 py-3 text-center text-xs text-[#8A8F8C]">
								{t("empty")}
							</p>
						) : (
							<ul>
								{filtered.map((r) => (
									<li key={r.userId}>
										<button
											type="button"
											onClick={() =>
												setSelected((prev) => [
													...prev,
													{
														userId: r.userId,
														label: contactLabel(r.firstName, r.lastName, r.email),
													},
												])
											}
											className="w-full px-3 py-2 text-left text-xs hover:bg-[#F7F9F8]">
											{contactLabel(r.firstName, r.lastName, r.email)}
										</button>
									</li>
								))}
							</ul>
						)}
					</div>
					<div className="flex justify-end gap-2">
						<Button
							variant="outline"
							size="sm"
							className="h-8"
							onClick={() => setOpen(false)}
							disabled={isSubmitting}>
							{t("cancel")}
						</Button>
						<Button
							variant="greenSolid"
							size="sm"
							className="h-8"
							disabled={selected.length === 0 || isSubmitting}
							onClick={handleSubmit}>
							{isSubmitting ? (
								<Loader2 className="h-3.5 w-3.5 animate-spin" />
							) : (
								t("confirm", { count: selected.length })
							)}
						</Button>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
