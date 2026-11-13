"use client";

/**
 * Admin surface for existing KSUs — accessed via sidebar sub-item
 * "Administrer KSU" (?tab=ksu-admin).
 *
 * Layout: 2-column.
 *   Left panel  — searchable, filterable list of the user's KSUs with
 *                 Navn, Kunde count, Produkter, Sist endret columns.
 *                 Row selection drives the right panel.
 *   Right panel — detail for the selected KSU:
 *                 - Header card (name + 3 stats + "Juster denne KSU'en")
 *                 - Beskrivelse (inline-editable, saves via PATCH)
 *                 - Legg til ansvarlig(e) (POST/DELETE user endpoints)
 *                 - Eksporter til Excel
 *
 * Deliberately omits per product spec: status badge (Aktiv/Inaktiv),
 * illustration section, "Hvem er kunden", "Kunder knyttet til KSU". The
 * BE endpoints for those don't exist today anyway; add here when they
 * ship.
 *
 * Delete flow (previously in table rows) still works — moved into the
 * header card's overflow actions.
 */

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
	useAddAssortmentUser,
	useDeleteAssortment,
	useGetAssortmentDetail,
	useRemoveAssortmentUser,
	useSearchUsers,
	useUpdateAssortment,
} from "@/hooks/useAssortmentQueries";
import { useGetAssortments } from "@/hooks/useGetAssortments";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { downloadAssortmentExcel } from "@/services/assortment.service";
import type { AssortmentDetail } from "@/services/assortment.service";
import type { UserSearchResult } from "@/types/assortment.types";
import type { AxiosError } from "axios";
import {
	Download,
	Plus,
	Search,
	Settings2,
	Trash2,
	X,
} from "lucide-react";
import { toast } from "react-toastify";

import { OpprettOgTilpassDrawer } from "./sections/OpprettOgTilpassDrawer";

interface AssortmentListItem {
	assortmentId?: number;
	assortmentNumber: string;
	assortmentName: string;
	nameNo?: string;
	nameEn?: string;
	assortmentDescription?: string | null;
	categoryCount?: number;
	productCount?: number;
	customerCount?: number;
	updatedAt?: string;
}

type FilterMode = "alle" | "kunde" | "status";

