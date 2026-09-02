"use client";

import { Fragment, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal, ModalHeader, ModalTitle } from "@/components/ui/modal";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
	useActiveBudgetForUser,
	useApproverCandidates,
	useCreateOrUpdateBudget,
} from "@/hooks/useBudget";
import { sendBudgetCreatedEmail } from "@/lib/sendBudgetCreatedEmail";
import { cn } from "@/lib/utils";
import { ApproverCandidate } from "@/types/budget.types";
import { User } from "@/types/user.types";
import { format } from "date-fns";
import {
	ArrowLeft,
	ArrowRight,
	CalendarIcon,
	Check,
	Search,
	X,
} from "lucide-react";
import { toast } from "react-toastify";

type WizardStep = "period" | "approvers" | "confirm" | "success";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: User | null;
}

const STEPS: { key: Exclude<WizardStep, "success">; label: string }[] = [
	{ key: "period", label: "Periode og beløp" },
	{ key: "approvers", label: "Godkjenning" },
	{ key: "confirm", label: "Bekreftelse" },
];

const formatDateNo = (iso: string) => {
	if (!iso) return "";
	const [y, m, d] = iso.split("-");
	return `${d}.${m}.${y}`;
};

const formatAmount = (n: number) =>
	new Intl.NumberFormat("nb-NO").format(Math.round(n));

