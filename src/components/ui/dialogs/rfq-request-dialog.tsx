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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER } from "@/constants/checkout";
import { useGetWarehouses } from "@/hooks/useGetWarehouse";
import {
	HoseContactMethod,
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

	const [contactMethod, setContactMethod] =
		React.useState<HoseContactMethod | "">("");
	const [contactValue, setContactValue] = React.useState("");
	// Non-Equinor: delivery address. Equinor: user email (same form slot).
	const [deliveryAddress, setDeliveryAddress] = React.useState("");
	const [warehouseNumber, setWarehouseNumber] = React.useState("");
	const [comment, setComment] = React.useState("");
	const [includePressureTest, setIncludePressureTest] = React.useState(false);
	const [urgent, setUrgent] = React.useState(false);
	const [submitting, setSubmitting] = React.useState(false);
	const [caseId, setCaseId] = React.useState<string | null>(null);
	const [infoOpen, setInfoOpen] = React.useState(false);
	const [errors, setErrors] = React.useState<{
		selectedIds?: string;
		deliveryAddress?: string;
		warehouseNumber?: string;
		contactMethod?: string;
		contactValue?: string;
	}>({});

	const { warehouses, isLoading: isLoadingWarehouses } = useGetWarehouses(
		open && !!profile,
		profile?.defaultCompanyNumber,
	);

	// Equinor customers default the pressure-test checkbox to checked and
	// prefill the email field. Re-sync each time the dialog opens.
	React.useEffect(() => {
		if (open) {
			setIncludePressureTest(isEquinor);
			setWarehouseNumber(profile?.defaultWarehouseNumber ?? "");
			setDeliveryAddress(isEquinor ? (profile?.email ?? "") : "");
		}
	}, [open, isEquinor, profile?.defaultWarehouseNumber, profile?.email]);

	React.useEffect(() => {
		if (!open || warehouseNumber || warehouses.length === 0) return;
		const defaultWarehouse = profile?.defaultWarehouseNumber;
		const match = warehouses.find((w) => w.id === defaultWarehouse);
		setWarehouseNumber(match?.id ?? warehouses[0].id);
	}, [open, warehouses, warehouseNumber, profile?.defaultWarehouseNumber]);

	// Prefill contact value when method changes
	React.useEffect(() => {
		if (!profile) return;
		if (contactMethod === "phone") {
			setContactValue(profile.phoneNumber ?? "");
		} else if (contactMethod === "email") {
			setContactValue(profile.email ?? "");
		}
	}, [contactMethod, profile]);

	const selectedWarehouse = warehouses.find((w) => w.id === warehouseNumber);

	const resetForm = () => {
		setContactMethod("");
		setContactValue("");
		setDeliveryAddress("");
		setWarehouseNumber("");
		setComment("");
		setUrgent(false);
		setCaseId(null);
		setSubmitting(false);
		setIncludePressureTest(isEquinor);
		setErrors({});
	};

	const handleOpenChange = (next: boolean) => {
		if (!next) resetForm();
		onOpenChange(next);
	};

	const clearError = (field: keyof typeof errors) => {
		setErrors((prev) => {
			if (!prev[field]) return prev;
			const next = { ...prev };
			delete next[field];
			return next;
		});
	};

	const validateForm = () => {
		const nextErrors: typeof errors = {};

		if (selectedIds.length === 0) {
			nextErrors.selectedIds = "Velg minst én slange.";
		}
		if (!deliveryAddress.trim()) {
			nextErrors.deliveryAddress = isEquinor
				? "Fyll inn e-postadresse."
				: "Fyll inn leveringsadresse.";
		} else if (
			isEquinor &&
			!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deliveryAddress.trim())
		) {
			nextErrors.deliveryAddress = "Skriv inn en gyldig e-postadresse.";
		}
		if (!warehouseNumber) {
			nextErrors.warehouseNumber = "Velg lager.";
		}
		if (!contactMethod) {
			nextErrors.contactMethod = "Velg hvordan vi skal kontakte deg.";
		} else if (!contactValue.trim()) {
			nextErrors.contactValue =
				contactMethod === "phone"
					? "Fyll inn telefonnummer."
					: "Fyll inn e-postadresse.";
		}

		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (!profile) return;
		if (!validateForm()) return;

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
			contactMethod: contactMethod as HoseContactMethod,
			contactValue: contactValue.trim(),
			deliveryAddress: deliveryAddress.trim(),
			deliveryAddressLabel: isEquinor ? "E-post" : "Leveringsadresse",
			warehouseNumber: selectedWarehouse?.id ?? warehouseNumber,
			warehouseName: selectedWarehouse?.name ?? "",
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
			await axiosClient.post("/sendgrid/sendEmail", formData,);
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
								{errors.selectedIds && (
									<p className="mt-2 text-sm text-[#B42318]">
										{errors.selectedIds}
									</p>
								)}
							</div>

							<div className="space-y-1">
								<label className="text-sm font-medium text-[#0F1912]">
									{isEquinor ? "E-post" : "Leveringsadresse"}
								</label>
								<Input
									placeholder={
										isEquinor ? "navn@firma.no" : "Leveringsadresse"
									}
									value={deliveryAddress}
									onChange={(e) => {
										setDeliveryAddress(e.target.value);
										clearError("deliveryAddress");
									}}
									inputMode={isEquinor ? "email" : undefined}
									type={isEquinor ? "email" : "text"}
									aria-invalid={!!errors.deliveryAddress}
									className={cn(
										errors.deliveryAddress &&
											"border-[#B42318] focus-visible:ring-[#B42318]",
									)}
								/>
								{errors.deliveryAddress && (
									<p className="text-sm text-[#B42318]">
										{errors.deliveryAddress}
									</p>
								)}
							</div>

							<div className="space-y-1">
								<label className="text-sm font-medium text-[#0F1912]">
									Lager
								</label>
								<Select
									value={warehouseNumber}
									onValueChange={(value) => {
										setWarehouseNumber(value);
										clearError("warehouseNumber");
									}}
									disabled={isLoadingWarehouses || warehouses.length === 0}>
									<SelectTrigger
										className={cn(
											"w-full border-[#8A8F8C] bg-[#F8F9F8] text-[#0F1912]",
											errors.warehouseNumber && "border-[#B42318]",
										)}>
										<SelectValue
											placeholder={
												isLoadingWarehouses
													? "Laster lagre..."
													: "Velg lager"
											}
										/>
									</SelectTrigger>
									<SelectContent className="max-h-[280px]">
										{warehouses.map((warehouse) => (
											<SelectItem
												key={warehouse.id}
												value={warehouse.id}>
												{warehouse.name} ({warehouse.id})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{errors.warehouseNumber && (
									<p className="text-sm text-[#B42318]">
										{errors.warehouseNumber}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<p className="text-sm font-medium text-[#0F1912]">
									Hvordan vil du at vi kontakter deg?
								</p>
								<RadioGroup
									value={contactMethod}
									onValueChange={(value) => {
										setContactMethod(value as HoseContactMethod);
										clearError("contactMethod");
										clearError("contactValue");
									}}>
									<label className="flex cursor-pointer items-center gap-2 text-sm text-[#0F1912]">
										<RadioGroupItem value="phone" />
										Ring meg
									</label>
									<label className="flex cursor-pointer items-center gap-2 text-sm text-[#0F1912]">
										<RadioGroupItem value="email" />
										Send meg en e-post
									</label>
								</RadioGroup>
								{errors.contactMethod && (
									<p className="text-sm text-[#B42318]">
										{errors.contactMethod}
									</p>
								)}
							</div>

							{contactMethod === "phone" && (
								<div className="space-y-1">
									<label className="text-sm font-medium text-[#0F1912]">
										Telefonnummer
									</label>
									<Input
										placeholder="+47 000 00 000 (forhåndsutfylt, redigerbart)"
										value={contactValue}
										onChange={(e) => {
											setContactValue(e.target.value);
											clearError("contactValue");
										}}
										inputMode="tel"
										aria-invalid={!!errors.contactValue}
										className={cn(
											errors.contactValue &&
												"border-[#B42318] focus-visible:ring-[#B42318]",
										)}
									/>
									{errors.contactValue && (
										<p className="text-sm text-[#B42318]">
											{errors.contactValue}
										</p>
									)}
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
										onChange={(e) => {
											setContactValue(e.target.value);
											clearError("contactValue");
										}}
										inputMode="email"
										aria-invalid={!!errors.contactValue}
										className={cn(
											errors.contactValue &&
												"border-[#B42318] focus-visible:ring-[#B42318]",
										)}
									/>
									{errors.contactValue && (
										<p className="text-sm text-[#B42318]">
											{errors.contactValue}
										</p>
									)}
								</div>
							)}
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
				isEquinor={isEquinor}
			/>
		</Dialog>
	);
}

function RfqInfoModal({
	open,
	onOpenChange,
	isEquinor,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	isEquinor: boolean;
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
							{isEquinor
								? "Legg inn e-postadresse og kontaktinformasjon: navn, e-post og telefonnummer."
								: "Legg inn leveringsadresse og kontaktinformasjon: navn, e-post og telefonnummer."}
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
