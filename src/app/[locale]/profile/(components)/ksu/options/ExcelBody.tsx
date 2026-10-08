"use client";

/**
 * "Opprett KSU fra Excel-mal" option body.
 *
 * Flow:
 *   1. Select mode (new catalog vs update existing)
 *   2. Download template (link to BE)
 *   3. Upload file → POST /assortment/excel/validate for a dry run
 *   4. Show validation summary (errors + counts)
 *   5. On "Opprett KSU" (submit) → POST /assortment/excel/commit
 *
 * The parent CreateKsuPage renders the final "Opprett KSU" button; this body
 * surfaces `canSubmit` via a window-scoped flag? NO — we expose a sidecar
 * ref via the wizard controller. For v1, submit for Excel calls commit when
 * the user hits the global Opprett KSU button; the parent calls into this
 * component through an imperative handle set on mount.
 *
 * Design decision: keep the Excel branch entirely self-contained in state —
 * `useCommitExcelImport` is called from here on Enter/action. The main wizard
 * controller is paused for excel mode (`canSubmit=false`). The parent page
 * passes a "submit handler" slot that we populate.
 */

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	useCommitExcelImport,
	useValidateExcelImport,
} from "@/hooks/useAssortmentQueries";
import type { AssortmentWizardController } from "@/hooks/useAssortmentWizard";
import { useGetAssortments } from "@/hooks/useGetAssortments";
import { getExcelTemplateUrl } from "@/services/assortment.service";
import type { ExcelValidationResult } from "@/types/assortment.types";
import { AlertTriangle, CheckCircle2, Download, Upload } from "lucide-react";
import { toast } from "react-toastify";

type ExcelMode = "new-catalog" | "update-existing";

interface Props {
	wizard: AssortmentWizardController;
	onCreated?: (assortmentNumber: string) => void;
}

