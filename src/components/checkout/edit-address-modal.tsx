import React, { useState } from "react";

import { cn } from "@/lib/utils";
import { getPostalCode } from "@/services/orders.service";
import { SavedAddress } from "@/types/address";
import { MapPin, Plus, Loader2 } from "lucide-react";

import { AddressSelector } from "./address-selector";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Modal } from "../ui/modal";
import { Textarea } from "../ui/textarea";

export interface SavedAddressData {
	id?: string;
	addressName: string;
	street: string;
	houseNumber: string;
	postalCode: string;
	city: string;
	extraInfo?: string;
	isUserAddress: boolean;
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
	// Mock data - replace with actual data from your tables
	const savedAddresses: SavedAddress[] = [
		{
			id: "b1",
			type: "bruker",
			name: "Adresse 1",
			street: "Storgata",
			houseNumber: "1",
			postalCode: "0155",
			city: "Oslo",
		},
		{
			id: "b2",
			type: "bruker",
			name: "Adresse 2",
			street: "Lillegata",
			houseNumber: "2",
			postalCode: "0156",
			city: "Oslo",
		},
		{
			id: "k1",
			type: "kunde",
			name: "Adresse 1",
			street: "Kundegata",
			houseNumber: "10",
			postalCode: "5020",
			city: "Bergen",
		},
		{
			id: "k2",
			type: "kunde",
			name: "Adresse 2",
			street: "Bedriftsvei",
			houseNumber: "20",
			postalCode: "5021",
			city: "Bergen",
		},
		{
			id: "k3",
			type: "kunde",
			name: "Adresse 3",
			street: "Næringsveien",
			houseNumber: "30",
			postalCode: "5022",
			city: "Bergen",
		},
		{
			id: "o1",
			type: "organisasjon",
			name: "Adresse 1",
			street: "Orggata",
			houseNumber: "100",
			postalCode: "7030",
			city: "Trondheim",
		},
		{
			id: "o2",
			type: "organisasjon",
			name: "Adresse 2",
			street: "Firmagata",
			houseNumber: "200",
			postalCode: "7031",
			city: "Trondheim",
		},
	];

	const [formData, setFormData] = useState<SavedAddressData>({
		addressName: initialData?.addressName || "",
		street: initialData?.street || "",
		houseNumber: initialData?.houseNumber || "",
		postalCode: initialData?.postalCode || "",
		city: initialData?.city || "",
		extraInfo: initialData?.extraInfo || "",
		isUserAddress: initialData?.isUserAddress || false,
	});

	const [showExtra, setShowExtra] = useState(!!formData.extraInfo);
	const [loading, setLoading] = useState(false);
	const [showNewAddressForm, setShowNewAddressForm] = useState(false);

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
		setFormData((prev) => ({ ...prev, [name]: value }));

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
				<h2 className="text-xl font-semibold">Din adresse</h2>
			</div>

			<div className="space-y-4">
				<div>
					<Label>Lagrede adresser</Label>
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
							console.log("Add new address");
						}}
					/>
				</div>

				<div>
					<Label>Navn på adresse</Label>
					<Input
						name="addressName"
						value={formData.addressName}
						onChange={handleChange}
						placeholder="Legg til navn"
					/>
					<p className="text-muted-foreground mt-1 text-xs font-medium">
						Eksempel: Hjem, Jobb, Kontor
					</p>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<Label>Gatenavn</Label>
						<Input
							name="street"
							value={formData.street}
							onChange={handleChange}
							placeholder="Legg til gatenavn"
						/>
						<p className="text-muted-foreground mt-1 text-xs font-medium">
							Eksempel: Storgata
						</p>
					</div>
					<div>
						<Label>Husnummer</Label>
						<Input
							name="houseNumber"
							value={formData.houseNumber}
							onChange={handleChange}
							placeholder="Legg til husnummer"
						/>
						<p className="text-muted-foreground mt-1 text-xs font-medium">
							Eksempel: 15
						</p>
					</div>
				</div>

				{!showExtra && (
					<Button
						variant="outline"
						className="text-foreground border-[#C1C4C2] text-sm font-medium"
						onClick={() => setShowExtra(true)}>
						<Plus className="h-4 w-4" />
						Legg til tilleggsopplysninger
					</Button>
				)}
				{showExtra && (
					<div>
						<Label>Tilleggsopplysninger (valgfri)</Label>
						<Input
							name="extraInfo"
							value={formData.extraInfo}
							onChange={handleChange}
							placeholder="Legg til husnummer"
						/>
						<p className="text-muted-foreground mt-1 text-xs font-medium">
							Eksempel: c/o, etasje, oppgang osv.
						</p>
					</div>
				)}

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<Label>Postnummer</Label>
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
							Eksempel: 0155
						</p>
					</div>
					<div>
						<Label>Sted</Label>
						<Input
							name="city"
							value={formData.city}
							readOnly={cityReadOnly}
							onChange={handleChange}
							placeholder={
								cityReadOnly
									? "(fylles automatisk etter postnummer er validert)"
									: "Skriv inn sted"
							}
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
					<Label htmlFor="user-address">Lagre som brukeradresse</Label>
				</div>

				<div className="flex gap-4 pt-2">
					<Button
						onClick={handleSave}
						variant="outlineGreen"
						className="font-medium">
						Bruk adresse
					</Button>
					<Button
						variant="outline"
						onClick={handleCancel}
						className="text-foreground font-medium">
						Avbryt
					</Button>
				</div>
			</div>
		</Modal>
	);
};