export function SetBudgetModal({ open, onOpenChange, user }: Props) {
	const [step, setStep] = useState<WizardStep>("period");
	const [validFrom, setValidFrom] = useState("");
	const [validTo, setValidTo] = useState("");
	const [annualAmountInput, setAnnualAmountInput] = useState("");
	const [approvers, setApprovers] = useState<ApproverCandidate[]>([]);
	const [approverSearch, setApproverSearch] = useState("");
	const [sendConfirmationEmail, setSendConfirmationEmail] = useState(true);

	const { data: existingBudget } = useActiveBudgetForUser(user?.userId);
	const { data: candidates = [], isFetching: isFetchingCandidates } =
		useApproverCandidates(approverSearch);
	const { mutateAsync: saveBudget, isPending: isSaving } =
		useCreateOrUpdateBudget();

	const isEdit = !!existingBudget;
	const displayName = user
		? `${user.firstName} ${user.lastName}`.trim()
		: "";

	// Prefill from existing budget when the modal opens (or the user changes).
	useEffect(() => {
		if (!open) return;
		if (existingBudget) {
			setValidFrom(existingBudget.validFrom);
			setValidTo(existingBudget.validTo);
			setAnnualAmountInput(String(existingBudget.annualAmount));
		} else {
			setValidFrom("");
			setValidTo("");
			setAnnualAmountInput("");
		}
		setApprovers([]);
		setApproverSearch("");
		setSendConfirmationEmail(true);
		setStep("period");
	}, [open, existingBudget, user?.userId]);

	const annualAmountNum = useMemo(() => {
		const parsed = Number(annualAmountInput.replace(/\s/g, "").replace(",", "."));
		return Number.isFinite(parsed) ? parsed : NaN;
	}, [annualAmountInput]);

	const periodValid =
		!!validFrom &&
		!!validTo &&
		new Date(validTo) > new Date(validFrom) &&
		annualAmountNum > 0;

	const canGoToConfirm = approvers.length > 0;

	const handleClose = () => onOpenChange(false);

	const handleSubmit = async () => {
		if (!user || !periodValid || approvers.length === 0) return;
		try {
			await saveBudget({
				budgetUserId: user.userId,
				annualAmount: annualAmountNum,
				validFrom,
				validTo,
				autoRenew: false,
				status: "active",
				approvers: approvers.map((a) => a.userId),
			});
			if (sendConfirmationEmail && user.email) {
				try {
					await sendBudgetCreatedEmail({
						toEmail: user.email,
						recipientName: displayName,
						annualAmount: annualAmountNum,
						validFrom,
						validTo,
						approverNames: approvers.map((a) =>
							`${a.firstName} ${a.lastName}`.trim(),
						),
					});
				} catch (err) {
					console.error("Budget email failed", err);
					toast.warn(
						`Budsjett lagret, men bekreftelses­e-post til ${user.email} feilet.`,
					);
				}
			}
			setStep("success");
		} catch (err) {
			console.error("Budget save failed", err);
			toast.error("Kunne ikke lagre budsjett. Prøv igjen.");
		}
	};

	const removeApprover = (id: number) =>
		setApprovers((prev) => prev.filter((a) => a.userId !== id));

	const addApprover = (candidate: ApproverCandidate) => {
		if (approvers.some((a) => a.userId === candidate.userId)) return;
		setApprovers((prev) => [...prev, candidate]);
		setApproverSearch("");
	};

	const filteredCandidates = candidates.filter(
		(c) =>
			c.userId !== user?.userId &&
			!approvers.some((a) => a.userId === c.userId),
	);

	if (!user) return null;

	return (
		<Modal
			open={open}
			onOpenChange={onOpenChange}
			className="max-w-2xl">
			{step !== "success" ? (
				<>
					<div className="space-y-4">
						<ModalHeader className="space-y-4">
							<ModalTitle className="text-base font-semibold">
								{isEdit ? "Rediger budsjett" : "Opprett budsjett"}
							</ModalTitle>
							<p className="text-sm text-gray-900">
								Årsbudsjett per bruker. Beløpet opprettes likt for alle
								valgt(e) brukere.
							</p>
						</ModalHeader>

						<StepHeader step={step} />
					</div>

					{step === "period" && (
						<PeriodStep
							displayName={displayName}
							validFrom={validFrom}
							validTo={validTo}
							onValidFromChange={setValidFrom}
							onValidToChange={setValidTo}
							annualAmountInput={annualAmountInput}
							onAnnualAmountChange={setAnnualAmountInput}
						/>
					)}

					{step === "approvers" && (
						<ApproversStep
							approvers={approvers}
							onRemoveApprover={removeApprover}
							onAddApprover={addApprover}
							searchValue={approverSearch}
							onSearchChange={setApproverSearch}
							candidates={filteredCandidates}
							isFetching={isFetchingCandidates}
						/>
					)}

					{step === "confirm" && (
						<ConfirmStep
							displayName={displayName}
							annualAmount={annualAmountNum}
							validFrom={validFrom}
							validTo={validTo}
							approvers={approvers}
							sendConfirmationEmail={sendConfirmationEmail}
							onSendConfirmationEmailChange={setSendConfirmationEmail}
						/>
					)}

					<div className="flex items-center justify-start gap-3 border-t border-[#E5E7E5] pt-4">
						{step === "period" ? (
							<Button
								variant="outlineGreen"
								size="sm"
								onClick={handleClose}
								disabled={isSaving}>
								<X className="h-4 w-4" />
								Avbryt
							</Button>
						) : (
							<Button
								variant="outline"
								size="sm"
								onClick={() =>
									setStep(step === "confirm" ? "approvers" : "period")
								}
								disabled={isSaving}>
								<ArrowLeft className="h-4 w-4" />
								Tilbake
							</Button>
						)}

						{step === "period" && (
							<Button
								size="sm"
								onClick={() => setStep("approvers")}
								disabled={!periodValid}>
								<ArrowRight className="h-4 w-4" />
								Neste: Godkjenning
							</Button>
						)}
						{step === "approvers" && (
							<Button
								size="sm"
								onClick={() => setStep("confirm")}
								disabled={!canGoToConfirm}>
								<ArrowRight className="h-4 w-4" />
								Neste: Bekreftelse
							</Button>
						)}
						{step === "confirm" && (
							<Button
								size="sm"
								onClick={handleSubmit}
								disabled={isSaving || !periodValid || approvers.length === 0}>
								<Check className="h-4 w-4" />
								{isEdit ? "Oppdater budsjett" : "Opprett budsjett"}
							</Button>
						)}
					</div>
				</>
			) : (
				<SuccessStep
					displayName={displayName}
					email={user.email}
					sentEmail={sendConfirmationEmail}
					onClose={handleClose}
				/>
			)}
		</Modal>
	);
}

function StepHeader({ step }: { step: WizardStep }) {
	const activeIndex = STEPS.findIndex((s) => s.key === step);
	return (
		<div className="flex w-full items-center gap-4 border-b border-[#E5E7E5] px-4 pt-4 pb-4">
			{STEPS.map((s, idx) => {
				const isActive = idx === activeIndex;
				const isDone = idx < activeIndex;
				return (
					<Fragment key={s.key}>
						<span
							className={cn(
								"whitespace-nowrap",
								isActive && "text-lg font-black text-[#009640]",
								isDone && "text-base font-[500] text-[#009640]",
								!isActive &&
									!isDone &&
									"text-base font-[500] text-[#5A615D]",
							)}>
							{isDone && <Check className="mr-1 inline h-4 w-4" />}
							{s.label}
						</span>
						{idx < STEPS.length - 1 && (
							<div className="h-px flex-1 bg-[#E5E7E5]" />
						)}
					</Fragment>
				);
			})}
		</div>
	);
}