export function ExcelBody({ wizard, onCreated }: Props) {
	const [mode, setMode] = React.useState<ExcelMode>("new-catalog");
	const [file, setFile] = React.useState<File | null>(null);
	const [validation, setValidation] =
		React.useState<ExcelValidationResult | null>(null);
	const [targetAssortmentNumber, setTargetAssortmentNumber] =
		React.useState<string>("");
	const [newCatalogName, setNewCatalogName] = React.useState<string>("");
	const [confirmed, setConfirmed] = React.useState(false);

	const { assortments, isLoading: isLoadingAssortments } = useGetAssortments(
		mode === "update-existing",
	);
	const validateMutation = useValidateExcelImport();
	const commitMutation = useCommitExcelImport();

	const handleFile = async (f: File) => {
		setFile(f);
		setValidation(null);
		try {
			const res = await validateMutation.mutateAsync(f);
			setValidation(res);
			if (!res.ok) {
				toast.error("Excel-filen inneholder feil. Se oppsummeringen under.");
			}
		} catch (e) {
			console.error("validate failed", e);
			toast.error("Kunne ikke validere Excel-filen.");
		}
	};

	const canCommit =
		file != null &&
		validation?.ok === true &&
		confirmed &&
		(mode === "new-catalog" ? newCatalogName.trim().length > 0 : targetAssortmentNumber.length > 0);

	const handleCommit = async () => {
		if (!file || !canCommit) return;
		try {
			const res = await commitMutation.mutateAsync({
				file,
				assortmentName:
					mode === "new-catalog" ? newCatalogName.trim() : undefined,
			});
			toast.success("KSU opprettet fra Excel-mal.");
			onCreated?.(res.assortmentNumber);
			wizard.reset();
		} catch (e) {
			console.error("commit failed", e);
			toast.error("Kunne ikke lagre Excel-import.");
		}
	};

	return (
		<div className="space-y-5 pt-4">
			<p className="text-sm text-[#5A615D]">
				Bruk Excel-mal for å opprette eller oppdatere KSU. Last ned en standard
				mal, fyll den ut i Excel og last den opp i denne veiviseren.
			</p>

			<div className="space-y-2">
				<h4 className="text-sm font-semibold text-[#0F1912]">
					1. Velg handling
				</h4>
				<RadioGroup
					value={mode}
					onValueChange={(v) => setMode(v as ExcelMode)}
					className="space-y-2">
					<label className="flex cursor-pointer items-center gap-2 text-sm">
						<RadioGroupItem value="new-catalog" />
						Opprett ny katalog
					</label>
					<label className="flex cursor-pointer items-center gap-2 text-sm">
						<RadioGroupItem value="update-existing" />
						Oppdater eksisterende katalog som du har tilgang til
					</label>
				</RadioGroup>

				{mode === "new-catalog" && (
					<div className="pl-6 pt-2">
						<Button
							variant="greenSolid"
							size="sm"
							asChild>
							<a
								href={getExcelTemplateUrl()}
								download>
								<Download className="mr-2 h-4 w-4" />
								Last ned mal
							</a>
						</Button>
					</div>
				)}

				{mode === "update-existing" && (
					<div className="pl-6 pt-2 space-y-2 max-w-md">
						<Select
							value={targetAssortmentNumber}
							onValueChange={setTargetAssortmentNumber}>
							<SelectTrigger
								disabled={isLoadingAssortments}
								className="bg-white">
								<SelectValue placeholder="Velg KSU ..." />
							</SelectTrigger>
							<SelectContent>
								{(assortments ?? []).map((a: Record<string, any>) => {
									const num = a.assortmentNumber as string | undefined;
									const label =
										(a.nameNo as string | undefined) ??
										(a.assortmentName as string | undefined) ??
										num ??
										"";
									if (!num) return null;
									return (
										<SelectItem
											key={num}
											value={num}>
											{label}
										</SelectItem>
									);
								})}
							</SelectContent>
						</Select>
					</div>
				)}
			</div>

			<div className="space-y-2">
				<h4 className="text-sm font-semibold text-[#0F1912]">
					2. Last opp utfylt Excel-mal
				</h4>
				<label className="inline-flex max-w-md cursor-pointer items-center gap-2 rounded-md border border-dashed border-[#C1C4C2] bg-[#F8F9F8] px-3 py-2 text-sm hover:bg-white">
					<Upload className="h-4 w-4 text-[#1C6D2C]" />
					<span className="truncate">{file ? file.name : "Velg fil ..."}</span>
					<input
						type="file"
						accept=".xls,.xlsx"
						onChange={(e) => {
							const f = e.target.files?.[0];
							if (f) handleFile(f);
						}}
						className="hidden"
					/>
				</label>
				<p className="text-xs text-[#5A615D]">
					Systemet gjør automatisk sjekk av struktur og format. Kun Excel-filer
					er akseptert.
				</p>
			</div>

			{mode === "new-catalog" && file && validation?.ok && (
				<div className="space-y-1 max-w-md">
					<h4 className="text-sm font-semibold text-[#0F1912]">
						3. Velg navn for ny katalog
					</h4>
					<Input
						value={newCatalogName}
						onChange={(e) => setNewCatalogName(e.target.value)}
						placeholder="Skriv nytt navn ..."
					/>
				</div>
			)}

			{validation && (
				<div className="space-y-3">
					<h4 className="text-sm font-semibold text-[#0F1912]">
						{mode === "new-catalog" ? "4" : "3"}. Bekreftelse og resultat
					</h4>

					{!validation.ok && (
						<div className="rounded-md border border-[#F0C9B8] bg-[#FDF0E7] px-3 py-2 text-sm">
							<div className="flex items-center gap-2 font-medium text-[#B35C0B]">
								<AlertTriangle className="h-4 w-4" />
								Validering feilet
							</div>
							<ul className="mt-2 ml-6 list-disc space-y-0.5 text-xs text-[#5A4030]">
								{validation.issues.slice(0, 20).map((i, idx) => (
									<li key={idx}>
										Rad {i.row}: {i.message}
									</li>
								))}
							</ul>
						</div>
					)}

					{validation.ok && (
						<div className="space-y-2">
							<div className="rounded-md border border-[#C6E7CD] bg-[#EFF9F1] px-3 py-2 text-sm">
								<div className="flex items-center gap-2 font-medium text-[#1C6D2C]">
									<CheckCircle2 className="h-4 w-4" />
									Oppsummering av opplasting
								</div>
								<dl className="mt-2 grid grid-cols-[180px_auto] gap-y-0.5 text-xs text-[#0F1912]">
									<dt>Antall i fil:</dt>
									<dd>{validation.rowCount ?? "—"}</dd>
									<dt>Antall produkter funnet:</dt>
									<dd>{validation.productsFound ?? "—"}</dd>
									<dt>Antall produkter ikke funnet:</dt>
									<dd>{validation.productsMissing ?? 0}</dd>
								</dl>
							</div>

							<label className="flex cursor-pointer items-start gap-2 text-sm">
								<input
									type="checkbox"
									checked={confirmed}
									onChange={(e) => setConfirmed(e.target.checked)}
									className="mt-0.5"
								/>
								<span>
									Ja, jeg er sikker på at jeg vil kjøre denne opplastingen.
								</span>
							</label>

							<Button
								variant="greenSolid"
								onClick={handleCommit}
								disabled={!canCommit || commitMutation.isPending}>
								{commitMutation.isPending ? "Lagrer ..." : "Bekreft og importer"}
							</Button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
