"use client";

/**
 * "Opprett nytt KSU" — the main creation page.
 *
 * Rendered inside the profile Tabs shell at ?tab=ksu-create. Four radio
 * accordions, only one expanded at a time. Below the active option body,
 * the "Hvem er ansvarlig(e)" user block is shared (per Figma — the
 * "Hvem er kunden" and "Kunder knyttet til KSU" sections intentionally
 * do NOT exist here, per product spec).
 *
 * Footer buttons (Avbryt + Opprett KSU) are rendered for every option.
 * For Excel mode, the global "Opprett KSU" button is wired to the Excel
 * commit path via `excelHandle` — a shared handle the ExcelBody updates
 * every time its own `canCommit`/`handleCommit` changes. Keeps all commit
 * actions in one place for the user, while leaving Excel's inline step-4
 * "Bekreft og importer" button in place for discoverability.
 *
 * All non-Excel form state lives in `useAssortmentWizard`.
 */

import * as React from "react";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAssortmentWizard } from "@/hooks/useAssortmentWizard";
import type { WizardOption } from "@/hooks/useAssortmentWizard";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { BookOpen, X } from "lucide-react";
import { toast } from "react-toastify";

import { EgneKategorierBody } from "./options/EgneKategorierBody";
import { ExcelBody, type ExcelCommitHandle } from "./options/ExcelBody";
import { KopierBody } from "./options/KopierBody";
import { OpprettNyBody } from "./options/OpprettNyBody";
import { AnsvarligeSection } from "./sections/AnsvarligeSection";

const OPTIONS: Array<{
	value: WizardOption;
	label: string;
	helpWhenCollapsed?: string;
}> = [
	{ value: "new", label: "Opprett ny KSU" },
	{ value: "copy", label: "Kopier en eksisterende KSU du har tilgang til" },
	{ value: "excel", label: "Opprett KSU fra Excel-mal" },
	{ value: "egne", label: "Opprett KSU med egne kategorier" },
];

export function CreateKsuPage() {
	const router = useRouter();
	const wizard = useAssortmentWizard({
		onSuccess: (assortmentNumber) => {
			toast.success("KSU opprettet.");
			router.push(
				`/profile?tab=ksu-create&created=${encodeURIComponent(assortmentNumber)}`,
			);
		},
		onError: () => {
			toast.error(
				"Kunne ikke opprette KSU. Prøv igjen eller kontakt administrator.",
			);
		},
	});

	// Updated by ExcelBody whenever its commit function or canCommit flag
	// changes. The global footer's "Opprett KSU" button reads from this to
	// drive the Excel commit path.
	const [excelHandle, setExcelHandle] = React.useState<ExcelCommitHandle | null>(
		null,
	);

	const isExcel = wizard.selectedOption === "excel";
	const footerCanSubmit = isExcel
		? Boolean(excelHandle?.canCommit)
		: wizard.canSubmit;
	const footerIsSubmitting = isExcel
		? Boolean(excelHandle?.isSubmitting)
		: wizard.isSubmitting;
	const handleFooterSubmit = () => {
		if (isExcel) {
			excelHandle?.commit().catch(() => undefined);
		} else {
			wizard.submit().catch(() => undefined);
		}
	};

	return (
		<div className="space-y-5">
			<div className="rounded-md border border-[#E5E7E6] bg-white px-6 py-5">
				<div>
					<h2 className="text-lg font-semibold text-[#0F1912]">
						Opprette nytt KSU
					</h2>
					<p className="mt-1 text-sm text-[#5A615D]">
						Opprett et nytt kundespesifikt utvalg som passer til ditt behov.
					</p>
				</div>

				<RadioGroup
					value={wizard.selectedOption ?? ""}
					onValueChange={(v) => wizard.setOption(v as WizardOption)}
					className="mt-5 space-y-3">
					{OPTIONS.map((opt) => {
						const isActive = wizard.selectedOption === opt.value;
						return (
							<div
								key={opt.value}
								className={cn(
									"rounded-md border px-4 py-3 transition-colors",
									isActive
										? "border-[#00873C] bg-white"
										: "border-[#E5E7E6] bg-white hover:border-[#C1C4C2]",
								)}>
								<label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[#0F1912]">
									<RadioGroupItem value={opt.value} />
									{opt.label}
								</label>
								{isActive && (
									<div className="mt-1 pl-7">
										{opt.value === "new" && <OpprettNyBody wizard={wizard} />}
										{opt.value === "copy" && <KopierBody wizard={wizard} />}
										{opt.value === "excel" && (
											<ExcelBody
												wizard={wizard}
												onCreated={(num) =>
													router.push(
														`/profile?tab=ksu-create&created=${encodeURIComponent(num)}`,
													)
												}
												onHandleChange={setExcelHandle}
											/>
										)}
										{opt.value === "egne" && (
											<EgneKategorierBody wizard={wizard} />
										)}
									</div>
								)}
							</div>
						);
					})}
				</RadioGroup>

				{wizard.selectedOption && !isExcel && (
					<div className="mt-6 border-t border-[#E5E7E6] pt-6">
						<AnsvarligeSection wizard={wizard} />
					</div>
				)}

				{wizard.selectedOption && (
					<div className="mt-6 flex items-center gap-2">
						<Button
							variant="outline"
							onClick={wizard.reset}
							disabled={footerIsSubmitting}
							className="gap-2">
							<X className="h-4 w-4" />
							Avbryt
						</Button>
						<Button
							variant="greenSolid"
							onClick={handleFooterSubmit}
							disabled={!footerCanSubmit}
							className="gap-2">
							<BookOpen className="h-4 w-4" />
							{footerIsSubmitting ? "Oppretter ..." : "Opprett KSU"}
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
