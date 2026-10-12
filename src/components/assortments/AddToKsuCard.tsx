"use client";

/**
 * "Legg til i KSU" — reusable card for the two entry points surfaced to
 * admins/superusers:
 *   1. Product detail page — add the currently selected product to a KSU.
 *   2. Cart sidebar — add the entire cart in one shot.
 *
 * Visually both are the same card from the Figma: a label, a select of
 * the user's existing KSUs, a primary green "Legg … i KSU" button, and a
 * secondary outline-green "+ Opprett nytt KSU" link that routes to the
 * create wizard.
 *
 * `stacked` controls layout: horizontal (dropdown + buttons in a row) for
 * the product page, vertical (dropdown then buttons stacked) for the cart
 * sidebar which is width-constrained.
 *
 * Visibility: silently returns `null` for anyone without admin/superuser
 * role so the card doesn't leak into non-privileged flows.
 */

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { USER_ROLES } from "@/constants/userRoles";
import { useAddProductsToAssortment } from "@/hooks/useAssortmentQueries";
import { useGetAssortments } from "@/hooks/useGetAssortments";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Plus, ShoppingCart } from "lucide-react";
import { toast } from "react-toastify";

interface Props {
	productNumbers?: string[];
	itemNumbers?: string[];
	/** Button copy — e.g. "Legg vare i KSU" (product page) or
	 *  "Legg alle varer fra handlekurven i KSU" (cart sidebar). */
	actionLabel: string;
	/** `true` for the cart sidebar (stacks dropdown + buttons vertically),
	 *  `false` for the product page (dropdown + buttons on the same row). */
	stacked?: boolean;
	className?: string;
	disabled?: boolean;
}

export function AddToKsuCard({
	productNumbers,
	itemNumbers,
	actionLabel,
	stacked = false,
	className,
	disabled = false,
}: Props) {
	const router = useRouter();
	const { data: profile } = useGetProfileData();
	const isPrivileged =
		profile?.role === USER_ROLES.ADMIN ||
		profile?.role === USER_ROLES.SUPERUSER;

	const [selected, setSelected] = React.useState("");
	const { assortments, isLoading } = useGetAssortments(isPrivileged);
	const addMutation = useAddProductsToAssortment();

	if (!isPrivileged) return null;

	const items = (assortments ?? []) as Array<Record<string, any>>;
	const hasPayload =
		(productNumbers?.length ?? 0) + (itemNumbers?.length ?? 0) > 0;

	const handleAdd = async () => {
		if (!selected || !hasPayload) {
			toast.error(
				!selected ? "Velg et KSU først." : "Ingen varer å legge til.",
			);
			return;
		}
		try {
			await addMutation.mutateAsync({
				assortmentNumber: selected,
				payload: { productNumbers, itemNumbers },
			});
			toast.success("Lagt til i KSU.");
		} catch (e) {
			console.error("add to KSU failed", e);
			toast.error("Kunne ikke legge til i KSU.");
		}
	};

	const dropdown = (
		<Select
			value={selected}
			onValueChange={setSelected}
			disabled={disabled || isLoading}>
			<SelectTrigger className="bg-white">
				<SelectValue placeholder={isLoading ? "Laster ..." : "Velg KSU ..."} />
			</SelectTrigger>
			<SelectContent>
				{items.map((a) => {
					const num = a.assortmentNumber as string | undefined;
					if (!num) return null;
					const label =
						(a.nameNo as string | undefined) ??
						(a.assortmentName as string | undefined) ??
						num;
					return (
						<SelectItem
							key={num}
							value={num}>
							{label}
						</SelectItem>
					);
				})}
			</SelectContent>
		</Select>
	);

	const primaryButton = (
		<Button
			variant="greenSolid"
			onClick={handleAdd}
			disabled={
				disabled || !selected || !hasPayload || addMutation.isPending
			}
			className={cn("gap-2", stacked && "w-full")}>
			<ShoppingCart className="h-4 w-4" />
			{addMutation.isPending ? "Legger til ..." : actionLabel}
		</Button>
	);

	const createButton = (
		<Button
			variant="outlineGreen"
			onClick={() => router.push("/profile?tab=ksu-create")}
			className={cn("gap-2", stacked && "w-full")}>
			<Plus className="h-4 w-4" />
			Opprett nytt KSU
		</Button>
	);

	return (
		<div
			className={cn(
				"rounded-md border border-[#C1C4C2] bg-white px-4 py-3",
				className,
			)}>
			<label className="mb-2 block text-sm text-[#0F1912]">
				Velg kundespesifikt utvalg (KSU)
			</label>
			{stacked ? (
				<div className="space-y-2">
					{dropdown}
					{primaryButton}
					{createButton}
				</div>
			) : (
				<div className="flex flex-wrap items-center gap-2">
					<div className="min-w-[180px] flex-1">{dropdown}</div>
					{primaryButton}
					{createButton}
				</div>
			)}
		</div>
	);
}
