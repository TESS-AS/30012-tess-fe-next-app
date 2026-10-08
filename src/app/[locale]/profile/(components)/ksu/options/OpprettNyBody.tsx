"use client";

/**
 * "Opprett ny KSU" option body.
 *
 * Spec constraint: the tree menu for this option is ALWAYS the TESS catalog
 * (DEFAULT_SALES_NEW) — hardcoded here, no source picker. Illustration
 * selection is intentionally OUT of scope for v1 per product requirement.
 */

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AssortmentWizardController } from "@/hooks/useAssortmentWizard";
import { Settings2 } from "lucide-react";

import { NameAvailabilityHint } from "./NameAvailabilityHint";
import { TilpassKatalogDrawer } from "../sections/TilpassKatalogDrawer";

interface Props {
	wizard: AssortmentWizardController;
}

export function OpprettNyBody({ wizard }: Props) {
	const [drawerOpen, setDrawerOpen] = React.useState(false);
	const selectedCount = wizard.formData.selectedCategoryNumbers.size;

	return (
		<div className="space-y-5 pt-4">
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
					Tilpass visning av Tessix-katalogen
				</h4>
				<p className="text-xs text-[#5A615D]">
					KSU-et opprettes med standard kategorier og underkategorier fra TESSIX.
				</p>
				<Button
					variant="outline"
					size="sm"
					onClick={() => setDrawerOpen(true)}
					className="gap-2">
					<Settings2 className="h-4 w-4" />
					Tilpass TESS katalogutvalg
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
				mode="catalog"
				initialSelected={wizard.formData.selectedCategoryNumbers}
				onConfirm={wizard.setCategoriesBulk}
			/>
		</div>
	);
}
