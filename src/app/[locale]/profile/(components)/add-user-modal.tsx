"use client";

import { useState } from "react";
import { Modal, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MultiSelectWithTags } from "@/components/ui/multi-select";
import { RadioSelect } from "@/components/ui/radio-select";
import { CheckCircle, X } from "lucide-react";

interface AddUserModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function AddUserModal({ open, onOpenChange }: AddUserModalProps) {
	const [formData, setFormData] = useState({
		fornavn: "",
		etternavn: "",
		email: "",
		tittel: "",
		telefonnummer: "",
		kundetilgang: [] as string[],
		kundekatalog: [] as string[],
		standardTessLager: "",
		tessFirma: "",
		role: "superbruker",
	});

	const customerOptions = [
		{ label: "Kunde 1", value: "kunde1" },
		{ label: "Kunde 2", value: "kunde2" },
		{ label: "Kunde 3", value: "kunde3" },
		{ label: "Kunde 4", value: "kunde4" },
		{ label: "Kunde 5", value: "kunde5" },
		{ label: "Kunde 6", value: "kunde6" },
		{ label: "Equinor", value: "equinor" },
		{ label: "Bilfinger", value: "bilfinger" },
	];

	const catalogOptions = [
		{ label: "Bilfinger nettopriser", value: "netto" },
		{ label: "TESS total sortiment", value: "total" },
		{ label: "Katalog 1", value: "katalog1" },
		{ label: "Katalog 2", value: "katalog2" },
		{ label: "Katalog 3", value: "katalog3" },
	];

