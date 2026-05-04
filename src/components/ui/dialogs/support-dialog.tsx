"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import Image from "next/image";

export interface SupportDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedIds: string[];
	onSubmit: (payload: {
		subject: string;
		message: string;
		file: File | null;
		ids: string[];
	}) => Promise<void> | void;
	onRemoveId?: (id: string) => void;
	className?: string;
}

export function SupportDialog({
	open,
	onOpenChange,
	selectedIds,
	onSubmit,
	onRemoveId,
	className,
}: SupportDialogProps) {
	const [subject, setSubject] = React.useState("");
	const [message, setMessage] = React.useState("");
	const [file, setFile] = React.useState<File | null>(null);
	const [submitting, setSubmitting] = React.useState(false);

	const handleSubmit = async () => {
		setSubmitting(true);
		try {
			await onSubmit({
				subject: subject.trim(),
				message: message.trim(),
				file,
				ids: selectedIds,
			});
			setSubject("");
			setMessage("");
			setFile(null);
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
					"max-h-[85vh] min-w-[650px] overflow-y-auto rounded-2xl p-0",
					className,
				)}>
				<DialogHeader className="px-6 pt-5">
					<DialogTitle className="text-lg font-semibold">
						Kontakt TESS support
					</DialogTitle>
					<DialogClose className="text-muted-foreground" />
				</DialogHeader>

				<div className="relative h-[200px] w-full overflow-hidden rounded-none">
					<Image
						src="/images/96701_kvadrat.png"
						alt="Banner"
						fill
						sizes="(max-width: 650px) 100vw, 650px"
						className="object-cover grayscale"
						loading="eager"
					/>
				</div>

				<div className="space-y-4 px-6 pt-4 pb-6">
					<div className="rounded-md border border-[#8A8F8C] bg-white p-3">
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
										className="inline-flex items-center rounded-md bg-[#E8EAE9] px-2 py-1 text-xs text-[#005522]">
										{id}
										{onRemoveId && (
											<Button
												type="button"
												aria-label="Fjern"
												variant="ghost"
												size="sm"
												className="ml-1 h-6 w-6 rounded-sm p-0 hover:bg-[#d6ecdb]"
												onClick={() => onRemoveId(id)}>
												<X className="h-3.5 w-3.5" />
											</Button>
										)}
									</span>
								))
							)}
						</div>
					</div>

					<div className="space-y-1">
						<label className="text-sm font-medium text-[#0F1912]">Tema</label>
						<Input
							placeholder="Hva gjelder henvendelsen?"
							value={subject}
							onChange={(e) => setSubject(e.target.value)}
							className="text-[#5A615D]"
						/>
					</div>

					<div className="space-y-1">
						<label className="text-sm font-medium text-[#0F1912]">
							Melding
						</label>
						<Textarea
							placeholder="Beskriv problemet så detaljert som mulig. Jo mer informasjon du gir, desto raskere kan vi hjelpe deg."
							rows={5}
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							className="border-[#8A8F8C] bg-[#F8F9F8] text-[#5A615D]"
						/>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium text-[#0F1912]">
							Legg til vedlegg
						</label>
						<div className="flex items-center gap-3 rounded-md border border-[#8A8F8C]">
							<label className="inline-flex cursor-pointer items-center rounded-l-md bg-[#003D1A] px-3 py-2 text-sm font-medium text-white hover:bg-[#003D1A]/80">
								Velg fil
								<input
									type="file"
									accept=".svg,.png,.jpg,.jpeg,.gif,.webp,.pdf"
									className="hidden"
									onChange={(e) => setFile(e.target.files?.[0] ?? null)}
								/>
							</label>
							<span className="text-sm text-[#5A615D]">
								{file ? file.name : "Ingen fil valgt"}
							</span>
						</div>
						<p className="text-xs text-[#5A615D]">
							SVG, PNG, JPG, GIF, WebP eller PDF
						</p>
					</div>

					<Button
						className="mt-2 w-full"
						disabled={submitting || !subject.trim() || !message.trim()}
						onClick={handleSubmit}>
						{submitting ? "Sender..." : "Send melding"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
