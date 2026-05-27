"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useGetCompanies } from "@/hooks/useGetCompanies";
import { useGetProfileData, profileKeys } from "@/hooks/useGetProfileData";
import { useGetWarehouses } from "@/hooks/useGetWarehouse";
import {
	SUPPORT_EMAIL_RECIPIENT,
	buildOnboardingEmailHtml,
	buildOnboardingEmailSubject,
} from "@/lib/email-templates";
import axiosClient from "@/services/axiosClient";
import {
	getOrganizationAddresses,
	patchUserState,
	type OrganizationRecord,
} from "@/services/user.service";
import { useQueryClient } from "@tanstack/react-query";
import {
	Building2,
	Search,
	Loader2,
	ChevronRight,
	CheckCircle2,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface OnboardingModalProps {
	isOpen: boolean;
	onClose?: () => void;
}

const SUPPORT_PHONE = "+47 32 84 40 30";
const SUPPORT_EMAIL = "netthandel@tess.no";

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
	const t = useTranslations("Onboarding");
	const queryClient = useQueryClient();
	const { data: profile } = useGetProfileData();
	const { companies } = useGetCompanies(true);
	const { warehouses, isLoading: isLoadingWarehouses } = useGetWarehouses(
		true,
		undefined,
	);

	const [companyName, setCompanyName] = useState("");
	const [department, setDepartment] = useState("");
	const [orgNumber, setOrgNumber] = useState("");
	const [selectedCompanyNumber, setSelectedCompanyNumber] = useState("");
	const [selectedWarehouseNumber, setSelectedWarehouseNumber] = useState("");
	const [isSearchingOrg, setIsSearchingOrg] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [orgSearchError, setOrgSearchError] = useState<string | null>(null);
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [foundOrganization, setFoundOrganization] =
		useState<OrganizationRecord | null>(null);

	// Initialize form with profile data if available
	useEffect(() => {
		if (profile) {
			if (profile.defaultCompanyName) {
				setCompanyName(profile.defaultCompanyName);
			}
			if (profile.defaultCompanyNumber) {
				setSelectedCompanyNumber(String(profile.defaultCompanyNumber));
			}
			if (profile.defaultWarehouseNumber) {
				setSelectedWarehouseNumber(profile.defaultWarehouseNumber);
			}
		}
	}, [profile]);

	// Filter warehouses based on selected company
	const availableWarehouses = warehouses.filter((w) => {
		if (!selectedCompanyNumber) return true;
		// Note: Warehouse filtering by company might need adjustment based on API response structure
		return true;
	});

	const handleOrgSearch = async () => {
		if (!orgNumber || orgNumber.length !== 9) {
			setOrgSearchError(t("orgNumberError"));
			return;
		}

		setIsSearchingOrg(true);
		setOrgSearchError(null);

		try {
			const organization = await getOrganizationAddresses(orgNumber.trim());

			if (organization && organization.org_name) {
				// Store organization data and pre-fill company name
				setFoundOrganization(organization);
				setCompanyName(organization.org_name);
				setOrgSearchError(null);
			} else {
				setFoundOrganization(null);
				setOrgSearchError(t("orgSearchError"));
			}
		} catch (error) {
			setFoundOrganization(null);
			setOrgSearchError(t("orgSearchError"));
		} finally {
			setIsSearchingOrg(false);
		}
	};

	const handleSubmit = async () => {
		if (!companyName || !selectedWarehouseNumber) {
			return;
		}
		if (!orgNumber || orgNumber.length !== 9) {
			setOrgSearchError(t("orgNumberError"));
			return;
		}

		setIsSubmitting(true);

		try {
			// Get selected warehouse name
			const selectedWarehouse = warehouses.find(
				(w) => String(w.id) === selectedWarehouseNumber,
			);
			const warehouseName = selectedWarehouse?.name || selectedWarehouseNumber;

			// Set userstate to "onboarding" so onboarding notification shows under header
			await patchUserState("onboarding");

			// Send email notification to customer support
			const htmlBody = buildOnboardingEmailHtml({
				userEmail: profile?.email ?? "Ikke tilgjengelig",
				userId: profile?.userId ?? "Ukjent",
				companyName,
				department: department || undefined,
				orgNumber: orgNumber || undefined,
				serviceCenterName: warehouseName,
			});

			const formData = new FormData();
			formData.append("toEmail", SUPPORT_EMAIL_RECIPIENT);
			formData.append("subject", buildOnboardingEmailSubject(companyName));
			formData.append("htmlBody", htmlBody);
			formData.append("category", "Onboarding");

			await axiosClient.post("/sendgrid/sendEmail", formData);

			// Refetch profile so banner appears
			await queryClient.invalidateQueries({
				queryKey: profileKeys.all,
				refetchType: "active",
			});

			// Show success message
			setSubmitSuccess(true);
			setSubmitError(null);

			// Close modal after a short delay
			setTimeout(() => {
				if (onClose) {
					onClose();
				}
			}, 2000);
		} catch (error: any) {
			console.error("Failed to submit onboarding data:", error);
			setSubmitError(
				error?.response?.data?.message ||
					t("submitError") ||
					"Kunne ikke sende inn informasjon. Vennligst prøv igjen.",
			);
			setSubmitSuccess(false);
		} finally {
			setIsSubmitting(false);
		}
	};

	const canSubmit =
		companyName &&
		selectedWarehouseNumber &&
		orgNumber.length === 9 &&
		!isSubmitting;

	return (
		<Dialog
			open={isOpen}
			modal={true}>
			<DialogContent
				className="flex max-h-[90vh] max-w-4xl flex-col overflow-y-auto [&>button]:hidden"
				onInteractOutside={(e) => {
					e.preventDefault();
					e.stopPropagation();
				}}
				onEscapeKeyDown={(e) => {
					e.preventDefault();
					e.stopPropagation();
				}}>
				<DialogHeader className="space-y-4 pb-2">
					<DialogTitle className="mb-0 text-2xl font-medium">
						{t("title")}
					</DialogTitle>
					<DialogDescription className="text-base text-gray-500">
						{t("intro")}
					</DialogDescription>
				</DialogHeader>

				<div className="flex-1 space-y-6">
					{/* Company Section */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">
							{t("companySectionTitle")}
						</h3>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="company">
									{t("companyLabel")} <span className="text-red-500">*</span>
								</Label>
								<Input
									id="company"
									placeholder={t("companyPlaceholder")}
									value={companyName}
									onChange={(e) => setCompanyName(e.target.value)}
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="department">{t("departmentLabel")}</Label>
								<Input
									id="department"
									placeholder={t("departmentPlaceholder")}
									value={department}
									onChange={(e) => setDepartment(e.target.value)}
								/>
							</div>
						</div>
					</div>

					{/* Organization Number Search Section */}
					<div
						className={`mb-0 space-y-4 rounded-lg p-4 ${foundOrganization ? "bg-green-50" : "bg-gray-50"}`}>
						<div className="mb-1 flex items-center gap-2">
							{foundOrganization ? (
								<CheckCircle2 className="h-5 w-5 text-green-600" />
							) : (
								<Building2 className="h-5 w-5 text-gray-900" />
							)}
							<h3 className="text-base font-semibold">
								{t("orgSearchTitle")}
							</h3>
						</div>
						<p className="text-sm text-gray-600">{t("orgSearchHelper")}</p>

						<div className="space-y-2">
							<Label htmlFor="orgNumber">
								{t("orgNumberLabel")}{" "}
								<span className="text-red-500">*</span>
							</Label>
							<div className="relative">
								<Input
									id="orgNumber"
									placeholder={t("orgNumberPlaceholder")}
									value={orgNumber}
									onChange={(e) => {
										setOrgNumber(e.target.value);
										setOrgSearchError(null);
										setFoundOrganization(null);
									}}
									maxLength={9}
									className="mt-1 h-[58px] pr-[70px]"
								/>
								<Button
									type="button"
									onClick={handleOrgSearch}
									disabled={isSearchingOrg || !orgNumber}
									className="absolute top-1/2 right-3 flex h-[34px] w-[66px] -translate-y-1/2 items-center justify-center gap-1 bg-green-600 px-2 py-1 text-white hover:bg-green-700">
									{isSearchingOrg ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<>
											<Search className="h-4 w-4" />
											<span className="text-sm">{t("search")}</span>
										</>
									)}
								</Button>
							</div>
							{orgSearchError && (
								<p className="text-sm text-red-600">{orgSearchError}</p>
							)}
							<p className="text-xs text-gray-500">{t("orgNumberHint")}</p>
						</div>
					</div>

					{/* Organization Details Display */}
					{foundOrganization && (
						<div className="rounded-lg">
							<div className="space-y-0">
								<div className="flex items-center justify-between bg-white px-4 py-3">
									<span className="text-base font-medium text-gray-900">
										Organisasjonsnummer:
									</span>
									<span className="text-base font-light text-gray-900">
										{foundOrganization.org_number}
									</span>
								</div>
								<div className="flex items-center justify-between bg-gray-50 px-4 py-3">
									<span className="text-base font-medium text-gray-900">
										Firmanavn:
									</span>
									<span className="text-base font-light text-gray-900">
										{foundOrganization.org_name}
									</span>
								</div>
								{foundOrganization.address && (
									<div className="flex items-center justify-between bg-white px-4 py-3">
										<span className="text-base font-medium text-gray-900">
											Adresse:
										</span>
										<span className="text-base font-light text-gray-900">
											{foundOrganization.address}
										</span>
									</div>
								)}
								{foundOrganization.postal_code && (
									<div className="flex items-center justify-between bg-gray-50 px-4 py-3">
										<span className="text-base font-medium text-gray-900">
											Postnummer:
										</span>
										<span className="text-base font-light text-gray-900">
											{foundOrganization.postal_code}
										</span>
									</div>
								)}
								{foundOrganization.city && (
									<div className="flex items-center justify-between bg-white px-4 py-3">
										<span className="text-base font-medium text-gray-900">
											Poststed:
										</span>
										<span className="text-base font-light text-gray-900">
											{foundOrganization.city}
										</span>
									</div>
								)}
								{foundOrganization.country && (
									<div className="flex items-center justify-between bg-gray-50 px-4 py-3">
										<span className="text-base font-medium text-gray-900">
											Land:
										</span>
										<span className="text-base font-light text-gray-900">
											{foundOrganization.country}
										</span>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Service Center Section */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">{t("serviceCenterTitle")}</h3>

						<div className="space-y-2">
							<Label htmlFor="serviceCenter">
								{t("serviceCenterLabel")}{" "}
								<span className="text-red-500">*</span>
							</Label>
							<Select
								value={selectedWarehouseNumber}
								onValueChange={setSelectedWarehouseNumber}
								disabled={isLoadingWarehouses}>
								<SelectTrigger id="serviceCenter">
									<SelectValue placeholder={t("serviceCenterPlaceholder")} />
								</SelectTrigger>
								<SelectContent className="z-[9999]">
									{availableWarehouses
										.filter((w) => w.id != null && String(w.id) !== "")
										.map((warehouse) => (
											<SelectItem
												key={String(warehouse.id)}
												value={String(warehouse.id)}>
												{warehouse.name} ({warehouse.id})
											</SelectItem>
										))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>

				{/* Divider and Send Button */}
				<div className="space-y-4 border-t pt-4">
					<div className="flex justify-end">
						<Button
							type="button"
							onClick={handleSubmit}
							disabled={!canSubmit || submitSuccess}
							variant="outlineGrey">
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									{t("submitting")}
								</>
							) : submitSuccess ? (
								t("submitted")
							) : (
								<>
									{t("submit")}
									<ChevronRight className="ml-1 h-4 w-4" />
								</>
							)}
						</Button>
					</div>

					{submitSuccess && (
						<div className="rounded-lg border border-green-200 bg-green-50 p-4">
							<p className="text-sm font-medium text-green-800">
								{t("submitSuccess")}
							</p>
							<p className="mt-1 text-sm text-green-700">
								{t("submitSuccessMessage")}
							</p>
						</div>
					)}
					{submitError && (
						<div className="rounded-lg border border-red-200 bg-red-50 p-4">
							<p className="text-sm font-medium text-red-800">
								{t("submitErrorTitle")}
							</p>
							<p className="mt-1 text-sm text-red-700">{submitError}</p>
						</div>
					)}
				</div>

				{/* Help Section - Bottom of Modal */}
				<div className="mt-auto pt-4">
					<p
						className="text-center text-sm font-normal text-[#5A615D]"
						style={{ fontSize: "14px" }}>
						{t("helpText")}{" "}
						<a
							href={`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`}
							className="font-medium text-green-600 underline-offset-4 hover:underline">
							{SUPPORT_PHONE}
						</a>{" "}
						{t("helpTextOr")}{" "}
						<a
							href={`mailto:${SUPPORT_EMAIL}`}
							className="font-medium text-green-600 underline-offset-4 hover:underline">
							{SUPPORT_EMAIL}
						</a>
					</p>
				</div>
			</DialogContent>
		</Dialog>
	);
}
