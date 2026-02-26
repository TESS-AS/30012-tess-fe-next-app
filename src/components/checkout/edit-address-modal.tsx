import React, { useState } from "react";

import { useSavedAddresses } from "@/hooks/useSavedAddresses";
import { cn } from "@/lib/utils";
import { getPostalCode } from "@/services/orders.service";
import { MapPin, Plus, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { AddressSelector } from "./address-selector";
import { Button } from "../ui/button";
import { CharLimitFeedback } from "../ui/char-limit-feedback";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Modal } from "../ui/modal";

export interface SavedAddressData {
	id?: string;
	addressName: string;
	street: string;
	houseNumber: string;
	postalCode: string;
	city: string;
	extraInfo?: string;
	isUserAddress: boolean;
	countryCode: string;
}

interface EditAddressModalProps {
	open: boolean;
	onClose: () => void;
	onSave: (data: SavedAddressData) => void;
	initialData?: Partial<SavedAddressData>;
}

export const EditAddressModal: React.FC<EditAddressModalProps> = ({
	open,
	onClose,
	onSave,
	initialData,
}) => {
	const t = useTranslations("Checkout.modals.address");
	const MAX_ADDRESS_FIELD_LENGTH = 30;

	const savedAddresses = useSavedAddresses();
	const [formData, setFormData] = useState<SavedAddressData>({
		addressName: initialData?.addressName || "",
		street: initialData?.street || "",
		houseNumber: initialData?.houseNumber || "",
		postalCode: initialData?.postalCode || "",
		city: initialData?.city || "",
		extraInfo: initialData?.extraInfo || "",
		isUserAddress: initialData?.isUserAddress || false,
		countryCode: initialData?.countryCode || "",
	});

	const [showExtra, setShowExtra] = useState(!!formData.extraInfo);
	const [loading, setLoading] = useState(false);
	const [showNewAddressForm, setShowNewAddressForm] = useState(false);
	const [tooLongFields, setTooLongFields] = useState<Record<string, boolean>>(
		{},
	);

	const handleSave = () => {
		onSave(formData);
		onClose();
	};

	const handleCancel = () => {
		onClose();
	};

	const [cityReadOnly, setCityReadOnly] = useState(true);

	const handleChange = async (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		const shouldLimitLength =
			name === "street" ||
			name === "houseNumber" ||
			name === "extraInfo" ||
			name === "city";
		if (shouldLimitLength) {
			setTooLongFields((prev) => ({
				...prev,
				[name]: value.length > MAX_ADDRESS_FIELD_LENGTH,
			}));
		}
		const nextValue = shouldLimitLength
			? value.slice(0, MAX_ADDRESS_FIELD_LENGTH)
			: value;
		setFormData((prev) => ({ ...prev, [name]: nextValue }));

		// Real postal code validation
		if (name === "postalCode") {
			try {
				setLoading(true);
				const postalCodeData = await getPostalCode(value);
				if (postalCodeData && postalCodeData.length > 0) {
					setFormData((prev) => ({
						...prev,
						city: postalCodeData[0].city,
					}));
					setCityReadOnly(true);
				} else {
					setFormData((prev) => ({ ...prev, city: "" }));
					setCityReadOnly(false);
				}
			} catch (error) {
				console.error("Error fetching postal code:", error);
				setFormData((prev) => ({ ...prev, city: "" }));
				setCityReadOnly(false);
			} finally {
				setLoading(false);
			}
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		// Simulate postal code validation
		if (formData.postalCode) {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			setLoading(false);
			onSave(formData);
			onClose();
		}
	};

	return (
		<Modal
			open={open}
			onOpenChange={onClose}>
			<div className="mb-6 flex items-center gap-2">
				<MapPin className="h-5 w-5" />
				<h2 className="text-xl font-semibold">{t("title")}</h2>
			</div>

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
							}));
						}}
						onAddNewClick={() => {
							// Handle new address creation
						}}
					/>
				</div>

				<div>
					<Label>{t("addressName")}</Label>
					<Input
						name="addressName"
						value={formData.addressName}
						maxLength={MAX_ADDRESS_FIELD_LENGTH}
						onChange={(e) => {
							const nextValue = e.target.value;
							setTooLongFields((prev) => ({
								...prev,
								addressName: nextValue.length > MAX_ADDRESS_FIELD_LENGTH,
							}));
							setFormData((prev) => ({
								...prev,
								addressName: nextValue.slice(0, MAX_ADDRESS_FIELD_LENGTH),
							}));
						}}
						placeholder="Legg til navn"
					/>
					<CharLimitFeedback
						helperText={t("addressNameExample")}
						valueLength={formData.addressName.length}
						maxLength={MAX_ADDRESS_FIELD_LENGTH}
						showTooLong={tooLongFields.addressName}
						exceededText={`Maks ${MAX_ADDRESS_FIELD_LENGTH} tegn`}
					/>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<Label>{t("street")}</Label>
						<Input
							name="street"
							value={formData.street}
							onChange={handleChange}
							maxLength={MAX_ADDRESS_FIELD_LENGTH}
							placeholder="Legg til gatenavn"
						/>
						<CharLimitFeedback
							helperText={t("streetExample")}
							valueLength={formData.street.length}
							maxLength={MAX_ADDRESS_FIELD_LENGTH}
							showTooLong={tooLongFields.street}
							exceededText={`Maks ${MAX_ADDRESS_FIELD_LENGTH} tegn`}
						/>
					</div>
					<div>
						<Label>{t("houseNumber")}</Label>
						<Input
							name="houseNumber"
							value={formData.houseNumber}
							onChange={handleChange}
							maxLength={MAX_ADDRESS_FIELD_LENGTH}
							placeholder="Legg til husnummer"
						/>
						<CharLimitFeedback
							helperText={t("houseNumberExample")}
							valueLength={formData.houseNumber.length}
							maxLength={MAX_ADDRESS_FIELD_LENGTH}
							showTooLong={tooLongFields.houseNumber}
							exceededText={`Maks ${MAX_ADDRESS_FIELD_LENGTH} tegn`}
						/>
					</div>
				</div>

				{!showExtra && (
					<Button
						variant="outline"
						className="text-foreground border-[#C1C4C2] text-sm font-medium"
						onClick={() => setShowExtra(true)}>
						<Plus className="h-4 w-4" />
						{t("addExtra")}
					</Button>
				)}
				{showExtra && (
					<div>
						<Label>{t("extraInfo")}</Label>
						<Input
							name="extraInfo"
							value={formData.extraInfo}
							onChange={handleChange}
							maxLength={MAX_ADDRESS_FIELD_LENGTH}
							placeholder="Legg til husnummer"
						/>
						<CharLimitFeedback
							helperText={t("extraInfoExample")}
							valueLength={(formData.extraInfo || "").length}
							maxLength={MAX_ADDRESS_FIELD_LENGTH}
							showTooLong={tooLongFields.extraInfo}
							exceededText={`Maks ${MAX_ADDRESS_FIELD_LENGTH} tegn`}
						/>
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
								className={cn(loading && "pr-10")}
							/>
							{loading && (
								<div className="absolute top-1/2 right-3 -translate-y-1/2">
									<Loader2 className="h-4 w-4 animate-spin text-[#009640]" />
								</div>
							)}
						</div>
						<p className="text-muted-foreground mt-1 text-xs font-medium">
							{t("postalCodeExample")}
						</p>
					</div>
					<div>
						<Label>{t("city")}</Label>
						<Input
							name="city"
							value={formData.city}
							readOnly={cityReadOnly}
							onChange={handleChange}
							maxLength={MAX_ADDRESS_FIELD_LENGTH}
							placeholder={
								cityReadOnly
									? t("cityPlaceholderAuto")
									: t("cityPlaceholderManual")
							}
						/>
						<CharLimitFeedback
							valueLength={formData.city.length}
							maxLength={MAX_ADDRESS_FIELD_LENGTH}
							showTooLong={tooLongFields.city}
							exceededText={`Maks ${MAX_ADDRESS_FIELD_LENGTH} tegn`}
						/>
					</div>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="user-address"
						checked={formData.isUserAddress}
						onCheckedChange={(checked) =>
							setFormData((prev) => ({ ...prev, isUserAddress: !!checked }))
						}
					/>
					<Label htmlFor="user-address">{t("saveAsUserAddress")}</Label>
				</div>

				<div className="flex gap-4 pt-2">
					<Button
						onClick={handleSave}
						variant="outlineGreen"
						className="font-medium">
						{t("save")}
					</Button>
					<Button
						variant="outline"
						onClick={handleCancel}
						className="text-foreground font-medium">
						{t("cancel")}
					</Button>
				</div>
			</div>
		</Modal>
	);
};
