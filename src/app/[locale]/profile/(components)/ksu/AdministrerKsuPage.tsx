"use client";

/**
 * Admin surface for existing KSUs — accessed via sidebar sub-item
 * "Administrer KSU" (?tab=ksu-admin).
 *
 * Simple list of the user's assortments with per-row actions: Edit (opens
 * the TilpassKatalogDrawer with the KSU's own tree), Export to Excel
 * (direct link to BE), and a quick "Opprett nytt KSU" shortcut back to the
 * creation page.
 *
 * Per product spec, this surface deliberately omits "Hvem er kunden" and
 * "Kunder knyttet til KSU" — those UI blocks are out of scope.
 */

import * as React from "react";

import { Button } from "@/components/ui/button";
import { type Column, DataTable } from "@/components/ui/data-table";
import { useGetAssortments } from "@/hooks/useGetAssortments";
import { useRouter } from "@/i18n/navigation";
import { getExportAssortmentExcelUrl } from "@/services/assortment.service";
import { Download, Pencil, Plus } from "lucide-react";

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

export function AdministrerKsuPage() {
	const router = useRouter();
	const { assortments, isLoading } = useGetAssortments(true);
	const [editing, setEditing] = React.useState<string | null>(null);

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
						aria-label={`Edit ${r.assortmentName}`}>
						<Pencil className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						asChild
						aria-label={`Export ${r.assortmentName}`}>
						<a
							href={getExportAssortmentExcelUrl(r.assortmentNumber)}
							download>
							<Download className="h-4 w-4" />
						</a>
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
					onConfirm={() => {
						// Edit-in-place from the admin surface is a future scope item —
						// for v1 the drawer is read/preview only. Close on confirm.
						setEditing(null);
					}}
				/>
			)}
		</div>
	);
}
