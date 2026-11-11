"use client";

/**
 * "Opprett KSU fra Excel-mal" option body.
 *
 * Figma flow (4 numbered sections):
 *
 *   1. Velg handling — radio: "Opprett ny katalog" vs
 *      "Oppdater eksisterende katalog som du har tilgang til".
 *      Picking the first surfaces a template download button.
 *
 *   2. Hent fil — a chip-style file field (paperclip icon + filename + X
 *      clear) with a separate outline "Velg fil" button to the right,
 *      THEN a green "Last opp KSU" button below that actually uploads
 *      (POST /assortment/excel/validate). Confirmation line below:
 *      "KSU lastet opp: <filename>".
 *
 *   3. Velg mål for opplastning — BOTH destination options are visible
 *      with an "Eller" divider between them:
 *        a) "Opprett som ny katalog med nytt unikt navn:" + name input +
 *           inline "Lagre" button.
 *        b) "Erstatt eksisterende katalog som du har tilgang til:" +
 *           "Velg katalog ..." dropdown.
 *      Whichever control the user fills in determines the destination.
 *
 *   4. Bekreftelse og resultat — when replacing an existing KSU, show an
 *      orange "Overskriving" warning card with a "Ja, lag en
 *      sikkerhetskopi" switch (default ON) + a backup filename chip.
 *      Always show a green "Oppsummering av opplastning" card with
 *      counts and, when productsMissing > 0, a
 *      "Last ned liste over manglende produkter" button.
 *
 * BE gap flagged with TODO: `backupBeforeOverwrite` and
 * `targetAssortmentNumber` aren't accepted by /assortment/excel/commit
 * yet — currently only `assortmentName` is sent. Wire them in when the
 * BE payload lands.
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
import { Switch } from "@/components/ui/switch";
import {
	useCommitExcelImport,
	useValidateExcelImport,
} from "@/hooks/useAssortmentQueries";
import type { AssortmentWizardController } from "@/hooks/useAssortmentWizard";
import { useGetAssortments } from "@/hooks/useGetAssortments";
import { downloadExcelTemplate } from "@/services/assortment.service";
import type { ExcelValidationResult } from "@/types/assortment.types";
import {
	AlertTriangle,
	CheckCircle2,
	Download,
	Paperclip,
	Upload,
	X,
} from "lucide-react";
import { toast } from "react-toastify";

type ExcelMode = "new-catalog" | "update-existing";

/** Shared handle the parent CreateKsuPage reads from so its global
 *  "Opprett KSU" footer button can trigger the Excel commit. */
export interface ExcelCommitHandle {
	commit: () => Promise<void>;
	canCommit: boolean;
	isSubmitting: boolean;
}

interface Props {
	wizard: AssortmentWizardController;
	onCreated?: (assortmentNumber: string) => void;
	onHandleChange?: (handle: ExcelCommitHandle | null) => void;
}