export function AdministrerKsuPage() {
	const router = useRouter();
	const { assortments, isLoading } = useGetAssortments(true);
	const [search, setSearch] = React.useState("");
	const [filterMode, setFilterMode] = React.useState<FilterMode>("alle");
	const [selectedNumber, setSelectedNumber] = React.useState<string | null>(
		null,
	);
	const [editing, setEditing] = React.useState<string | null>(null);
	const [pendingDelete, setPendingDelete] = React.useState<{
		assortmentNumber: string;
		assortmentName: string;
	} | null>(null);

	const rows: AssortmentListItem[] = React.useMemo(
		() =>
			(assortments ?? []).map((a: Record<string, any>) => ({
				assortmentId: a.assortmentId,
				assortmentNumber: String(a.assortmentNumber ?? ""),
				assortmentName: String(
					a.nameNo ?? a.assortmentName ?? a.assortmentNumber ?? "",
				),
				nameNo: a.nameNo,
				nameEn: a.nameEn,
				assortmentDescription: a.assortmentDescription,
				categoryCount: a.categoryCount,
				productCount: a.productCount,
				customerCount: a.customerCount,
				updatedAt: a.updatedAt,
			})),
		[assortments],
	);

	// Default the selection to the first row once data lands.
	React.useEffect(() => {
		if (selectedNumber || rows.length === 0) return;
		setSelectedNumber(rows[0].assortmentNumber);
	}, [rows, selectedNumber]);

	const filteredRows = React.useMemo(() => {
		const q = search.trim().toLowerCase();
		return rows.filter((r) => {
			if (filterMode === "kunde" && !(r.customerCount && r.customerCount > 0)) {
				return false;
			}
			if (!q) return true;
			return r.assortmentName.toLowerCase().includes(q);
		});
	}, [rows, search, filterMode]);

	const selectedRow = rows.find((r) => r.assortmentNumber === selectedNumber) ?? null;

	const deleteMutation = useDeleteAssortment();
	const handleConfirmDelete = async () => {
		if (!pendingDelete) return;
		try {
			await deleteMutation.mutateAsync(pendingDelete.assortmentNumber);
			toast.success(`KSU «${pendingDelete.assortmentName}» slettet.`);
			if (selectedNumber === pendingDelete.assortmentNumber) {
				setSelectedNumber(null);
			}
			setPendingDelete(null);
		} catch (err) {
			const ax = err as AxiosError<{ error?: string; users?: number }>;
			if (ax.response?.status === 409 && ax.response.data?.users != null) {
				toast.error(
					`KSU er satt som standard for ${ax.response.data.users} bruker(e) og kan ikke slettes.`,
				);
			} else if (ax.response?.status === 403) {
				toast.error(
					ax.response.data?.error ??
						"Du har ikke tilgang til å slette denne KSUen.",
				);
			} else {
				toast.error("Kunne ikke slette KSU.");
			}
			setPendingDelete(null);
		}
	};

	return (
		<div className="space-y-5">
			<div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
				{/* -------------------- LEFT: list panel -------------------- */}
				<section className="rounded-md border border-[#E5E7E6] bg-white px-6 py-5">
					<div className="flex items-start justify-between gap-3">
						<div>
							<h2 className="text-lg font-semibold text-[#0F1912]">
								Administrer KSU
							</h2>
							<p className="mt-1 text-sm text-[#5A615D]">
								Her velger og administrerer ditt KSU
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

					<div className="mt-5 space-y-3">
						<p className="text-sm text-[#0F1912]">
							Søk hvilken KSU du ønsker å administrere
						</p>
						<div className="flex flex-wrap items-center gap-3">
							<div className="relative min-w-[240px] flex-1">
								<Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#8A8F8C]" />
								<Input
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									placeholder="Søk ..."
									className="pl-9"
								/>
							</div>
							<RadioGroup
								value={filterMode}
								onValueChange={(v) => setFilterMode(v as FilterMode)}
								className="flex items-center gap-4">
								<label className="flex cursor-pointer items-center gap-1.5 text-sm text-[#0F1912]">
									<RadioGroupItem value="alle" />
									Alle
								</label>
								<label className="flex cursor-pointer items-center gap-1.5 text-sm text-[#0F1912]">
									<RadioGroupItem value="kunde" />
									Kunde
								</label>
								<label className="flex cursor-pointer items-center gap-1.5 text-sm text-[#5A615D] opacity-60">
									{/* "Status" filter kept as a disabled visual slot — product
										 doesn't want status in v1, so this is a stub. */}
									<RadioGroupItem
										value="status"
										disabled
									/>
									Status
								</label>
							</RadioGroup>
						</div>
					</div>

					<h3 className="mt-5 text-sm font-semibold text-[#0F1912]">
						Liste over KSU&apos;er ({filteredRows.length})
					</h3>

					<div className="mt-3 overflow-x-auto rounded-md border border-[#E5E7E6]">
						<table className="w-full min-w-[640px] text-sm">
							<thead>
								<tr className="border-b border-[#E5E7E6] bg-[#F8F9F8] text-left text-xs font-semibold tracking-wide text-[#5A615D] uppercase">
									<th className="w-10 px-3 py-2.5"></th>
									<th className="px-3 py-2.5">Navn</th>
									<th className="px-3 py-2.5">Kunde</th>
									<th className="px-3 py-2.5">Produkter</th>
									<th className="px-3 py-2.5">Sist endret</th>
								</tr>
							</thead>
							<tbody>
								{isLoading ? (
									[0, 1, 2, 3].map((i) => (
										<tr key={i}>
											{[0, 1, 2, 3, 4].map((c) => (
												<td
													key={c}
													className="px-3 py-3">
													<Skeleton className="h-4 w-full" />
												</td>
											))}
										</tr>
									))
								) : filteredRows.length === 0 ? (
									<tr>
										<td
											colSpan={5}
											className="px-3 py-6 text-center text-sm text-[#5A615D]">
											Ingen KSU-er funnet.
										</td>
									</tr>
								) : (
									filteredRows.map((row) => {
										const isSelected = row.assortmentNumber === selectedNumber;
										return (
											<tr
												key={row.assortmentNumber}
												onClick={() => setSelectedNumber(row.assortmentNumber)}
												className={cn(
													"cursor-pointer border-b border-[#E5E7E6] last:border-b-0 hover:bg-[#F7F9F8]",
													isSelected && "bg-[#DCF7E0] hover:bg-[#DCF7E0]",
												)}>
												<td className="px-3 py-3">
													<span
														className={cn(
															"inline-flex h-4 w-4 items-center justify-center rounded-full border",
															isSelected
																? "border-[#009640] bg-[#009640]"
																: "border-[#C1C4C2] bg-white",
														)}>
														{isSelected && (
															<span className="h-1.5 w-1.5 rounded-full bg-white" />
														)}
													</span>
												</td>
												<td className="px-3 py-3 font-medium text-[#0F1912]">
													{row.assortmentName}
												</td>
												<td className="px-3 py-3 text-[#0F1912]">
													{row.customerCount != null
														? `${row.customerCount} kunder`
														: "—"}
												</td>
												<td className="px-3 py-3 text-[#0F1912]">
													{row.productCount != null
														? row.productCount.toLocaleString()
														: "—"}
												</td>
												<td className="px-3 py-3 text-[#0F1912]">
													{formatDate(row.updatedAt)}
												</td>
											</tr>
										);
									})
								)}
							</tbody>
						</table>
					</div>
				</section>

				{/* -------------------- RIGHT: detail panel -------------------- */}
				<aside className="space-y-5">
					{selectedRow ? (
						<KsuDetailPanel
							key={selectedRow.assortmentNumber}
							listRow={selectedRow}
							onEditCategories={() => setEditing(selectedRow.assortmentNumber)}
							onDelete={() =>
								setPendingDelete({
									assortmentNumber: selectedRow.assortmentNumber,
									assortmentName: selectedRow.assortmentName,
								})
							}
						/>
					) : (
						<div className="rounded-md border border-dashed border-[#C1C4C2] bg-white px-6 py-10 text-center text-sm text-[#5A615D]">
							Velg en KSU fra listen for å administrere den.
						</div>
					)}
				</aside>
			</div>

			<OpprettOgTilpassDrawer
				open={editing != null}
				onOpenChange={(o) => !o && setEditing(null)}
				assortmentNumber={editing}
			/>

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

// ---------------- Right-side detail panel ---------------- //

interface KsuDetailPanelProps {
	listRow: AssortmentListItem;
	onEditCategories: () => void;
	onDelete: () => void;
}

function KsuDetailPanel({
	listRow,
	onEditCategories,
	onDelete,
}: KsuDetailPanelProps) {
	const { data, isLoading } = useGetAssortmentDetail(listRow.assortmentNumber);
	const updateMutation = useUpdateAssortment();

	// Beskrivelse — inline editable with explicit "Lagre" button so the user
	// can discard by just not clicking save.
	const [description, setDescription] = React.useState(
		listRow.assortmentDescription ?? "",
	);
	React.useEffect(() => {
		setDescription(data?.assortmentDescription ?? listRow.assortmentDescription ?? "");
	}, [data?.assortmentDescription, listRow.assortmentDescription]);

	const descriptionChanged =
		description.trim() !== (data?.assortmentDescription ?? "").trim();

	const handleSaveDescription = async () => {
		try {
			await updateMutation.mutateAsync({
				assortmentNumber: listRow.assortmentNumber,
				body: { assortmentDescription: description.trim() },
			});
			toast.success("Beskrivelse oppdatert.");
		} catch (e) {
			console.error("save description failed", e);
			toast.error("Kunne ikke oppdatere beskrivelse.");
		}
	};

	return (
		<div className="space-y-5">
			<DetailHeaderCard
				listRow={listRow}
				detail={data}
				onEditCategories={onEditCategories}
				onDelete={onDelete}
			/>

			<section className="rounded-md border border-[#E5E7E6] bg-white px-5 py-4">
				<label
					htmlFor="ksu-admin-description"
					className="block text-sm font-semibold text-[#0F1912]">
					Beskrivelse (valgfritt)
				</label>
				<Textarea
					id="ksu-admin-description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Beskriv KSU ..."
					rows={3}
					className="mt-2"
				/>
				{descriptionChanged && (
					<div className="mt-2 flex justify-end gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								setDescription(data?.assortmentDescription ?? "")
							}
							disabled={updateMutation.isPending}>
							Avbryt
						</Button>
						<Button
							variant="greenSolid"
							size="sm"
							onClick={handleSaveDescription}
							disabled={updateMutation.isPending}>
							{updateMutation.isPending ? "Lagrer ..." : "Lagre"}
						</Button>
					</div>
				)}
			</section>

			<AnsvarligeAdminSection
				assortmentNumber={listRow.assortmentNumber}
				administrators={data?.administrators ?? []}
				isLoading={isLoading}
			/>

			<section className="rounded-md border border-[#E5E7E6] bg-white px-5 py-4">
				<h3 className="text-sm font-semibold text-[#0F1912]">
					Eksporter valgt KSU
				</h3>
				<p className="mt-1 text-xs text-[#5A615D]">
					Eksporter valgt KSU-fil for å dennergere produkter og kategorier
					over tid.
				</p>
				<Button
					variant="outlineGreen"
					size="sm"
					className="mt-3 gap-2"
					onClick={async () => {
						try {
							await downloadAssortmentExcel(listRow.assortmentNumber);
						} catch (err) {
							console.error("Failed to download assortment excel", err);
						}
					}}>
					<Download className="h-4 w-4" />
					Eksporter til Excel
				</Button>
			</section>
		</div>
	);
}

function DetailHeaderCard({
	listRow,
	detail,
	onEditCategories,
	onDelete,
}: {
	listRow: AssortmentListItem;
	detail: AssortmentDetail | undefined;
	onEditCategories: () => void;
	onDelete: () => void;
}) {
	const name = detail?.assortmentName ?? listRow.assortmentName;
	const customerCount = listRow.customerCount ?? 0;
	const productCount = detail?.productCount ?? listRow.productCount;
	const categoryCount = detail?.categoryCount ?? listRow.categoryCount;
	const updatedAt = detail?.updatedAt ?? listRow.updatedAt;

	return (
		<section className="rounded-md border border-[#E5E7E6] bg-white px-5 py-4">
			<div className="flex items-start justify-between gap-2">
				<h2 className="text-base font-semibold text-[#0F1912]">{name}</h2>
				<button
					type="button"
					onClick={onDelete}
					aria-label="Slett KSU"
					className="rounded p-1 text-[#B0261A] hover:bg-[#FDE7EA]">
					<Trash2 className="h-4 w-4" />
				</button>
			</div>
			<p className="mt-1 text-sm text-[#5A615D]">
				{customerCount} kunder knyttet til denne KSU&apos;en
			</p>
			<dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
				<div>
					<dt className="text-xs text-[#5A615D]">Produkter</dt>
					<dd className="font-semibold text-[#0F1912]">
						{productCount != null ? productCount.toLocaleString() : "—"}
					</dd>
				</div>
				<div>
					<dt className="text-xs text-[#5A615D]">Kategorier</dt>
					<dd className="font-semibold text-[#0F1912]">
						{categoryCount != null ? categoryCount.toLocaleString() : "—"}
					</dd>
				</div>
				<div>
					<dt className="text-xs text-[#5A615D]">Sist endret</dt>
					<dd className="font-semibold text-[#0F1912]">
						{formatDate(updatedAt)}
					</dd>
				</div>
			</dl>
			<div className="mt-3">
				<Button
					variant="outlineGreen"
					size="sm"
					onClick={onEditCategories}
					className="gap-2">
					<Settings2 className="h-4 w-4" />
					Juster denne KSU&apos;en
				</Button>
			</div>
		</section>
	);
}

// ---------------- Ansvarlige admin section ---------------- //

function AnsvarligeAdminSection({
	assortmentNumber,
	administrators,
	isLoading,
}: {
	assortmentNumber: string;
	administrators: Array<{ userId: number; name: string; email?: string }>;
	isLoading: boolean;
}) {
	const [query, setQuery] = React.useState("");
	const [open, setOpen] = React.useState(false);
	const { results, isSearching } = useSearchUsers(query);
	const addMutation = useAddAssortmentUser();
	const removeMutation = useRemoveAssortmentUser();

	// Local map of userId → role so the dropdowns stay responsive while
	// the mutation is in flight. Hydrated from the backend list on each
	// detail refetch, then re-mirrored to BE on toggle.
	const [roleOverrides, setRoleOverrides] = React.useState<Record<number, boolean>>(
		{},
	);

	const selectedIds = new Set(administrators.map((a) => a.userId));

	const handleAdd = async (u: UserSearchResult) => {
		setQuery("");
		setOpen(false);
		try {
			await addMutation.mutateAsync({
				assortmentNumber,
				grants: [{ userId: u.userId, canAdminister: false }],
			});
			toast.success(`${formatUser(u)} lagt til.`);
		} catch (e) {
			console.error("add user failed", e);
			toast.error("Kunne ikke legge til bruker.");
		}
	};

	const handleRemove = async (userId: number, name: string) => {
		try {
			await removeMutation.mutateAsync({ assortmentNumber, userId });
			toast.success(`${name} fjernet.`);
		} catch (e) {
			console.error("remove user failed", e);
			toast.error("Kunne ikke fjerne bruker.");
		}
	};

	const handleRoleChange = (userId: number, canAdminister: boolean) => {
		setRoleOverrides((prev) => ({ ...prev, [userId]: canAdminister }));
		// TODO BE: no dedicated endpoint to flip canAdminister on an existing
		// grant — on BE today we'd have to removeUser then re-postUser.
		// For now this is a local hint until BE exposes an upsert path.
	};

	return (
		<section className="rounded-md border border-[#E5E7E6] bg-white px-5 py-4">
			<h3 className="text-sm font-semibold text-[#0F1912]">
				Legg til ansvarlig(e)
			</h3>
			<p className="mt-1 text-xs text-[#5A615D]">
				Søk opp og legg til én eller flere ansvarlige for denne KSUen.
			</p>

			<div className="relative mt-3 max-w-md">
				<Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#8A8F8C]" />
				<Input
					value={query}
					placeholder="Søk etter person ..."
					onChange={(e) => {
						setQuery(e.target.value);
						setOpen(true);
					}}
					onFocus={() => query.length >= 2 && setOpen(true)}
					className="pl-9"
				/>
				{open && query.length >= 2 && (
					<div className="absolute top-full right-0 left-0 z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-[#E5E7E6] bg-white shadow-md">
						{isSearching ? (
							<div className="px-3 py-2 text-sm text-[#5A615D]">Søker ...</div>
						) : results.length === 0 ? (
							<div className="px-3 py-2 text-sm text-[#5A615D]">
								Ingen treff for &ldquo;{query}&rdquo;
							</div>
						) : (
							<ul>
								{results.map((u) => {
									const already = selectedIds.has(u.userId);
									return (
										<li key={u.userId}>
											<button
												type="button"
												disabled={already}
												onClick={() => handleAdd(u)}
												className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm hover:bg-[#F3F4F3] disabled:opacity-50 disabled:hover:bg-transparent">
												<span className="font-medium text-[#0F1912]">
													{formatUser(u)}
													{already && (
														<span className="ml-2 text-xs text-[#5A615D]">
															(allerede lagt til)
														</span>
													)}
												</span>
												{u.email && (
													<span className="text-xs text-[#5A615D]">
														{u.email}
													</span>
												)}
											</button>
										</li>
									);
								})}
							</ul>
						)}
					</div>
				)}
			</div>

			<h4 className="mt-4 text-sm font-medium text-[#0F1912]">
				Ansvarlige lagt til ({administrators.length})
			</h4>

			{isLoading ? (
				<ul className="mt-2 space-y-2">
					{[0, 1].map((i) => (
						<li key={i}>
							<Skeleton className="h-14 w-full rounded-md" />
						</li>
					))}
				</ul>
			) : administrators.length === 0 ? (
				<p className="mt-2 text-sm text-[#5A615D]">
					Ingen ansvarlige lagt til enda.
				</p>
			) : (
				<ul className="mt-2 space-y-2">
					{administrators.map((a) => {
						const isAdmin = roleOverrides[a.userId] ?? false;
						return (
							<li
								key={a.userId}
								className="flex items-center justify-between gap-3 rounded-md border border-[#E5E7E6] bg-white px-3 py-2">
								<div className="flex flex-col">
									<span className="text-sm font-medium text-[#0F1912]">
										{a.name}
									</span>
									{a.email && (
										<span className="text-xs text-[#5A615D]">{a.email}</span>
									)}
								</div>
								<div className="flex items-center gap-2">
									<Select
										value={isAdmin ? "admin" : "role"}
										onValueChange={(v) =>
											handleRoleChange(a.userId, v === "admin")
										}>
										<SelectTrigger className="h-9 w-[150px] bg-white text-sm">
											<SelectValue placeholder="Velg rolle ..." />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="role">Velg rolle ...</SelectItem>
											<SelectItem value="admin">Administrator</SelectItem>
										</SelectContent>
									</Select>
									<button
										type="button"
										onClick={() => handleRemove(a.userId, a.name)}
										aria-label={`Fjern ${a.name}`}
										disabled={removeMutation.isPending}
										className="rounded p-1 text-[#5A615D] hover:bg-[#F3F4F3] hover:text-[#0F1912]">
										<X className="h-4 w-4" />
									</button>
								</div>
							</li>
						);
					})}
				</ul>
			)}
		</section>
	);
}

function formatUser(u: UserSearchResult): string {
	return [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
}

// `12.07.2025` per Figma.
function formatDate(raw: string | undefined | null): string {
	if (!raw) return "—";
	const d = new Date(raw);
	if (Number.isNaN(d.getTime())) return "—";
	const day = String(d.getUTCDate()).padStart(2, "0");
	const month = String(d.getUTCMonth() + 1).padStart(2, "0");
	const year = d.getUTCFullYear();
	return `${day}.${month}.${year}`;
}
