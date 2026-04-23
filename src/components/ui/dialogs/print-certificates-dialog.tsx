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
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { Info, Printer } from "lucide-react";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import dynamic from "next/dynamic";

const Viewer = dynamic(
	() => import("@react-pdf-viewer/core").then((m) => m.Viewer),
	{ ssr: false },
);
const Worker = dynamic(
	() => import("@react-pdf-viewer/core").then((m) => m.Worker),
	{ ssr: false },
);

export interface PrintCertificatesDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedIds: string[];
	onRemoveId?: (id: string) => void;
	pdfUrl?: string;
	className?: string;
}

export function PrintCertificatesDialog({
	open,
	onOpenChange,
	selectedIds,
	onRemoveId,
	pdfUrl,
	className,
}: PrintCertificatesDialogProps) {
	const [certType, setCertType] = React.useState<"tess" | "customer">("tess");

	const defaultLayout = React.useRef(defaultLayoutPlugin()).current;

	const handlePrint = () => {
		if (pdfUrl) window.open(pdfUrl, "_blank", "noopener,noreferrer");
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent
				className={cn(
					"max-h-[90vh] max-w-5xl overflow-y-auto rounded-2xl p-0",
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
						<span className="text-sm text-[#0F1912]">
							Velg trykktest sertifikat
						</span>
						<span className="text-sm text-[#0F1912]">type:</span>

						<PillSwitcher
							options={[
								{ label: "TESS: Trykktest sertifikat", value: "tess" },
								{ label: "Kunde: Trykktest sertifikat", value: "customer" },
							]}
							value={certType}
							onChange={(v) => setCertType(v as "tess" | "customer")}
						/>

						<Button
							type="button"
							onClick={handlePrint}
							variant="darkGreen"
							className="ml-auto">
							<Printer className="mr-2 h-4 w-4" /> Skriv ut
						</Button>
					</div>

					<div className="h-[70vh] w-full overflow-hidden rounded-xl border border-[#E6E7E6] bg-white">
						{pdfUrl ? (
							// <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
							// <Worker workerUrl="https://unpkg.com/pdfjs-dist@5.4.149/build/pdf.worker.min.js">
							<Worker workerUrl="/pdf.worker.min.mjs">
								<div className="h-full w-full">
									<Viewer
										fileUrl={pdfUrl}
										plugins={[defaultLayout]}
										theme={{ theme: "light" }}
									/>
								</div>
							</Worker>
						) : (
							<div className="flex h-full items-center justify-center text-sm text-[#5A615D]">
								Forhåndsvisning av PDF vil vises her når URL er tilgjengelig.
							</div>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
