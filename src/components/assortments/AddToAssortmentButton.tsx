"use client";

/**
 * "Legg til i sortilog" — reusable action button for product detail and
 * cart pages. Shows a dropdown of the current user's assortments + a
 * "+ Opprett ny KSU" shortcut that routes to the KSU creation page.
 *
 * Feature-gated: only admin + superuser see this button. Non-privileged
 * users get `null`.
 *
 * Drop-in usage:
 *
 *     <AddToAssortmentButton productNumbers={[product.productNumber]} />
 *     <AddToAssortmentButton itemNumbers={cart.items.map(i => i.itemNumber)} />
 */

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { USER_ROLES } from "@/constants/userRoles";
import { useAddProductsToAssortment } from "@/hooks/useAssortmentQueries";
import { useGetAssortments } from "@/hooks/useGetAssortments";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import { useRouter } from "@/i18n/navigation";
import { BookOpen, Plus } from "lucide-react";
import { toast } from "react-toastify";

interface Props {
	productNumbers?: string[];
	itemNumbers?: string[];
	className?: string;
	/** Overrides the default "Legg til i sortilog" label (e.g. "Legg valgte
	 *  varer fra handlekurven i KSU" on the cart page). */
	label?: string;
}

export function AddToAssortmentButton({
	productNumbers,
	itemNumbers,
	className,
	label = "Legg til i sortilog",
}: Props) {
	const router = useRouter();
	const { data: profile } = useGetProfileData();
	const isPrivileged =
		profile?.role === USER_ROLES.ADMIN ||
		profile?.role === USER_ROLES.SUPERUSER;

	const { assortments, isLoading } = useGetAssortments(isPrivileged);
	const addMutation = useAddProductsToAssortment();

	if (!isPrivileged) return null;

	const items = (assortments ?? []) as Array<{
		assortmentNumber?: string;
		assortmentName?: string;
		nameNo?: string;
	}>;

	const hasPayload =
		(productNumbers?.length ?? 0) + (itemNumbers?.length ?? 0) > 0;

	const handleAdd = async (assortmentNumber: string) => {
		if (!hasPayload) {
			toast.error("Ingen varer å legge til.");
			return;
		}
		try {
			await addMutation.mutateAsync({
				assortmentNumber,
				payload: { productNumbers, itemNumbers },
			});
			toast.success("Lagt til i sortilog.");
		} catch (e) {
			console.error("add to assortment failed", e);
			toast.error("Kunne ikke legge til i sortilog.");
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className={className}
					disabled={addMutation.isPending || isLoading}>
					<BookOpen className="mr-2 h-4 w-4" />
					{label}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="w-64">
				{items.length === 0 ? (
					<div className="px-2 py-2 text-sm text-[#5A615D]">
						{isLoading ? "Laster ..." : "Ingen KSU-er tilgjengelige."}
					</div>
				) : (
					items.map((a) => {
						const number = a.assortmentNumber;
						if (!number) return null;
						const name = a.nameNo || a.assortmentName || number;
						return (
							<DropdownMenuItem
								key={number}
								onSelect={() => handleAdd(number)}
								disabled={!hasPayload || addMutation.isPending}>
								{name}
							</DropdownMenuItem>
						);
					})
				)}
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onSelect={() => router.push("/profile?tab=ksu-create")}
					className="text-[#1C6D2C]">
					<Plus className="mr-2 h-4 w-4" />
					Opprett ny KSU
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