export function ExcelBody({ wizard, onCreated, onHandleChange }: Props) {
	const [mode, setMode] = React.useState<ExcelMode>("new-catalog");

	// File selection + upload state
	const [file, setFile] = React.useState<File | null>(null);
	const [uploadedFileName, setUploadedFileName] = React.useState<string | null>(
		null,
	);
	const [validation, setValidation] =
		React.useState<ExcelValidationResult | null>(null);
	const fileInputRef = React.useRef<HTMLInputElement>(null);

	// Destination (step 3) — independent fields so the user can fill one
	// or the other. The active destination is whichever was filled last.
	const [newCatalogName, setNewCatalogName] = React.useState("");
	const [targetAssortmentNumber, setTargetAssortmentNumber] = React.useState("");
	const [newCatalogSaved, setNewCatalogSaved] = React.useState(false);

	// Step 4 — overskriving (only relevant when destination is "replace existing")
	const [backupBeforeOverwrite, setBackupBeforeOverwrite] = React.useState(true);

	const { assortments, isLoading: isLoadingAssortments } = useGetAssortments(true);
	const validateMutation = useValidateExcelImport();
	const commitMutation = useCommitExcelImport();

	const activeDestination: "new" | "replace" | null = targetAssortmentNumber
		? "replace"
		: newCatalogSaved && newCatalogName.trim().length > 0
			? "new"
			: null;

	const handlePickFile = (f: File | null) => {
		setFile(f);
		setUploadedFileName(null);
		setValidation(null);
	};

	const validationOk = (validation?.errors?.length ?? 0) === 0;

	const handleUpload = async () => {
		if (!file) return;
		try {
			const res = await validateMutation.mutateAsync(file);
			setValidation(res);
			setUploadedFileName(file.name);
			if ((res.errors?.length ?? 0) > 0) {
				toast.error("Excel-filen inneholder feil. Se oppsummeringen under.");
			} else {
				toast.success("Fil opplastet og validert.");
			}
		} catch (e) {
			console.error("validate failed", e);
			toast.error("Kunne ikke validere Excel-filen.");
		}
	};

	const canCommit =
		file != null &&
		validationOk &&
		activeDestination !== null &&
		!commitMutation.isPending;

	const handleCommit = React.useCallback(async () => {
		if (!file || !canCommit) return;
		try {
			const res = await commitMutation.mutateAsync({
				file,
				// TODO BE: commit doesn't yet accept targetAssortmentNumber or
				// backupBeforeOverwrite — only the new-catalog name path is wired.
				// Pass whichever the user filled; the replace path will no-op
				// until BE accepts it.
				assortmentName:
					activeDestination === "new" ? newCatalogName.trim() : undefined,
			});
			toast.success("KSU opprettet fra Excel-mal.");
			onCreated?.(res.assortmentNumber);
			wizard.reset();
		} catch (e) {
			console.error("commit failed", e);
			toast.error("Kunne ikke lagre Excel-import.");
		}
	}, [
		activeDestination,
		canCommit,
		commitMutation,
		file,
		newCatalogName,
		onCreated,
		wizard,
	]);

	// Report the commit handle up to CreateKsuPage so the global footer's
	// "Opprett KSU" button can route through it. Clear on unmount so when
	// the user switches away from Excel, the footer stops thinking it has
	// an Excel commit to drive.
	React.useEffect(() => {
		onHandleChange?.({
			commit: handleCommit,
			canCommit,
			isSubmitting: commitMutation.isPending,
		});
		return () => onHandleChange?.(null);
	}, [onHandleChange, handleCommit, canCommit, commitMutation.isPending]);

	const assortmentsList = (assortments ?? []) as Array<Record<string, any>>;
	const existingKatalogList = assortmentsList
		.map((a) => ({
			number: a.assortmentNumber as string | undefined,
			label:
				(a.nameNo as string | undefined) ??
				(a.assortmentName as string | undefined) ??
				(a.assortmentNumber as string | undefined),
		}))
		.filter((x): x is { number: string; label: string } => Boolean(x.number));

	// Default backup filename shown in the Overskriving card. Derived from
	// the uploaded filename with a `_(kopi)` suffix per Figma.
	const backupFileName = React.useMemo(() => {
		if (!uploadedFileName) return null;
		const dot = uploadedFileName.lastIndexOf(".");
		if (dot < 0) return `${uploadedFileName}_(kopi)`;
		return `${uploadedFileName.slice(0, dot)}_(kopi)${uploadedFileName.slice(dot)}`;
	}, [uploadedFileName]);

	return (
		<div className="space-y-6 pt-4">
			<p className="text-sm text-[#5A615D]">
				Bruk Excel-mal for å opprette eller oppdatere KSU. Last ned en standard
				mal, fyll den ut i Excel og last den opp i denne veiviseren.
			</p>

			{/* ---------------- 1. Velg handling ---------------- */}
			<section className="space-y-3">
				<h4 className="text-sm font-semibold text-[#0F1912]">
					1. Velg handling
				</h4>
				<RadioGroup
					value={mode}
					onValueChange={(v) => setMode(v as ExcelMode)}
					className="space-y-3">
					<label className="flex cursor-pointer items-start gap-2 text-sm">
						<RadioGroupItem
							value="new-catalog"
							className="mt-0.5"
						/>
						<div className="space-y-2">
							<span className="font-medium text-[#0F1912]">
								Opprett ny katalog
							</span>
							{mode === "new-catalog" && (
								<>
									<p className="text-xs text-[#5A615D]">
										Last ned en standard Excel-mal, fyll den ut i Excel og last
										den opp for å opprette et nytt KSU.
									</p>
									<Button
										variant="greenSolid"
										size="sm"
										className="gap-2"
										onClick={async () => {
											try {
												await downloadExcelTemplate();
											} catch (err) {
												console.error("Failed to download Excel template", err);
												toast.error("Kunne ikke laste ned Excel-malen.");
											}
										}}>
										<Download className="h-4 w-4" />
										Last ned mal
									</Button>
								</>
							)}
						</div>
					</label>
					<label className="flex cursor-pointer items-start gap-2 text-sm">
						<RadioGroupItem
							value="update-existing"
							className="mt-0.5"
						/>
						<span className="font-medium text-[#0F1912]">
							Oppdater eksisterende katalog som du har tilgang til
						</span>
					</label>
				</RadioGroup>
			</section>

			{/* ---------------- 2. Hent fil ---------------- */}
			<section className="space-y-3">
				<h4 className="text-sm font-semibold text-[#0F1912]">2. Hent fil</h4>
				<p className="text-xs text-[#5A615D]">Last opp utfylt Excel-mal:</p>
				<div className="flex max-w-md items-center gap-2">
					<div className="relative flex flex-1 items-center rounded-md border border-dashed border-[#8A8F8C] bg-white px-3 py-1.5">
						<Paperclip className="h-4 w-4 shrink-0 text-[#5A615D]" />
						<span className="ml-2 flex-1 truncate text-sm text-[#0F1912]">
							{file ? file.name : "Velg fil ..."}
						</span>
						{file && (
							<button
								type="button"
								onClick={() => handlePickFile(null)}
								aria-label="Fjern valgt fil"
								className="ml-1 shrink-0 text-[#5A615D] hover:text-[#0F1912]">
								<X className="h-4 w-4" />
							</button>
						)}
					</div>
					<Button
						variant="outlineGreen"
						size="sm"
						onClick={() => fileInputRef.current?.click()}>
						Velg fil
					</Button>
					<input
						ref={fileInputRef}
						type="file"
						accept=".xls,.xlsx"
						onChange={(e) => {
							const f = e.target.files?.[0] ?? null;
							handlePickFile(f);
						}}
						className="hidden"
					/>
				</div>
				<p className="text-xs text-[#5A615D]">
					Systemet gjør automatisk sjekk av struktur og filformat. Kun Excel
					filer er akseptert.
				</p>
				<Button
					variant="greenSolid"
					size="sm"
					className="gap-2"
					disabled={!file || validateMutation.isPending}
					onClick={handleUpload}>
					<Upload className="h-4 w-4" />
					{validateMutation.isPending ? "Laster opp ..." : "Last opp KSU"}
				</Button>
				{uploadedFileName && (
					<p className="text-sm text-[#0F1912]">
						<span className="text-[#5A615D]">KSU lastet opp:</span>{" "}
						<span className="font-medium">{uploadedFileName}</span>
					</p>
				)}
			</section>

			{/* ---------------- 3. Velg mål for opplastning ---------------- */}
			<section className="space-y-4">
				<h4 className="text-sm font-semibold text-[#0F1912]">
					3. Velg mål for opplastning
				</h4>

				<div className="space-y-2 max-w-md">
					<label className="text-sm text-[#0F1912]">
						Opprett som ny katalog med nytt unikt navn:
					</label>
					<div className="flex items-center gap-2">
						<div className="relative flex-1">
							<Input
								value={newCatalogName}
								onChange={(e) => {
									setNewCatalogName(e.target.value);
									setNewCatalogSaved(false);
									if (e.target.value.trim().length > 0) {
										setTargetAssortmentNumber("");
									}
								}}
								placeholder="Skriv nytt navn ..."
							/>
							{newCatalogName && (
								<button
									type="button"
									onClick={() => {
										setNewCatalogName("");
										setNewCatalogSaved(false);
									}}
									aria-label="Fjern navn"
									className="absolute top-1/2 right-2 -translate-y-1/2 text-[#5A615D] hover:text-[#0F1912]">
									<X className="h-4 w-4" />
								</button>
							)}
						</div>
						<Button
							variant="outlineGreen"
							size="sm"
							disabled={newCatalogName.trim().length === 0}
							onClick={() => setNewCatalogSaved(true)}>
							Lagre
						</Button>
					</div>
				</div>

				<p className="text-sm font-medium text-[#0F1912]">Eller</p>

				<div className="space-y-2 max-w-md">
					<label className="text-sm text-[#0F1912]">
						Erstatt eksisterende katalog som du har tilgang til:
					</label>
					<Select
						value={targetAssortmentNumber}
						onValueChange={(v) => {
							setTargetAssortmentNumber(v);
							if (v) {
								setNewCatalogName("");
								setNewCatalogSaved(false);
							}
						}}>
						<SelectTrigger
							disabled={isLoadingAssortments}
							className="bg-white">
							<SelectValue placeholder="Velg katalog ..." />
						</SelectTrigger>
						<SelectContent>
							{existingKatalogList.map((k) => (
								<SelectItem
									key={k.number}
									value={k.number}>
									{k.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</section>

			{/* ---------------- 4. Bekreftelse og resultat ----------------
				Rendered as soon as the user has uploaded a file OR picked a
				destination, so the section is visible as part of the Excel
				flow structure (Figma shows it unconditionally). Individual
				cards gate on their own data: Overskriving only when
				replacing existing, Oppsummering fills in `—` placeholders
				until BE validation populates the counts, and the "Validering
				feilet" strip only surfaces when BE returns issues. */}
			{(uploadedFileName || activeDestination) && (
				<section className="space-y-4">
					<h4 className="text-sm font-semibold text-[#0F1912]">
						4. Bekreftelse og resultat
					</h4>

					{validation && !validationOk && validation.errors.length > 0 && (
						<div className="rounded-md border border-[#F0C9B8] bg-[#FDF0E7] px-3 py-2 text-sm">
							<div className="flex items-center gap-2 font-medium text-[#B35C0B]">
								<AlertTriangle className="h-4 w-4" />
								Validering feilet
							</div>
							<ul className="mt-2 ml-6 list-disc space-y-0.5 text-xs text-[#5A4030]">
								{validation.errors.slice(0, 20).map((i, idx) => (
									<li key={idx}>
										Rad {i.row}: {i.message}
									</li>
								))}
							</ul>
						</div>
					)}

					{activeDestination === "replace" && (
						<OverskrivingCard
							backupBeforeOverwrite={backupBeforeOverwrite}
							onToggleBackup={setBackupBeforeOverwrite}
							backupFileName={backupFileName}
						/>
					)}

					<OppsummeringCard
						rowCount={validation?.rowCount}
						productsFound={validation?.summary?.antallLeggesTil}
						productsMissing={validation?.summary?.antallIkkeFunnet}
					/>

					<Button
						variant="greenSolid"
						onClick={handleCommit}
						disabled={!canCommit}>
						{commitMutation.isPending ? "Lagrer ..." : "Bekreft og importer"}
					</Button>
				</section>
			)}
		</div>
	);
}

function OverskrivingCard({
	backupBeforeOverwrite,
	onToggleBackup,
	backupFileName,
}: {
	backupBeforeOverwrite: boolean;
	onToggleBackup: (next: boolean) => void;
	backupFileName: string | null;
}) {
	return (
		<div className="space-y-3 rounded-md border border-[#F0C9B8] bg-[#FDF0E7] px-4 py-3">
			<div className="flex items-center gap-2 text-sm font-semibold text-[#B0261A]">
				<CheckCircle2 className="h-4 w-4" />
				Overskriving
			</div>
			<p className="text-xs text-[#B0261A]">
				Denne filen blir overskrevet. Du kan ikke angre dette.
			</p>
			<label className="flex items-center gap-3 text-sm font-medium text-[#B0261A]">
				<Switch
					checked={backupBeforeOverwrite}
					onCheckedChange={onToggleBackup}
					className="data-[state=checked]:bg-[#B0261A]"
				/>
				Ja, lag en sikkerhetskopi
			</label>
			<p className="text-xs text-[#B0261A]">
				Hvis bryteren er av, blir filen overskrevet uten sikkerhetskopi.
			</p>
			{backupBeforeOverwrite && backupFileName && (
				<>
					<p className="text-xs font-semibold text-[#B0261A]">
						Sikkerhetskopi:
					</p>
					<button
						type="button"
						onClick={() => {
							// TODO BE: endpoint to download the created backup file
							// isn't exposed yet. The chip is visible so users can see
							// the filename the backup will be stored under; wire the
							// click to the download URL once BE adds it.
							toast.info(
								"Nedlasting av sikkerhetskopi er ikke klar enda.",
							);
						}}
						className="inline-flex items-center gap-2 rounded-md border border-[#1C6D2C] bg-white px-3 py-1.5 text-xs text-[#1C6D2C] hover:bg-[#DCF7E0]">
						<Download className="h-3.5 w-3.5" />
						{backupFileName}
					</button>
				</>
			)}
		</div>
	);
}

function OppsummeringCard({
	rowCount,
	productsFound,
	productsMissing,
}: {
	rowCount?: number;
	productsFound?: number;
	productsMissing?: number;
}) {
	const missingCount = productsMissing ?? 0;
	return (
		<div className="space-y-3 rounded-md border border-[#C6E7CD] bg-[#EFF9F1] px-4 py-3">
			<h5 className="text-sm font-semibold text-[#0F1912]">
				Oppsummering av opplastning
			</h5>
			<dl className="grid max-w-sm grid-cols-[1fr_auto] gap-y-1 text-sm text-[#0F1912]">
				<dt>Antall i fil</dt>
				<dd className="font-semibold">{rowCount ?? "—"}</dd>
				<dt>Antall produkter ikke funnet</dt>
				<dd className="font-semibold">{missingCount}</dd>
				<dt>Antall produkter lagt inn i katalog</dt>
				<dd className="font-semibold">{productsFound ?? "—"}</dd>
			</dl>
			{missingCount > 0 && (
				<Button
					variant="outlineGreen"
					size="sm"
					className="gap-2"
					onClick={() => {
						// TODO BE: no endpoint yet for streaming the missing-products
						// list. Wire this up when BE adds it (expected shape: GET
						// returning CSV/XLSX of rows that didn't resolve).
						toast.info("Nedlasting av manglende produkter er ikke klar enda.");
					}}>
					<Download className="h-4 w-4" />
					Last ned liste over manglende produkter
				</Button>
			)}
		</div>
	);
}
