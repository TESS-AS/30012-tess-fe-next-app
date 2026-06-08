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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
	HoseContactMethod,
	THM_TEAM_EMAIL_RECIPIENT,
	buildHoseContactEmailHtml,
	buildHoseContactEmailSubject,
	generateCaseId,
} from "@/lib/email-templates";
import { cn } from "@/lib/utils";
import axiosClient from "@/services/axiosClient";
import { ProfileUser } from "@/types/user.types";
import Image from "next/image";

export interface EquinorSupportDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	profile: ProfileUser | null;
	selectedIds: string[];
	onRemoveId?: (id: string) => void;
	className?: string;
}

const SUPPORT_PHONE_FALLBACK = "02018";

export function EquinorSupportDialog({
	open,
	onOpenChange,
	profile,
	selectedIds,
	onRemoveId,
	className,
}: EquinorSupportDialogProps) {
	const [contactMethod, setContactMethod] =
		React.useState<HoseContactMethod | "">("");
	const [contactValue, setContactValue] = React.useState("");
	const [message, setMessage] = React.useState("");
	const [urgent, setUrgent] = React.useState(false);
	const [submitting, setSubmitting] = React.useState(false);
	const [caseId, setCaseId] = React.useState<string | null>(null);

	// Prefill contact value when method changes
	React.useEffect(() => {
		if (!profile) return;
		if (contactMethod === "phone") {
			setContactValue(profile.phoneNumber ?? "");
		} else if (contactMethod === "email") {
			setContactValue(profile.email ?? "");
		}
	}, [contactMethod, profile]);

	const resetForm = () => {
		setContactMethod("");
		setContactValue("");
		setMessage("");
		setUrgent(false);
		setCaseId(null);
		setSubmitting(false);
	};

	const handleOpenChange = (next: boolean) => {
		if (!next) resetForm();
		onOpenChange(next);
	};

	const handleSubmit = async () => {
		if (!contactMethod || !contactValue.trim() || !profile) return;

		setSubmitting(true);
		const generatedCaseId = generateCaseId("KTAK");
		const customerNumber = profile.defaultCustomerNumber ?? "—";
		const companyName = profile.defaultCompanyName ?? "—";
		const userName =
			`${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() ||
			"Ukjent bruker";

		const htmlBody = buildHoseContactEmailHtml({
			caseId: generatedCaseId,
			userName,
			userEmail: profile.email ?? "—",
			userPhone: profile.phoneNumber,
			customerNumber,
			companyName,
			contactMethod,
			contactValue: contactValue.trim(),
			message: message.trim(),
			urgent,
			hexagonIds: selectedIds,
		});

		const formData = new FormData();
		formData.append("toEmail", THM_TEAM_EMAIL_RECIPIENT);
		formData.append(
			"subject",
			buildHoseContactEmailSubject(urgent, customerNumber),
		);
		formData.append("htmlBody", htmlBody);
		formData.append("category", "HoseContact");

		try {
			await axiosClient.post("/sendgrid/sendEmail", formData);
			setCaseId(generatedCaseId);
		} finally {
			setSubmitting(false);
		}
	};

	const canSubmit =
		!!contactMethod && !!contactValue.trim() && selectedIds.length > 0;

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
						supportPhone={SUPPORT_PHONE_FALLBACK}
						onClose={() => handleOpenChange(false)}
					/>
				) : (
					<>
						<DialogHeader className="px-6 pt-5">
							<DialogTitle className="text-lg font-semibold text-[#0F1912]">
								Snakk med en fagperson
							</DialogTitle>
							<DialogClose className="text-muted-foreground" />
						</DialogHeader>

						<div className="space-y-4 px-6 pt-2 pb-6">
							<p className="text-sm text-[#5A615D]">
								Vi kontakter deg om slangene du har valgt.
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

							<div className="space-y-2">
								<p className="text-sm font-medium text-[#0F1912]">
									Hvordan vil du at vi kontakter deg?
								</p>
								<RadioGroup
									value={contactMethod}
									onValueChange={(value) =>
										setContactMethod(value as HoseContactMethod)
									}>
									<label className="flex cursor-pointer items-center gap-2 text-sm text-[#0F1912]">
										<RadioGroupItem value="phone" />
										Ring meg
									</label>
									<label className="flex cursor-pointer items-center gap-2 text-sm text-[#0F1912]">
										<RadioGroupItem value="email" />
										Send meg en e-post
									</label>
								</RadioGroup>
							</div>

							{contactMethod === "phone" && (
								<div className="space-y-1">
									<label className="text-sm font-medium text-[#0F1912]">
										Telefonnummer
									</label>
									<Input
										placeholder="+47 000 00 000 (forhåndsutfylt, redigerbart)"
										value={contactValue}
										onChange={(e) => setContactValue(e.target.value)}
										inputMode="tel"
									/>
								</div>
							)}

							{contactMethod === "email" && (
								<div className="space-y-1">
									<label className="text-sm font-medium text-[#0F1912]">
										E-postadresse
									</label>
									<Input
										placeholder="navn@firma.no (forhåndsutfylt, redigerbart)"
										value={contactValue}
										onChange={(e) => setContactValue(e.target.value)}
										inputMode="email"
									/>
								</div>
							)}

							{contactMethod && (
								<div className="space-y-1">
									<label className="text-sm font-medium text-[#0F1912]">
										Kort melding (valgfritt)
									</label>
									<Textarea
										placeholder="Noe vi bør vite?"
										rows={3}
										value={message}
										onChange={(e) => setMessage(e.target.value)}
										className="border-[#8A8F8C] bg-[#F8F9F8] text-[#5A615D]"
									/>
									<p className="text-xs text-[#5A615D]">
										F.eks. manglende data, gjøre slangen kjøpbar
									</p>
								</div>
							)}

							{contactMethod && (
								<label className="flex cursor-pointer items-start gap-2">
									<Checkbox
										checked={urgent}
										onCheckedChange={(checked) => setUrgent(checked === true)}
										className="mt-0.5"
									/>
									<span className="text-sm text-[#0F1912]">
										<span className="font-medium">Marker som hastesak</span>
										<span className="block text-xs text-[#5A615D]">
											Vi {contactMethod === "phone" ? "ringer" : "kontakter"}{" "}
											deg så raskt som mulig. Bruk ved akutt behov.
										</span>
									</span>
								</label>
							)}

							<Button
								className="w-full"
								variant="greenSolid"
								disabled={!canSubmit || submitting}
								onClick={handleSubmit}>
								{submitting ? "Sender..." : "Kontakt meg"}
							</Button>
						</div>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}

function ConfirmationView({
	caseId,
	supportPhone,
	onClose,
}: {
	caseId: string;
	supportPhone: string;
	onClose: () => void;
}) {
	return (
		<>
			<DialogHeader className="px-6 pt-5">
				<DialogTitle className="text-lg font-semibold text-[#0F1912]">
					Snakk med en fagperson
				</DialogTitle>
				<DialogClose className="text-muted-foreground" />
			</DialogHeader>

			<div className="space-y-4 px-6 pb-6">
				<div className="relative h-[200px] w-full overflow-hidden rounded-md">
					<Image
						src="/images/support.png"
						alt=""
						fill
						sizes="(max-width: 448px) 100vw, 448px"
						className="object-cover grayscale"
						loading="eager"
					/>
				</div>
				<div className="space-y-1 text-sm text-[#0F1912]">
					<p>Takk for henvendelsen.</p>
					<p>Vi kontakter deg snarest.</p>
				</div>
				<div className="space-y-1 text-sm text-[#5A615D]">
					<p>
						Saksnummer:{" "}
						<span className="font-medium text-[#0F1912]">{caseId}</span>
					</p>
					<p>
						Spørsmål i mellomtiden? Ring{" "}
						<a
							href={`tel:${supportPhone}`}
							className="font-medium text-[#005522] hover:underline">
							{supportPhone}
						</a>
						.
					</p>
				</div>
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
