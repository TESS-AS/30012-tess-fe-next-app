"use client";

import * as React from "react";
import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface DiscardEquipmentDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedIds: string[];
	onRemoveId?: (id: string) => void;
	onSubmit: (payload: {
		name: string;
		title: string;
		ids: string[];
	}) => Promise<void> | void;
	className?: string;
}

export function DiscardEquipmentDialog({
	open,
	onOpenChange,
	selectedIds,
	onRemoveId,
	onSubmit,
	className,
}: DiscardEquipmentDialogProps) {
	const [name, setName] = React.useState("");
	const [title, setTitle] = React.useState("");
	const [submitting, setSubmitting] = React.useState(false);

	const handleSubmit = async () => {
		setSubmitting(true);
		try {
			await onSubmit({
				name: name.trim(),
				title: title.trim(),
				ids: selectedIds,
			});
			setName("");
			setTitle("");
			onOpenChange(false);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent
				className={cn(
					"max-h-[85vh] max-w-xl overflow-y-auto rounded-2xl p-0",
					className,
				)}>
				<DialogHeader className="px-6 pt-5">
					<DialogTitle className="flex items-center gap-2 text-lg font-semibold">
						Utrangere utstyr
						<Info className="h-4 w-4 text-[#5A615D]" />
					</DialogTitle>
					<DialogClose className="text-muted-foreground" />
				</DialogHeader>

				<div className="space-y-4 px-6 pb-6">
					{/* Selected IDs chips */}
					<div className="rounded-md border border-[#C1C4C2] bg-white p-3">
						<p className="mb-2 text-sm font-medium text-[#0F1912]">
							Valgte slanger som skal behandles
						</p>
						<div className="flex flex-wrap gap-2">
							{selectedIds.length === 0 ? (
								<span className="text-sm text-[#5A615D]">Ingen valgt</span>
							) : (
								selectedIds.map((id) => (
									<span
										key={id}
										className="inline-flex items-center gap-1 rounded-md bg-[#E8EAE9] px-2 py-1 text-xs text-[#005522]">
										{id}
										{onRemoveId && (
											<button
												type="button"
												aria-label="Fjern"
												onClick={() => onRemoveId(id)}
												className="ml-1 inline-flex cursor-pointer items-center justify-center rounded-sm p-0.5 hover:bg-[#d6ecdb]">
												×
											</button>
										)}
									</span>
								))
							)}
						</div>
					</div>

					{/* Name & Title */}
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<div className="space-y-1">
							<label className="text-sm font-medium text-[#0F1912]">Navn</label>
							<Input
								placeholder="Hans Hansen"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="bg-white"
							/>
						</div>
						<div className="space-y-1">
							<label className="text-sm font-medium text-[#0F1912]">
								Tittel
							</label>
							<Input
								placeholder="Chief engineer"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className="bg-white"
							/>
						</div>
					</div>

					{/* Actions */}
					<div className="mt-2 flex items-center gap-3">
						<Button
							type="button"
							variant="outline"
							className="px-4"
							onClick={() => onOpenChange(false)}
							disabled={submitting}>
							Nei, avbryt
						</Button>
						<Button
							type="button"
							variant="destructive"
							className="px-4"
							onClick={handleSubmit}
							disabled={submitting || !name.trim() || !title.trim()}>
							{submitting ? "Sender..." : "Ja, utranger utstyr"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