function PeriodStep({
	displayName,
	validFrom,
	validTo,
	onValidFromChange,
	onValidToChange,
	annualAmountInput,
	onAnnualAmountChange,
}: {
	displayName: string;
	validFrom: string;
	validTo: string;
	onValidFromChange: (v: string) => void;
	onValidToChange: (v: string) => void;
	annualAmountInput: string;
	onAnnualAmountChange: (v: string) => void;
}) {
	return (
		<div className="space-y-6 py-4">
			<div>
				<Label className="mb-2 block text-sm font-semibold">
					Budsjettet gjelder:
				</Label>
				<div className="rounded-md border border-[#C1C4C2] px-3 py-2">
					<span className="inline-flex items-center gap-2 rounded-md bg-[#F0FCF2] px-2 py-1 text-sm text-[#0F1912]">
						{displayName}
					</span>
				</div>
			</div>

			<div>
				<Label className="mb-4 block text-sm font-semibold">
					Sett årlig budsjettperiode:
				</Label>
				<div className="grid grid-cols-2 gap-4">
					<DateField
						label="Fra dato *"
						value={validFrom}
						onChange={onValidFromChange}
					/>
					<DateField
						label="Til dato *"
						value={validTo}
						onChange={onValidToChange}
					/>
				</div>
			</div>

			<div>
				<Label className="mb-2 block text-sm font-semibold">
					Velg totalbudsjett:
				</Label>
				<div className="grid grid-cols-2 gap-4">
					<Input
						type="number"
						min={0}
						step="1"
						inputMode="numeric"
						placeholder="50 000"
						value={annualAmountInput}
						onChange={(e) => onAnnualAmountChange(e.target.value)}
						className="bg-white"
					/>
				</div>
			</div>
		</div>
	);
}

