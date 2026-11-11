"use client";

/**
 * "Opprett KSU med egne kategorier" option body.
 *
 * Produces an EMPTY KSU — no source, no category tree. User creates and
 * organizes categories inside tessix.no after creation.
 */

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AssortmentWizardController } from "@/hooks/useAssortmentWizard";

import { NameAvailabilityHint } from "./NameAvailabilityHint";

interface Props {
	wizard: AssortmentWizardController;
}

export function EgneKategorierBody({ wizard }: Props) {
	return (
		<div className="space-y-5 pt-4">
			<p className="text-sm text-[#5A615D]">
				KSU-et opprettes uten kategorier. Du kan opprette og organisere dem
				selv. Passer best for små utvalg.
			</p>

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
		</div>
	);
}
