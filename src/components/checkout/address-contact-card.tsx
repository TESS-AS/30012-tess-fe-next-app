import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCreateNewUserAddress } from "@/hooks/useCreateNewUserAddress";
import { useSavedAddresses } from "@/hooks/useSavedAddresses";
import { cn } from "@/lib/utils";
import { getPostalCode } from "@/services/orders.service";
import { MapPin, Pencil, Loader2, Plus, SquarePen } from "lucide-react";
import { useTranslations } from "next-intl";

import { AddressSelector } from "./address-selector";
import { COUNTRIES } from "../../constants/countries";
import {
	AddressFormState,
	type CreateNewUserAddress,
} from "../../types/address";

interface AddressCardProps {
	name: string;
	label?: string;
	street: string;
	postalCode: string;
	city: string;
	addressName?: string;
	houseNumber?: string;
	extraInfo?: string;
	isUserAddress?: boolean;
	countryCode?: string;
	onSave?: (data: AddressFormState) => void;
}

const POSTAL_CODE_REGEX = /^\d{4}$/;

export const AddressCard: React.FC<AddressCardProps> = ({
	name,
	label = "",
	street,
	postalCode,
	city,
	addressName = "",
	houseNumber = "",
	extraInfo = "",
	countryCode = "",
	isUserAddress = false,
	onSave,
}) => {
	const t = useTranslations("Checkout.address");
	const savedAddresses = useSavedAddresses();
	const { mutateAsync: createNewAddress } = useCreateNewUserAddress();

	const [editMode, setEditMode] = useState(false);
	const [showExtra, setShowExtra] = useState(!!extraInfo);
	const [isLoading, setIsLoading] = useState(false);
	const [cityReadOnly, setCityReadOnly] = useState(true);
	const [errors, setErrors] = useState<{
		addressName?: string;
		street?: string;
		houseNumber?: string;
		postalCode?: string;
		city?: string;
		countryCode?: string;
	}>({});

	const [formData, setFormData] = useState<AddressFormState>({
		addressName,
		street,
		houseNumber,
		extraInfo,
		postalCode,
		city,
		isUserAddress,
		countryCode,
	});

	const handleChange = async (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		setErrors((prev) => {
			const next = { ...prev };
			// Clear error for the field being edited
			if (name in next) {
				delete (next as any)[name];
			}
			return next;
		});

		if (name === "postalCode") {
			await fetchCityFromPostalCode(value);
		}
	};

	const handleSave = () => {
		const validationErrors: typeof errors = {};

		if (!formData.addressName?.trim()) {
			validationErrors.addressName = "Dette feltet er påkrevd";
		}
		if (!formData.street?.trim()) {
			validationErrors.street = "Dette feltet er påkrevd";
		}
		if (!formData.houseNumber?.trim()) {
			validationErrors.houseNumber = "Dette feltet er påkrevd";
		}
		if (!formData.postalCode?.trim()) {
			validationErrors.postalCode = "Dette feltet er påkrevd";
		} else if (!POSTAL_CODE_REGEX.test(formData.postalCode)) {
			validationErrors.postalCode = t("postalCodeExample");
		}
		if (!formData.city?.trim()) {
			validationErrors.city = "Dette feltet er påkrevd";
		}
		if (!formData.countryCode?.trim()) {
			validationErrors.countryCode = "Dette feltet er påkrevd";
		}

		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			return;
		}

		setErrors({});
		onSave?.(formData);

		if (formData.isUserAddress) {
			const payload: CreateNewUserAddress = {
				addressLine1: formData.street,
				addressLine2: formData.houseNumber,
				addressLine3: formData.extraInfo ?? "",
				city: formData.city,
				postalCode: Number(formData.postalCode) || 0,
				addressName: formData.addressName || "",
				countryCode: formData.countryCode || "",
			};

			void createNewAddress(payload);
		}

		setEditMode(false);
	};

	const handleCancel = () => {
		setEditMode(false);
	};

	const fetchCityFromPostalCode = async (postalCode: string) => {
		if (!POSTAL_CODE_REGEX.test(postalCode)) {
			setFormData((prev) => ({ ...prev, city: "" }));
			setCityReadOnly(false);
			return;
		}

		setIsLoading(true);
		try {
			const postalCodeData = await getPostalCode(postalCode);
			if (postalCodeData && postalCodeData.length > 0) {
				setFormData((prev) => ({ ...prev, city: postalCodeData[0].city }));
				setCityReadOnly(true);
			} else {
				setFormData((prev) => ({ ...prev, city: "" }));
				setCityReadOnly(false);
			}
		} catch (error) {
			console.error("Error fetching city:", error);
			setFormData((prev) => ({ ...prev, city: "" }));
			setCityReadOnly(false);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className="rounded-lg shadow-none">
			<CardContent className="p-6">
				<div className="mb-3 flex w-full items-start justify-between">
					<div className="flex items-start gap-2">
						<MapPin className="mt-1 h-5 w-5" />
						<h2 className="text-foreground text-lg font-semibold">
							{t("title")}
						</h2>
					</div>
				</div>

				{!editMode ? (
					<div>
						<p className="text-foreground mb-1 text-sm">{label}</p>
						<p className="text-foreground text-sm">{addressName}</p>
						<p className="text-foreground text-sm">
							{street} {houseNumber}
						</p>
						<p className="text-foreground text-sm">
							{postalCode} {city}
						</p>
					</div>
				) : (
					<div className="space-y-4">
						<div>
							<Label>{t("savedAddresses")}</Label>
							<AddressSelector
								savedAddresses={savedAddresses}
								onAddressSelect={(selectedAddress) => {
									setFormData((prev) => ({
										...prev,
										addressName: selectedAddress.name,
										street: selectedAddress.street,
										houseNumber: selectedAddress.houseNumber,
										postalCode: selectedAddress.postalCode,
										city: selectedAddress.city,
										extraInfo: selectedAddress.extraInfo || "",
										countryCode: selectedAddress.countryCode,
									}));
								}}
								onAddNewClick={() => {
									const payload: CreateNewUserAddress = {
										addressLine1: formData.street,
										addressLine2: formData.houseNumber,
										addressLine3: formData.extraInfo ?? "",
										city: formData.city,
										postalCode: Number(formData.postalCode) || 0,
										addressName: formData.addressName || "",
										countryCode: formData.countryCode || "NO",
									};

									void createNewAddress(payload);
								}}
							/>
						</div>

						<div>
							<Label>{t("addressName")}</Label>
							<Input
								name="addressName"
								value={formData.addressName}
								onChange={handleChange}
								placeholder="Legg til navn"
							/>
							<p className="text-muted-foreground mt-1 text-xs font-medium">
								{t("addressNameExample")}
							</p>
							{errors.addressName && (
								<p className="mt-1 text-xs font-medium text-red-600">
									{errors.addressName}
								</p>
							)}
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div>
								<Label>{t("street")}</Label>
								<Input
									name="street"
									value={formData.street}
									onChange={handleChange}
									placeholder="Legg til gatenavn"
								/>
								<p className="text-muted-foreground mt-1 text-xs font-medium">
									{t("streetExample")}
								</p>
								{errors.street && (
									<p className="mt-1 text-xs font-medium text-red-600">
										{errors.street}
									</p>
								)}
							</div>
							<div>
								<Label>{t("houseNumber")}</Label>
								<Input
									name="houseNumber"
									value={formData.houseNumber}
									onChange={handleChange}
									placeholder="Legg til husnummer"
								/>
								<p className="text-muted-foreground mt-1 text-xs font-medium">
									{t("houseNumberExample")}
								</p>
								{errors.houseNumber && (
									<p className="mt-1 text-xs font-medium text-red-600">
										{errors.houseNumber}
									</p>
								)}
							</div>
						</div>

						{!formData.extraInfo && !showExtra && (
							<Button
								variant="outline"
								className="text-foreground border-[#C1C4C2] text-sm font-medium"
								onClick={() => setShowExtra(true)}>
								<Plus className="h-4 w-4" />
								{t("addExtra")}
							</Button>
						)}
						{(formData.extraInfo || showExtra) && (
							<div>
								<Label>{t("extraInfo")}</Label>
								<Input
									name="extraInfo"
									value={formData.extraInfo}
									onChange={handleChange}
									placeholder="Legg til husnummer"
								/>
								<p className="text-muted-foreground mt-1 text-xs font-medium">
									{t("extraInfoExample")}
								</p>
							</div>
						)}

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div>
								<Label>{t("postalCode")}</Label>
								<div className="relative">
									<Input
										name="postalCode"
										value={formData.postalCode}
										onChange={handleChange}
										placeholder="Legg til postnummer"
										className={cn(isLoading && "pr-10")}
									/>
									{isLoading && (
										<div className="absolute top-1/2 right-3 -translate-y-1/2">
											<Loader2 className="h-4 w-4 animate-spin text-[#009640]" />
										</div>
									)}
								</div>
								<p className="text-muted-foreground mt-1 text-xs font-medium">
									{t("postalCodeExample")}
								</p>
								{errors.postalCode && (
									<p className="mt-1 text-xs font-medium text-red-600">
										{errors.postalCode}
									</p>
								)}
							</div>
							<div>
								<Label>{t("city")}</Label>
								<Input
									name="city"
									value={formData.city}
									readOnly={cityReadOnly}
									onChange={handleChange}
									placeholder={
										cityReadOnly
											? t("cityPlaceholderAuto")
											: t("cityPlaceholderManual")
									}
								/>
								{errors.city && (
									<p className="mt-1 text-xs font-medium text-red-600">
										{errors.city}
									</p>
								)}
							</div>
						</div>

						<div>
							<Label>Landskode</Label>
							<Select
								value={formData.countryCode}
								onValueChange={(value) =>
									setFormData((prev) => ({ ...prev, countryCode: value }))
								}>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Velg land" />
								</SelectTrigger>
								<SelectContent>
									{COUNTRIES.map((country) => (
										<SelectItem
											key={country.code}
											value={country.code}>
											{country.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errors.countryCode && (
								<p className="mt-1 text-xs font-medium text-red-600">
									{errors.countryCode}
								</p>
							)}
						</div>

						<div className="flex items-center space-x-2">
							<Checkbox
								id="user-address"
								checked={formData.isUserAddress}
								onCheckedChange={(checked) => {
									const isChecked = !!checked;
									setFormData((prev) => ({
										...prev,
										isUserAddress: isChecked,
									}));
								}}
							/>
							<Label htmlFor="user-address">{t("saveAsUserAddress")}</Label>
						</div>

						<div className="flex gap-4 pt-2">
							<Button
								onClick={handleSave}
								variant="outlineGreen"
								className="font-medium">
								{t("useAddress")}
							</Button>
							<Button
								variant="outline"
								onClick={handleCancel}
								className="text-foreground font-medium">
								{t("cancel")}
							</Button>
						</div>
					</div>
				)}
				{!editMode && (
					<Button
						size="sm"
						variant="outline"
						onClick={() => setEditMode(true)}
						className="text-foreground mt-4 border-[#C1C4C2] text-xs font-medium"
						// disabled={true}
					>
						<Pencil className="mr-1 h-3 w-3" />
						{t("edit")}
					</Button>
				)}
			</CardContent>
		</Card>
	);
};
