"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { PillSwitcher } from "@/components/ui/pill-switcher";
import { cn } from "@/lib/utils";
import { Info, Printer } from "lucide-react";
import Image from "next/image";

export interface PrintTagsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedIds: string[];
	onRemoveId?: (id: string) => void;
	previewUrl?: string;
	className?: string;
}

export function PrintTagsDialog({
	open,
	onOpenChange,
	selectedIds,
	onRemoveId,
	previewUrl,
	className,
}: PrintTagsDialogProps) {
	const [tagType, setTagType] = React.useState<"standard" | "compact">(
		"standard",
	);
	const [template, setTemplate] = React.useState<string>(
		"Detaljert TAG bar S1 S2",
	);

	const handlePrint = () => {
		if (previewUrl) {
			window.open(previewUrl, "_blank", "noopener,noreferrer");
		} else {
			const blob = new Blob(["Tag print coming soon"], { type: "text/plain" });
			const url = URL.createObjectURL(blob);
			window.open(url, "_blank", "noopener,noreferrer");
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent
				className={cn(
					"max-h-[90vh] max-w-4xl overflow-y-auto rounded-2xl p-0",
					className,
				)}>
				<DialogHeader className="px-6 pt-5">
					<DialogTitle className="flex items-center gap-2 text-lg font-semibold">
						Print
						<Info className="h-4 w-4 text-[#5A615D]" />
					</DialogTitle>
					<DialogClose className="text-muted-foreground" />
				</DialogHeader>

				<div className="space-y-4 px-6 pb-6">
					<div className="rounded-xl border border-[#C1C4C2] bg-white p-3">
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
										className="inline-flex items-center gap-1 rounded-full border border-[#C1C4C2]/60 bg-[#E8EAE9] px-2.5 py-1 text-xs font-medium text-[#005522]">
										{id}
										{onRemoveId && (
											<button
												type="button"
												aria-label="Fjern"
												onClick={() => onRemoveId(id)}
												className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-[#0F1912]/60 hover:bg-[#d6ecdb]">
												×
											</button>
										)}
									</span>
								))
							)}
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-3">
						<span className="text-sm text-[#0F1912]">Velg TAG type:</span>
						<PillSwitcher
							options={[
								{ label: "Standard tag", value: "standard" },
								{ label: "Kompakt", value: "compact" },
							]}
							value={tagType}
							onChange={(v) => setTagType(v as "standard" | "compact")}
						/>
					</div>

					<div className="flex flex-wrap items-center gap-3">
						<span className="text-sm text-[#0F1912]">Velg Template:</span>
						<button
							type="button"
							onClick={() => setTemplate("Detaljert TAG bar S1 S2")}
							className="rounded-full bg-[#003D1A] px-3 py-1 text-xs font-semibold text-white hover:bg-[#164B1F]">
							{template}
						</button>
					</div>

					<div className="space-y-2">
						<p className="text-sm font-medium text-[#0F1912]">
							Eksempelvisning:
						</p>
						<div className="overflow-hidden rounded-xl border border-[#1F2422] bg-white p-3">
							{previewUrl ? (
								<Image
									src={previewUrl}
									alt="tag-preview"
									className="mx-auto max-h-[220px] object-contain"
								/>
							) : (
								<div className="flex h-[220px] items-center justify-center text-sm text-[#5A615D]">
									Forhåndsvisning av TAG vil vises her når URL er tilgjengelig.
								</div>
							)}
						</div>
					</div>

					<div className="mt-2 flex items-center gap-3">
						<Button
							type="button"
							variant="outline"
							className="px-4"
							onClick={() => onOpenChange(false)}>
							Lukk
						</Button>
						<Button
							type="button"
							className="bg-[#1C6D2C] text-white hover:bg-[#164B1F]"
							onClick={handlePrint}>
							<Printer className="mr-2 h-4 w-4" /> Print
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
