"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Modal, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { updateUserDimensions } from "@/services/dimensions.service";
import type { DimensionLabel, DimensionType } from "@/types/dimensions.types";
import { toast } from "react-toastify";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	dimensionTypes: DimensionType[];
	handleActiveChange: (index: number, checked: boolean) => void;
	handleTypeChange: (index: number, value: string) => void;
	customerNumber: string;
	onAfterCloseFocus?: () => void;
	currentLevel: number;
	editAll?: boolean;
}

export default function TypeModal({
	open,
	onOpenChange,
	dimensionTypes,
	handleActiveChange,
	handleTypeChange,
	customerNumber,
	onAfterCloseFocus,
	currentLevel,
	editAll = false,
}: Props) {
	return (
		<Modal
			open={open}
			onOpenChange={(v) => {
				onOpenChange(v);
				if (!v && onAfterCloseFocus) {
					setTimeout(onAfterCloseFocus, 0);
				}
			}}>
			<ModalHeader>
				<ModalTitle>Sett dimensjonstyper</ModalTitle>
			</ModalHeader>
			<div className="space-y-8">
				{dimensionTypes.map((dim, index) => (
					<div
						key={dim.dimension}
						className="space-y-2">
						<div
							className={cn("grid grid-cols-2 gap-4", {
								"opacity-50": !editAll && index !== currentLevel,
							})}>
							<div className="space-y-2">
								<p className="text-sm">Dimensjon</p>
								<Input
									value={dim.dimension}
									className="border-[#C1C4C2] bg-[#F8F9F8]"
								/>
								<div className="flex items-center gap-2 pt-1">
									<Checkbox
										id={`active-${dim.dimension}`}
										checked={index === currentLevel ? dim.active : false}
										onCheckedChange={(checked) =>
											handleActiveChange(index, checked as boolean)
										}
										disabled={!editAll && index !== currentLevel}
									/>
									<label
										htmlFor={`active-${dim.dimension}`}
										className={cn("text-sm", {
											"cursor-not-allowed": index !== currentLevel,
										})}>
										Aktiv
									</label>
								</div>
							</div>
							<div className="space-y-2">
								<p className="text-sm">Type</p>
								<Input
									placeholder="Skriv type"
									className="border-[#C1C4C2] bg-white hover:border-[#009640] focus:border-[#009640] focus:ring-1 focus:ring-[#009640]"
									value={dim.type}
									onClick={(e) => e.stopPropagation()}
									onChange={(e) => handleTypeChange(index, e.target.value)}
									disabled={!editAll && index !== currentLevel}
								/>
								{index === 0 && (
									<p className="text-xs text-[#6B7280]">
										Eksempel: Prosjekt, avdeling, arbeidsordre osv.
									</p>
								)}
							</div>
						</div>
						{index === 0 && (
							<p className="text-xs leading-relaxed text-[#6B7280]">
								Dimensjon vises på utsjekk
								<br />
								og blir påkrevd å fylle ut av alle ansatte
							</p>
						)}
					</div>
				))}
				<Button
					onClick={async () => {
						try {
							const activeDimensions = dimensionTypes.filter((d) => d.active);
							const payload: DimensionLabel = {};
							activeDimensions.forEach((dim, idx) => {
								payload[`dimension_${idx + 1}_label`] = dim.type;
							});
							await updateUserDimensions(customerNumber, payload);
							toast.success("Dimensjonstyper oppdatert");
							onOpenChange(false);
						} catch (error) {
							console.error("Error updating dimension types:", error);
							toast.error("Kunne ikke oppdatere dimensjonstyper");
						}
					}}
					className={cn("w-fit text-white", {
						"bg-[#009640] hover:bg-[#005522]":
							editAll || dimensionTypes.some((d) => d.active),
						"cursor-not-allowed bg-gray-400":
							!editAll && !dimensionTypes.some((d) => d.active),
					})}
					disabled={!editAll && !dimensionTypes.some((d) => d.active)}>
					Lagre dimensjonstyper
				</Button>
			</div>
		</Modal>
	);
}