	const tessFirmaOptions = [
		{ label: "TESS Vest", value: "vest" },
		{ label: "TESS Sør", value: "sor" },
		{ label: "TESS Nord", value: "nord" },
		{ label: "TESS Øst", value: "ost" },
	];

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// Handle form submission
		console.log("Form data:", formData);
		onOpenChange(false);
	};

	const handleClose = () => {
		onOpenChange(false);
	};

	return (
		<Modal
			open={open}
			onOpenChange={onOpenChange}
			className="max-h-[90vh] w-[670px] overflow-y-auto p-0">
			<ModalHeader className="px-6 py-4">
				<ModalTitle className="text-xl font-semibold">
					Legg til ny bruker
				</ModalTitle>
			</ModalHeader>

			<form
				onSubmit={handleSubmit}
				className="space-y-6 px-6 pb-6">
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">Kontaktinformasjon</h3>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="fornavn">Fornavn</Label>
							<Input
								id="fornavn"
								placeholder="Fornavn"
								value={formData.fornavn}
								onChange={(e) =>
									setFormData({ ...formData, fornavn: e.target.value })
								}
								className="border-[#C1C4C2]"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="etternavn">Etternavn</Label>
							<Input
								id="etternavn"
								placeholder="Etternavn"
								value={formData.etternavn}
								onChange={(e) =>
									setFormData({ ...formData, etternavn: e.target.value })
								}
								className="border-[#C1C4C2]"
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="email">E-post</Label>
							<Input
								id="email"
								type="email"
								placeholder="navn@selskap.no"
								value={formData.email}
								onChange={(e) =>
									setFormData({ ...formData, email: e.target.value })
								}
								className="border-[#C1C4C2]"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="tittel">Tittel</Label>
							<Input
								id="tittel"
								placeholder="Etternavn"
								value={formData.tittel}
								onChange={(e) =>
									setFormData({ ...formData, tittel: e.target.value })
								}
								className="border-[#C1C4C2]"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="telefonnummer">Telefonnummer</Label>
						<Input
							id="telefonnummer"
							placeholder="+47 444 44 444"
							value={formData.telefonnummer}
							onChange={(e) =>
								setFormData({ ...formData, telefonnummer: e.target.value })
							}
							className="max-w-[calc(50%-8px)] border-[#C1C4C2]"
						/>
					</div>
				</div>

				<div className="space-y-4 border-t border-[#E8EAE9] pt-4">
					<h3 className="text-lg font-semibold">Tilganger</h3>

					{formData.role === "superbruker" && (
						<div className="rounded-lg bg-[#E8F5E9] p-4">
							<div className="mb-3 flex items-start justify-between">
								<div className="flex items-start gap-2">
									<CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#009640]" />
									<div>
										<h4 className="font-semibold text-[#0F1912]">
											Brukere du oppretter, overtar dine innstillinger
										</h4>
										<p className="mt-1 text-sm text-[#5A615D]">
											Som superbruker kan du opprette brukere med samme
											kundenummer. Nye brukere overtar automatisk dine
											innstillinger.
										</p>
									</div>
								</div>
								<button
									type="button"
									onClick={() => {
										// Could add logic to dismiss this info box
									}}
									className="shrink-0 text-[#5A615D] hover:text-[#0F1912]">
									<X className="h-5 w-5" />
								</button>
							</div>
						</div>
					)}

					{formData.role === "superbruker" && (
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<div className="font-medium text-[#0F1912]">Kundetilgang:</div>
								<div className="text-[#5A615D]">
									{formData.kundetilgang.length > 0
										? formData.kundetilgang
												.map(
													(id) =>
														customerOptions.find((c) => c.value === id)?.label,
												)
												.join(", ")
										: "Kunde 1, Kunde 2, Kunde 3"}
								</div>
							</div>
							<div>
								<div className="font-medium text-[#0F1912]">
									Standard TESS lager:
								</div>
								<div className="text-[#5A615D]">
									{formData.standardTessLager || "Rana"}
								</div>
							</div>
							<div>
								<div className="font-medium text-[#0F1912]">
									Standard TESS lager:
								</div>
								<div className="text-[#5A615D]">
									{formData.kundekatalog.length > 0
										? formData.kundekatalog
												.map(
													(id) =>
														catalogOptions.find((c) => c.value === id)?.label,
												)
												.join(", ")
										: "Lager 1, Lager 2, Lager 3"}
								</div>
							</div>
							<div>
								<div className="font-medium text-[#0F1912]">TESS firma:</div>
								<div className="text-[#5A615D]">
									{tessFirmaOptions.find((f) => f.value === formData.tessFirma)
										?.label || "TESS Vest"}
								</div>
							</div>
						</div>
					)}
					{formData.role === "admin" && (
						<>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="kundetilgang">Kundetilgang</Label>
									<MultiSelectWithTags
										options={customerOptions}
										selected={formData.kundetilgang}
										onChange={(selected) =>
											setFormData({ ...formData, kundetilgang: selected })
										}
										placeholder="Velg relevante kunder"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="kundekatalog">Kundekatalog</Label>
									<MultiSelectWithTags
										options={catalogOptions}
										selected={formData.kundekatalog}
										onChange={(selected) =>
											setFormData({ ...formData, kundekatalog: selected })
										}
										placeholder="Velg katalog"
									/>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="standardTessLager">Standard TESS lager</Label>
									<Select
										value={formData.standardTessLager}
										onValueChange={(value) =>
											setFormData({ ...formData, standardTessLager: value })
										}>
										<SelectTrigger className="border-[#C1C4C2]">
											<SelectValue placeholder="Velg lager" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="mo">Mo i rana</SelectItem>
											<SelectItem value="oslo">Oslo</SelectItem>
											<SelectItem value="bergen">Bergen</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="tessFirma">TESS Firma</Label>
									<RadioSelect
										options={tessFirmaOptions}
										value={formData.tessFirma}
										onChange={(value) =>
											setFormData({ ...formData, tessFirma: value })
										}
										placeholder="Velg firma"
										searchable={false}
									/>
								</div>
							</div>
						</>
					)}
				</div>

				<div className="space-y-4 border-t border-[#E8EAE9] pt-4">
					<h3 className="text-lg font-semibold">Brukerrettigheter og status</h3>

					<div className="space-y-2">
						<Label>Rolle</Label>
						<RadioGroup
							value={formData.role}
							onValueChange={(value) =>
								setFormData({ ...formData, role: value })
							}
							className="mt-4 grid grid-cols-2 gap-4">
							<div className="flex items-start space-x-3">
								<RadioGroupItem
									value="Superbruker"
									id="superbruker"
									className="mt-1 shrink-0"
								/>
								<div className="space-y-1">
									<Label
										htmlFor="superbruker"
										className="cursor-pointer font-medium">
										Superbruker
									</Label>
									<p className="text-sm text-[#5A615D]">
										Opprette nye brukere med egne innstillinger, godkjenne
										rekvisjoner, sette budsjetter på ansatte, opprette
										dimensjoner
									</p>
								</div>
							</div>
							<div className="flex items-start space-x-3">
								<RadioGroupItem
									value="Ansatt"
									id="ansatt"
									className="mt-1 shrink-0"
								/>
								<div className="space-y-1">
									<Label
										htmlFor="ansatt"
										className="cursor-pointer font-medium">
										Ansatt
									</Label>
									<p className="text-sm text-[#5A615D]">
										Handle produkter (etter fastsatt budsjett), se
										ordrehistorikk, kontakte kundeservice
									</p>
								</div>
							</div>
						</RadioGroup>
					</div>
				</div>

				<div className="flex justify-between gap-4 border-t border-[#E8EAE9] pt-6">
					<Button
						type="submit"
						className="flex-1 bg-[#009640] hover:bg-[#008036]">
						+ Legg til bruker
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={handleClose}
						className="flex-1 border-[#C1C4C2]">
						Lukk
					</Button>
				</div>
			</form>
		</Modal>
	);
}
