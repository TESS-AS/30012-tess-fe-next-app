"use client";

/**
 * "Kopier eksisterende KSU du har tilgang til" option body.
 *
 * Spec constraint added by product: this option gets the SAME tree customize
 * drawer as "Opprett ny", but the tree data source depends on which existing
 * KSU the user picks (not DEFAULT_SALES_NEW).
 *
 * Flow:
 *   1. User picks a source KSU from the dropdown.
 *   2. Name + description inputs appear + "Tilpass kildekatalog" button.
 *   3. Drawer loads `/assortment/:sourceNumber/structure` and shows that tree.
 */

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGetKsuList } from "@/hooks/useAssortmentQueries";
import type { AssortmentWizardController } from "@/hooks/useAssortmentWizard";
import { Settings2 } from "lucide-react";

import { NameAvailabilityHint } from "./NameAvailabilityHint";
import { TilpassKatalogDrawer } from "../sections/TilpassKatalogDrawer";

interface Props {
	wizard: AssortmentWizardController;
}

export function KopierBody({ wizard }: Props) {
	const [drawerOpen, setDrawerOpen] = React.useState(false);

	// KSUs the user can copy from (user-joined KSUs + the TESS catalog). The
	// admin-counts flavor is not needed here — this dropdown just needs names.
	const { data: ksuList, isLoading: isLoadingAssortments } = useGetKsuList();
	const items = ksuList ?? [];

	const sourceNumber = wizard.formData.sourceAssortmentNumber;
	const selectedCount = wizard.formData.selectedCategoryNumbers.size;

	return (
		<div className="space-y-5 pt-4">
			<div className="space-y-1 max-w-md">
				<label className="text-sm font-medium text-[#0F1912]">
					Velg KSU å kopiere fra
				</label>
				<Select
					value={sourceNumber ?? ""}
					onValueChange={(v) => wizard.setSource(v || null)}>
					<SelectTrigger
						disabled={isLoadingAssortments}
						className="bg-white">
						<SelectValue
							placeholder={
								isLoadingAssortments ? "Laster ..." : "Velg KSU ..."
							}
						/>
					</SelectTrigger>
					<SelectContent>
						{items.map((a) => {
							const value = a.assortmentNumber;
							if (!value) return null;
							return (
								<SelectItem
									key={value}
									value={value}>
									{a.assortmentName || value}
								</SelectItem>
							);
						})}
					</SelectContent>
				</Select>
				<p className="text-xs text-[#5A615D]">
					Bruk en eksisterende KSU som utgangspunkt, og tilpass den videre.
				</p>
			</div>

			{sourceNumber && (
				<>
					<div className="space-y-1 max-w-md">
						<Input
							value={wizard.formData.name}
							onChange={(e) => wizard.setMeta({ name: e.target.value })}
							placeholder="Skriv navn på utvalget ..."
							aria-label="Navn på KSU"
						/>
						<NameAvailabilityHint
							name={wizard.formData.name}
							available={wizard.nameAvailable}
							isChecking={wizard.isCheckingName}
						/>
					</div>

					<div className="space-y-1 max-w-md">
						<label className="text-sm font-medium text-[#0F1912]">
							Beskrivelse (valgfritt)
						</label>
						<Textarea
							value={wizard.formData.description}
							onChange={(e) => wizard.setMeta({ description: e.target.value })}
							placeholder="Beskriv KSU ..."
							rows={3}
						/>
					</div>

					<div className="space-y-2 max-w-md">
						<h4 className="text-sm font-semibold text-[#0F1912]">
							Tilpass visning av kildekatalogen
						</h4>
						<p className="text-xs text-[#5A615D]">
							Velg hvilke kategorier fra kilde-KSUen som skal kopieres over.
						</p>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setDrawerOpen(true)}
							className="gap-2">
							<Settings2 className="h-4 w-4" />
							Tilpass kildekatalog
							{selectedCount > 0 && (
								<span className="ml-1 rounded-full bg-[#DCF7E0] px-2 py-0.5 text-xs font-medium text-[#1C6D2C]">
									{selectedCount}
								</span>
							)}
						</Button>
					</div>

					<TilpassKatalogDrawer
						open={drawerOpen}
						onOpenChange={setDrawerOpen}
						mode="existing-ksu"
						sourceAssortmentNumber={sourceNumber}
						initialSelected={wizard.formData.selectedCategoryNumbers}
						onConfirm={wizard.setCategoriesBulk}
					/>
				</>
			)}
		</div>
	);
}
