"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { MultiSelectWithTags } from "@/components/ui/multi-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { RadioSelect } from "@/components/ui/radio-select";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { CheckCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface AddUserModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function AddUserModal({ open, onOpenChange }: AddUserModalProps) {
	const t = useTranslations("AddUserModal");
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
				<ModalTitle className="text-xl font-semibold">{t("title")}</ModalTitle>
			</ModalHeader>

			<form
				onSubmit={handleSubmit}
				className="space-y-6 px-6 pb-6">
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">{t("contactInfo")}</h3>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="fornavn">{t("firstName")}</Label>
							<Input
								id="fornavn"
								placeholder={t("firstName")}
								value={formData.fornavn}
								onChange={(e) =>
									setFormData({ ...formData, fornavn: e.target.value })
								}
								className="border-[#C1C4C2]"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="etternavn">{t("lastName")}</Label>
							<Input
								id="etternavn"
								placeholder={t("lastName")}
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
							<Label htmlFor="email">{t("email")}</Label>
							<Input
								id="email"
								type="email"
								placeholder={t("emailPlaceholder")}
								value={formData.email}
								onChange={(e) =>
									setFormData({ ...formData, email: e.target.value })
								}
								className="border-[#C1C4C2]"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="tittel">{t("title")}</Label>
							<Input
								id="tittel"
								placeholder={t("titlePlaceholder")}
								value={formData.tittel}
								onChange={(e) =>
									setFormData({ ...formData, tittel: e.target.value })
								}
								className="border-[#C1C4C2]"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="telefonnummer">{t("phone")}</Label>
						<Input
							id="telefonnummer"
							placeholder={t("phonePlaceholder")}
							value={formData.telefonnummer}
							onChange={(e) =>
								setFormData({ ...formData, telefonnummer: e.target.value })
							}
							className="max-w-[calc(50%-8px)] border-[#C1C4C2]"
						/>
					</div>
				</div>

				<div className="space-y-4 border-t border-[#E8EAE9] pt-4">
					<h3 className="text-lg font-semibold">{t("permissions")}</h3>

					{formData.role === "superbruker" && (
						<div className="rounded-lg bg-[#E8F5E9] p-4">
							<div className="mb-3 flex items-start justify-between">
								<div className="flex items-start gap-2">
									<CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#009640]" />
									<div>
										<h4 className="font-semibold text-[#0F1912]">
											{t("superuserInfoTitle")}
										</h4>
										<p className="mt-1 text-sm text-[#5A615D]">
											{t("superuserInfoDesc")}
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
								<div className="font-medium text-[#0F1912]">
									{t("customerAccess")}:
								</div>
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
									{t("customerCatalog")}:
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
								<div className="font-medium text-[#0F1912]">
									{t("tessCompany")}:
								</div>
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
									<Label htmlFor="kundetilgang">{t("customerAccess")}</Label>
									<MultiSelectWithTags
										options={customerOptions}
										selected={formData.kundetilgang}
										onChange={(selected) =>
											setFormData({ ...formData, kundetilgang: selected })
										}
										placeholder={t("selectCustomers")}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="kundekatalog">{t("customerCatalog")}</Label>
									<MultiSelectWithTags
										options={catalogOptions}
										selected={formData.kundekatalog}
										onChange={(selected) =>
											setFormData({ ...formData, kundekatalog: selected })
										}
										placeholder={t("selectCatalog")}
									/>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="standardTessLager">
										{t("defaultWarehouse")}
									</Label>
									<Select
										value={formData.standardTessLager}
										onValueChange={(value) =>
											setFormData({ ...formData, standardTessLager: value })
										}>
										<SelectTrigger className="border-[#C1C4C2]">
											<SelectValue placeholder={t("selectWarehouse")} />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="mo">Mo i rana</SelectItem>
											<SelectItem value="oslo">Oslo</SelectItem>
											<SelectItem value="bergen">Bergen</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="tessFirma">{t("tessCompany")}</Label>
									<RadioSelect
										options={tessFirmaOptions}
										value={formData.tessFirma}
										onChange={(value) =>
											setFormData({ ...formData, tessFirma: value })
										}
										placeholder={t("selectCompany")}
										searchable={false}
									/>
								</div>
							</div>
						</>
					)}
				</div>

				<div className="space-y-4 border-t border-[#E8EAE9] pt-4">
					<h3 className="text-lg font-semibold">{t("userRights")}</h3>

					<div className="space-y-2">
						<Label>{t("role")}</Label>
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
										{t("superuser")}
									</Label>
									<p className="text-sm text-[#5A615D]">{t("superuserDesc")}</p>
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
										{t("employee")}
									</Label>
									<p className="text-sm text-[#5A615D]">{t("employeeDesc")}</p>
								</div>
							</div>
						</RadioGroup>
					</div>
				</div>

				<div className="flex justify-between gap-4 border-t border-[#E8EAE9] pt-6">
					<Button
						type="submit"
						className="flex-1 bg-[#009640] hover:bg-[#008036]">
						+ {t("addUser")}
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={handleClose}
						className="flex-1 border-[#C1C4C2]">
						{t("close")}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