function DateField({
	label,
	value,
	onChange,
}: {
	label: string;
	value: string;
	onChange: (v: string) => void;
}) {
	const [open, setOpen] = useState(false);
	return (
		<div>
			<Label className="mb-1 block text-xs font-[500] text-gray-900">
				{label}
			</Label>
			<Popover
				open={open}
				onOpenChange={setOpen}
				modal>
				<PopoverTrigger asChild>
					<Button
						type="button"
						variant="outline"
						className={cn(
							"w-full justify-start bg-white text-left font-normal",
							!value && "text-[#8A8F8C]",
						)}>
						<CalendarIcon className="h-4 w-4" />
						{value ? formatDateNo(value) : "Velg dato"}
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className="pointer-events-auto w-auto p-0"
					align="start">
					<Calendar
						mode="single"
						selected={value ? new Date(value) : undefined}
						onSelect={(d) => {
							if (d) {
								onChange(format(d, "yyyy-MM-dd"));
								setOpen(false);
							}
						}}
						initialFocus
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}

function ApproversStep({
	approvers,
	onRemoveApprover,
	onAddApprover,
	searchValue,
	onSearchChange,
	candidates,
	isFetching,
}: {
	approvers: ApproverCandidate[];
	onRemoveApprover: (id: number) => void;
	onAddApprover: (c: ApproverCandidate) => void;
	searchValue: string;
	onSearchChange: (v: string) => void;
	candidates: ApproverCandidate[];
	isFetching: boolean;
}) {
	const hasSearch = searchValue.trim().length > 0;
	const showResultsPanel = hasSearch || isFetching;
	const showSkeleton = isFetching && candidates.length === 0;
	return (
		<div className="space-y-4 py-4">
			<div>
				<Label className="mb-1 block text-sm font-semibold">
					Hvem godkjenner:
				</Label>
				<p className="text-sm text-[#5A615D]">
					Sett opp godkjenningsregler valgt(e) bruker(e).
				</p>
			</div>

			<div>
				<Label className="mb-2 block text-sm font-medium">
					Legg til godkjenner(e)
				</Label>
				<div className="grid grid-cols-2 gap-4">
					<div className="relative">
						<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#8A8F8C]" />
						<Input
							type="text"
							placeholder="Søk etter godkjenner..."
							value={searchValue}
							onChange={(e) => onSearchChange(e.target.value)}
							className="pl-9"
						/>
					</div>
				</div>

				{showResultsPanel && (
					<div className="mt-2 grid grid-cols-2 gap-4">
						<div className="max-h-56 min-h-[10rem] overflow-y-auto rounded-md border border-[#C1C4C2]">
							{showSkeleton ? (
								<ul>
									{Array.from({ length: 3 }).map((_, i) => (
										<li
											key={i}
											className="flex flex-col gap-1 px-3 py-2">
											<Skeleton className="h-4 w-40" />
											<Skeleton className="h-3 w-56" />
										</li>
									))}
								</ul>
							) : candidates.length === 0 ? (
								<p className="px-3 py-2 text-sm text-[#8A8F8C]">
									Ingen brukere funnet
								</p>
							) : (
								<ul>
									{candidates.map((c) => (
										<li key={c.userId}>
											<button
												type="button"
												onClick={() => onAddApprover(c)}
												className="flex w-full flex-col items-start px-3 py-2 text-left hover:bg-[#F0FCF2] focus:bg-[#F0FCF2] focus:outline-none">
												<span className="text-sm text-[#0F1912]">
													{c.firstName} {c.lastName}
												</span>
												<span className="text-xs text-[#5A615D]">
													{c.email}
												</span>
											</button>
										</li>
									))}
								</ul>
							)}
						</div>
					</div>
				)}
			</div>

			<div>
				<Label className="mb-2 block text-sm font-medium">
					Lagt til ({approvers.length})
				</Label>
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
					{approvers.map((a) => (
						<div
							key={a.userId}
							className="flex items-center justify-between rounded-md border border-[#C1C4C2] bg-[#F8F9F8] px-3 py-2">
							<div className="flex flex-col">
								<span className="text-sm font-medium">
									{a.firstName} {a.lastName}
								</span>
								<span className="text-xs text-[#5A615D]">{a.email}</span>
								{a.phoneNumber && (
									<span className="text-xs text-[#5A615D]">{a.phoneNumber}</span>
								)}
							</div>
							<button
								type="button"
								onClick={() => onRemoveApprover(a.userId)}
								className="rounded-full p-1 text-[#5A615D] hover:bg-[#E5E7E5]">
								<X className="h-4 w-4" />
							</button>
						</div>
					))}
					{approvers.length === 0 && (
							<p className="text-sm text-[#8A8F8C]">
								Ingen godkjennere lagt til enda.
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

function ConfirmStep({
	displayName,
	annualAmount,
	validFrom,
	validTo,
	approvers,
	sendConfirmationEmail,
	onSendConfirmationEmailChange,
}: {
	displayName: string;
	annualAmount: number;
	validFrom: string;
	validTo: string;
	approvers: ApproverCandidate[];
	sendConfirmationEmail: boolean;
	onSendConfirmationEmailChange: (v: boolean) => void;
}) {
	return (
		<div className="space-y-6 py-4">
			<div>
				<p className="mb-2 text-sm font-[600] text-gray-900">Sammendrag</p>
				<div className="overflow-hidden rounded-md border border-[#C1C4C2]">
				<div className="grid grid-cols-4 border-b border-[#C1C4C2] bg-[#F8F9F8] px-4 py-2 text-xs font-semibold text-[#5A615D]">
					<span>Hvem</span>
					<span>Budsjett</span>
					<span>Godkjenning</span>
					<span>Årlig</span>
				</div>
				<div className="grid grid-cols-4 items-start gap-2 px-4 py-3 text-sm">
					<span className="font-medium">{displayName}</span>
					<span>{formatAmount(annualAmount)} kr/år</span>
					<ul className="list-disc space-y-1 pl-4">
						{approvers.map((a) => (
							<li key={a.userId}>
								{a.firstName} {a.lastName}
							</li>
						))}
					</ul>
					<span>
						{formatDateNo(validFrom)} - {formatDateNo(validTo)}
					</span>
				</div>
				</div>
			</div>

			<label className="flex items-center gap-2 text-sm">
				<Checkbox
					checked={sendConfirmationEmail}
					onCheckedChange={(v) => onSendConfirmationEmailChange(!!v)}
				/>
				<span>Send bekreftelsesepost til bruker</span>
			</label>
		</div>
	);
}

function SuccessStep({
	displayName,
	email,
	sentEmail,
	onClose,
}: {
	displayName: string;
	email: string;
	sentEmail: boolean;
	onClose: () => void;
}) {
	return (
		<div className="space-y-6 py-4">
			<ModalHeader>
				<ModalTitle>Budsjett opprettet</ModalTitle>
			</ModalHeader>
			<div className="flex items-start gap-3 rounded-md bg-[#F0FCF2] p-4">
				<Check className="mt-0.5 h-5 w-5 text-[#005522]" />
				<div>
					<p className="text-base font-[600] text-[#005522]">Budsjett og mail</p>
					<p className="text-sm font-[400] text-[#005522]">
						Budsjett opprettet for {displayName}
					</p>
					{sentEmail && email && (
						<p className="text-sm font-[400] text-[#005522]">
							E-post sendt til {email}
						</p>
					)}
				</div>
			</div>
			<div className="flex justify-start pt-2">
				<Button onClick={onClose}>
					<Check className="mr-2 h-4 w-4" />
					Gå til brukeroversikt
				</Button>
			</div>
		</div>
	);
}
