"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER } from "@/constants/checkout";
import {
	THM_TEAM_EMAIL_RECIPIENT,
	buildHoseRfqEmailHtml,
	buildHoseRfqEmailSubject,
	generateCaseId,
} from "@/lib/email-templates";
import { cn } from "@/lib/utils";
import axiosClient from "@/services/axiosClient";
import { ProfileUser } from "@/types/user.types";

export interface RFQRequestDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	profile: ProfileUser | null;
	selectedIds: string[];
	onRemoveId?: (id: string) => void;
	className?: string;
}

export function RFQRequestDialog({
	open,
	onOpenChange,
	profile,
	selectedIds,
	onRemoveId,
	className,
}: RFQRequestDialogProps) {
	const isEquinor =
		profile?.defaultCustomerNumber ===
		SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER;

	const [deliveryAddress, setDeliveryAddress] = React.useState("");
	const [comment, setComment] = React.useState("");
	const [includePressureTest, setIncludePressureTest] = React.useState(false);
	const [urgent, setUrgent] = React.useState(false);
	const [submitting, setSubmitting] = React.useState(false);
	const [caseId, setCaseId] = React.useState<string | null>(null);
	const [infoOpen, setInfoOpen] = React.useState(false);

	// Equinor customers default the pressure-test checkbox to checked.
	// Re-sync each time the dialog opens so the rule is enforced fresh.
	React.useEffect(() => {
		if (open) {
			setIncludePressureTest(isEquinor);
		}
	}, [open, isEquinor]);

	const resetForm = () => {
		setDeliveryAddress("");
		setComment("");
		setUrgent(false);
		setCaseId(null);
		setSubmitting(false);
		setIncludePressureTest(isEquinor);
	};

	const handleOpenChange = (next: boolean) => {
		if (!next) resetForm();
		onOpenChange(next);
	};

	const handleSubmit = async () => {
		if (!profile || selectedIds.length === 0) return;

		setSubmitting(true);
		const generatedCaseId = generateCaseId("RFQ");
		const customerNumber = profile.defaultCustomerNumber ?? "—";
		const companyName = profile.defaultCompanyName ?? "—";
		const userName =
			`${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() ||
			"Ukjent bruker";

		const htmlBody = buildHoseRfqEmailHtml({
			caseId: generatedCaseId,
			userName,
			userEmail: profile.email ?? "—",
			userPhone: profile.phoneNumber,
			customerNumber,
			companyName,
			deliveryAddress: deliveryAddress.trim(),
			comment: comment.trim(),
			includePressureTest,
			urgent,
			hexagonIds: selectedIds,
		});

		const formData = new FormData();
		formData.append("toEmail", THM_TEAM_EMAIL_RECIPIENT);
		formData.append(
			"subject",
			buildHoseRfqEmailSubject(urgent, customerNumber),
		);
		formData.append("htmlBody", htmlBody);
		formData.append("category", "HoseRFQ");

		try {
			await axiosClient.post("/sendgrid/sendEmail", formData);
			setCaseId(generatedCaseId);
		} finally {
			setSubmitting(false);
		}
	};

	const canSubmit = selectedIds.length > 0;

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}>
			<DialogContent
				className={cn(
					"max-h-[90vh] max-w-md overflow-y-auto rounded-2xl p-0",
					className,
				)}>
				{caseId ? (
					<ConfirmationView
						caseId={caseId}
						onClose={() => handleOpenChange(false)}
					/>
				) : (
					<>
						<DialogHeader className="px-6 pt-5">
							<DialogTitle className="flex items-center gap-2 text-lg font-semibold text-[#0F1912]">
								Send forespørsel om tilbud (RFQ)
								<button
									type="button"
									aria-label="Mer informasjon"
									onClick={() => setInfoOpen(true)}
									className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-[#005522] text-[11px] font-semibold leading-none text-white hover:bg-[#003D1A]">
									i
								</button>
							</DialogTitle>
							<DialogClose className="text-muted-foreground" />
						</DialogHeader>

						<div className="space-y-4 px-6 pt-2 pb-6">
							<p className="text-sm text-[#5A615D]">
								Vi gjennomgår slangene og sender tilbud med pris.
							</p>

							<div className="rounded-md border border-[#C1C4C2] bg-white p-3">
								<p className="mb-2 text-sm font-medium text-[#0F1912]">
									Valgte slanger
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

							<div className="space-y-1">
								<label className="text-sm font-medium text-[#0F1912]">
									Leveringsadresse
								</label>
								<Input
									placeholder="Leveringsadresse"
									value={deliveryAddress}
									onChange={(e) => setDeliveryAddress(e.target.value)}
								/>
							</div>

							<div className="space-y-1">
								<label className="text-sm font-medium text-[#0F1912]">
									Kommentar
								</label>
								<Textarea
									placeholder="Legg til kommentar"
									rows={3}
									value={comment}
									onChange={(e) => setComment(e.target.value)}
									className="border-[#8A8F8C] bg-[#F8F9F8] text-[#5A615D]"
								/>
							</div>

							<label className="flex cursor-pointer items-start gap-2">
								<Checkbox
									checked={includePressureTest}
									onCheckedChange={(checked) =>
										setIncludePressureTest(checked === true)
									}
									className="mt-0.5"
								/>
								<span className="text-sm text-[#0F1912]">
									Inkluder trykktest og sertifikat i tilbudet
								</span>
							</label>

							<label className="flex cursor-pointer items-start gap-2">
								<Checkbox
									checked={urgent}
									onCheckedChange={(checked) => setUrgent(checked === true)}
									className="mt-0.5"
								/>
								<span className="text-sm text-[#0F1912]">
									<span className="font-medium">Marker som hastesak</span>
									<span className="block text-xs text-[#5A615D]">
										Bruk ved akutt behov.
									</span>
								</span>
							</label>

							<Button
								className="w-full"
								variant="greenSolid"
								disabled={!canSubmit || submitting}
								onClick={handleSubmit}>
								{submitting ? "Sender..." : "Send forespørsel"}
							</Button>
						</div>
					</>
				)}
			</DialogContent>
			<RfqInfoModal
				open={infoOpen}
				onOpenChange={setInfoOpen}
			/>
		</Dialog>
	);
}

function RfqInfoModal({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto rounded-2xl p-0">
				<DialogHeader className="border-b border-[#E8EAE9] px-6 py-4">
					<DialogTitle className="text-lg font-semibold text-[#0F1912]">
						Legg til forespørsel (RFQ)
					</DialogTitle>
					<DialogClose className="text-muted-foreground" />
				</DialogHeader>
				<div className="space-y-4 px-6 py-5 text-sm leading-relaxed text-[#0F1912]">
					<p>
						Du har valgt slanger som skal forespørres om tilbud. Denne
						handlingen vil sende en forespørsel om tilbud (RFQ) til TESS, og du
						vil motta et pristilbud i PDF-format.
					</p>
					<ul className="list-disc space-y-2 pl-5">
						<li>
							Vennligst spesifiser hvilken type forespørsel det gjelder — for
							eksempel om slangene skal trykktestes med tilhørende sertifikat.
						</li>
						<li>
							Legg inn leveringsadresse og kontaktinformasjon: navn, e-post og
							telefonnummer.
						</li>
					</ul>
					<div className="space-y-1">
						<p>Takk for din henvendelse!</p>
						<p>
							Om du trenger mer informasjon, ta gjerne kontakt med{" "}
							<a
								href={`mailto:${THM_TEAM_EMAIL_RECIPIENT}`}
								className="font-medium text-[#005522] hover:underline">
								Hose Management-team
							</a>
							.
						</p>
					</div>
				</div>
				<div className="border-t border-[#E8EAE9] px-6 py-4">
					<Button
						variant="greenSolid"
						onClick={() => onOpenChange(false)}>
						Ok, lukk
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function ConfirmationView({
	caseId,
	onClose,
}: {
	caseId: string;
	onClose: () => void;
}) {
	return (
		<>
			<DialogHeader className="px-6 pt-5">
				<DialogTitle className="text-lg font-semibold text-[#0F1912]">
					Send forespørsel om tilbud (RFQ)
				</DialogTitle>
				<DialogClose className="text-muted-foreground" />
			</DialogHeader>

			<div className="space-y-4 px-6 pb-6">
				<div className="space-y-1 text-sm text-[#0F1912]">
					<p>Takk for forespørselen.</p>
					<p>Vi gjennomgår slangene og sender tilbud med pris snarest.</p>
				</div>
				{/* <p className="text-sm text-[#5A615D]">
					Saksnummer:{" "}
					<span className="font-medium text-[#0F1912]">{caseId}</span>
				</p> */}
				<Button
					className="w-full"
					variant="greenSolid"
					onClick={onClose}>
					Lukk
				</Button>
			</div>
		</>
	);
}
