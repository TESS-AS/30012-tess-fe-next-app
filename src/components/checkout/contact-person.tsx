import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User2, SquarePen } from "lucide-react";
import Image from "next/image";

interface ContactPersonProps {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	onSave?: (updated: {
		firstName: string;
		lastName: string;
		email: string;
		phone: string;
	}) => void;
}

export const ContactPerson: React.FC<ContactPersonProps> = ({
	firstName,
	lastName,
	email,
	phone,
	onSave,
}) => {
	const [editMode, setEditMode] = useState(false);
	const [formData, setFormData] = useState({
		firstName,
		lastName,
		email,
		phone,
	});
	const [isSaved, setIsSaved] = useState(false);

	useEffect(() => {
		setFormData({ firstName, lastName, email, phone });
	}, [firstName, lastName, email, phone]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleCancel = () => {
		setFormData({ firstName, lastName, email, phone });
		setEditMode(false);
		setIsSaved(false);
	};

	const handleSave = async () => {
		await onSave?.(formData);
		setEditMode(false);
		setIsSaved(true);
	};

	console.log(formData, "formData");

	return (
		<Card className="rounded-lg shadow-none">
			<CardContent className="flex flex-col items-start p-6">
				<div className="mb-3 flex w-full items-start justify-between">
					<div className="flex items-start gap-2">
						<User2 className="mt-1 h-5 w-5" />
						<h2 className="text-foreground text-lg font-semibold">
							Kontaktperson
						</h2>
					</div>

					{editMode && (
						<div className="flex items-center gap-1 rounded bg-[#FDFDEA] px-3 py-2 text-xs font-bold text-[#633112] hover:bg-transparent">
							<SquarePen className="h-4 w-4" />
							Endre kontaktperson
						</div>
					)}
				</div>

				{editMode ? (
					<div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<Label htmlFor="firstName">Fornavn</Label>
							<Input
								id="firstName"
								name="firstName"
								value={formData.firstName}
								onChange={handleChange}
							/>
						</div>

						<div>
							<Label htmlFor="lastName">Etternavn</Label>
							<Input
								id="lastName"
								name="lastName"
								value={formData.lastName}
								onChange={handleChange}
							/>
						</div>

						{/* E-post */}
						<div>
							<Label htmlFor="email">E-post</Label>
							<Input
								id="email"
								name="email"
								type="email"
								value={formData.email}
								onChange={handleChange}
								disabled
							/>
							<p className="text-muted-foreground mt-1 text-xs">
								Eksempel: navn@navnesen.no
							</p>
						</div>

						<div>
							<Label htmlFor="phone">Telefonnummer</Label>
							<Input
								id="phone"
								name="phone"
								value={formData.phone}
								onChange={handleChange}
							/>
							<p className="text-muted-foreground mt-1 text-xs">
								Eksempel: +47 123 45 678
							</p>
						</div>

						<div className="col-span-full flex gap-4 pt-2">
							<Button
								onClick={handleSave}
								variant="outlineGreen"
								className="font-medium">
								Lagre kontaktperson
							</Button>
							<Button
								onClick={handleCancel}
								variant="outline"
								className="text-foreground font-medium">
								Avbryt
							</Button>
						</div>
					</div>
				) : (
					<div className="">
						<p className="text-foreground mb-1 text-sm">
							{formData.firstName} {formData.lastName}
						</p>
						<p className="text-foreground mb-1 text-sm">{formData.email}</p>
						<p className="text-foreground text-sm">{formData.phone}</p>
					</div>
				)}

				{isSaved && !editMode && (
					<div className="mt-4 inline-flex items-center gap-1.5 rounded bg-[#DEF7EC] px-2.5 py-1.5 text-xs font-medium text-[#005522]">
						<Image
							src="/icons/map-pin-alt.svg"
							alt="map-pin-alt"
							width={10}
							height={10}
						/>
						Hentet fra profil
					</div>
				)}
				{!editMode && (
					<Button
						size="sm"
						variant="outline"
						onClick={() => setEditMode(true)}
						className="text-foreground mt-4 border-[#C1C4C2] text-xs font-medium">
						<SquarePen className="mr-1 h-1 w-1" />
						Endre kontaktperson
					</Button>
				)}
			</CardContent>
		</Card>
	);
};
