"use client";

/**
 * Admin surface for existing KSUs — accessed via sidebar sub-item
 * "Administrer KSU" (?tab=ksu-admin).
 *
 * Row actions: Edit (opens the TilpassKatalogDrawer with the KSU's own tree
 * — on confirm, PATCH with source=self so the picked set becomes the new
 * category tree); Export to Excel (direct link to BE); Delete (confirm
 * dialog, handles the 409 "KSU is set as default for N users" response).
 *
 * Per product spec, this surface deliberately omits "Hvem er kunden" and
 * "Kunder knyttet til KSU" — those UI blocks are out of scope.
 */

import * as React from "react";

import { Button } from "@/components/ui/button";
import { type Column, DataTable } from "@/components/ui/data-table";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	useDeleteAssortment,
	useUpdateAssortment,
} from "@/hooks/useAssortmentQueries";
import { useGetAssortments } from "@/hooks/useGetAssortments";
import { useRouter } from "@/i18n/navigation";
import { getExportAssortmentExcelUrl } from "@/services/assortment.service";
import type { AxiosError } from "axios";
import { Download, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

import { TilpassKatalogDrawer } from "./sections/TilpassKatalogDrawer";

interface AssortmentRow {
	orderId: string; // DataTable wants `orderId` on T
	assortmentNumber: string;
	assortmentName: string;
	nameNo?: string;
	nameEn?: string;
	assortmentDescription?: string | null;
	categoryCount?: number;
	productCount?: number;
}

interface DeletePending {
	assortmentNumber: string;
	assortmentName: string;
}

export function AdministrerKsuPage() {
	const router = useRouter();
	const { assortments, isLoading } = useGetAssortments(true);
	const [editing, setEditing] = React.useState<string | null>(null);
	const [pendingDelete, setPendingDelete] =
		React.useState<DeletePending | null>(null);

	const updateMutation = useUpdateAssortment();
	const deleteMutation = useDeleteAssortment();

	const rows: AssortmentRow[] = React.useMemo(
		() =>
			(assortments ?? []).map((a: Record<string, any>) => ({
				orderId: String(a.assortmentNumber ?? a.assortmentId ?? ""),
				assortmentNumber: String(a.assortmentNumber ?? ""),
				assortmentName: String(
					a.nameNo ?? a.assortmentName ?? a.assortmentNumber ?? "",
				),
				nameNo: a.nameNo,
				nameEn: a.nameEn,
				assortmentDescription: a.assortmentDescription,
				categoryCount: a.categoryCount,
				productCount: a.productCount,
			})),
		[assortments],
	);

	const handleConfirmEdit = async (selectedCategoryNumbers: Set<string>) => {
		if (!editing) return;
		try {
			await updateMutation.mutateAsync({
				assortmentNumber: editing,
				body: {
					// Source = self so BE prunes the current tree down to the picked
					// set. If the user wants to copy from another source, they go
					// through the create wizard instead.
					sourceAssortmentNumber: editing,
					selectedCategoryNumbers: Array.from(selectedCategoryNumbers),
				},
			});
			toast.success("KSU oppdatert.");
			setEditing(null);
		} catch (err) {
			console.error("update KSU failed", err);
			toast.error("Kunne ikke oppdatere KSU.");
		}
	};

	const handleConfirmDelete = async () => {
		if (!pendingDelete) return;
		try {
			await deleteMutation.mutateAsync(pendingDelete.assortmentNumber);
			toast.success(`KSU «${pendingDelete.assortmentName}» slettet.`);
			setPendingDelete(null);
		} catch (err) {
			const ax = err as AxiosError<{ error?: string; users?: number }>;
			// BE returns 409 { users: N } when any user has this KSU as their
			// default_assortment_id. Surface that count instead of a generic
			// error so the user understands why it's blocked.
			if (ax.response?.status === 409 && ax.response.data?.users != null) {
				toast.error(
					`KSU er satt som standard for ${ax.response.data.users} bruker(e) og kan ikke slettes.`,
				);
			} else if (ax.response?.status === 403) {
				toast.error(
					ax.response.data?.error ?? "Du har ikke tilgang til å slette denne KSUen.",
				);
			} else {
				toast.error("Kunne ikke slette KSU.");
			}
			setPendingDelete(null);
		}
	};

	const columns: Column<AssortmentRow>[] = [
		{
			key: "assortmentName",
			header: "KSU",
			cell: (r) => <span className="font-medium">{r.assortmentName}</span>,
		},
		{
			key: "assortmentNumber",
			header: "Nummer",
			cell: (r) => r.assortmentNumber || "—",
		},
		{
			key: "description",
			header: "Beskrivelse",
			cell: (r) => r.assortmentDescription || "—",
		},
		{
			key: "categoryCount",
			header: "Kategorier",
			cell: (r) =>
				r.categoryCount != null ? r.categoryCount.toLocaleString() : "—",
		},
		{
			key: "productCount",
			header: "Produkter",
			cell: (r) =>
				r.productCount != null ? r.productCount.toLocaleString() : "—",
		},
		{
			key: "actions",
			header: "",
			cell: (r) => (
				<div className="flex items-center justify-end gap-1">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setEditing(r.assortmentNumber)}
						aria-label={`Rediger ${r.assortmentName}`}>
						<Pencil className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						asChild
						aria-label={`Eksporter ${r.assortmentName}`}>
						<a
							href={getExportAssortmentExcelUrl(r.assortmentNumber)}
							download>
							<Download className="h-4 w-4" />
						</a>
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							setPendingDelete({
								assortmentNumber: r.assortmentNumber,
								assortmentName: r.assortmentName,
							})
						}
						aria-label={`Slett ${r.assortmentName}`}
						className="text-[#B0261A] hover:bg-[#FDE7EA] hover:text-[#B0261A]">
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			),
		},
	];

	return (
		<div className="space-y-5">
			<div className="rounded-md border border-[#E5E7E6] bg-white px-6 py-5">
				<div className="flex items-start justify-between gap-3">
					<div>
						<h2 className="text-lg font-semibold text-[#0F1912]">
							Administrer KSU
						</h2>
						<p className="mt-1 text-sm text-[#5A615D]">
							Rediger kategoristruktur, eksporter til Excel, eller opprett et
							nytt KSU.
						</p>
					</div>
					<Button
						variant="greenSolid"
						onClick={() => router.push("/profile?tab=ksu-create")}
						className="gap-2">
						<Plus className="h-4 w-4" />
						Opprett nytt KSU
					</Button>
				</div>

				<div className="mt-5">
					<DataTable<AssortmentRow>
						data={rows}
						columns={columns}
						isLoading={isLoading}
						emptyMessage="Ingen KSU-er funnet. Opprett ett for å komme i gang."
						currentPage={1}
						totalPages={1}
						totalItems={rows.length}
						itemsPerPage={Math.max(rows.length, 1)}
					/>
				</div>
			</div>

			{editing && (
				<TilpassKatalogDrawer
					open
					onOpenChange={(o) => !o && setEditing(null)}
					mode="existing-ksu"
					sourceAssortmentNumber={editing}
					initialSelected={new Set()}
					onConfirm={handleConfirmEdit}
				/>
			)}

			<Dialog
				open={pendingDelete != null}
				onOpenChange={(o) => !o && setPendingDelete(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Slette KSU?</DialogTitle>
						<DialogDescription>
							Du er i ferd med å slette <b>{pendingDelete?.assortmentName}</b>.
							Alle kategorier, produkttilknytninger og tilganger fjernes. Dette
							kan ikke angres.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setPendingDelete(null)}
							disabled={deleteMutation.isPending}>
							Avbryt
						</Button>
						<Button
							variant="destructive"
							onClick={handleConfirmDelete}
							disabled={deleteMutation.isPending}>
							{deleteMutation.isPending ? "Sletter ..." : "Slett KSU"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
