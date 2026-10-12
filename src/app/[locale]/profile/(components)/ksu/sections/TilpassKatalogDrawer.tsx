"use client";

/**
 * Side drawer for customizing the KSU category tree.
 *
 * Opens from the "Tilpass TESS katalogutvalg" button inside the "Opprett ny"
 * and "Kopier eksisterende" option bodies. Data source depends on which
 * option the user picked:
 *   - "new"  → `useGetCatalogStructure()` returns DEFAULT_SALES_NEW
 *   - "copy" → `useGetAssortmentStructure(sourceAssortmentNumber)` returns
 *              the full tree of the user's chosen source KSU
 *
 * UX decisions baked in to match the Figma spec:
 *
 *   - Legend banner at the top explains the three checkbox states so a user
 *     who sees a mix of ticks/dashes immediately knows what they mean.
 *
 *   - Four action pills sit above the search, instead of a footer with
 *     Avbryt/Lagre. "Bruk valg" is the primary commit action (equivalent
 *     to the old Lagre). "Nullstill valg" reverts to whatever selection
 *     was passed in as `initialSelected` without closing the drawer.
 *     "Tøm alle kategorier" / "Lete alle kategorier" are bulk toggles.
 *
 *   - "Produktoppdateringer kjøres for kategorier inkludert automatisk"
 *     is a UI-only hint today — BE doesn't yet persist this preference.
 *     Kept in the DOM per Figma; wire to a form field when BE adds one.
 *
 *   - "Start uten valgte kategorier" is a shortcut: clears the selection
 *     and commits an empty set, closing the drawer. Semantically "I want
 *     an empty KSU to start from" without having to untick everything.
 *
 *   - The root display shows "`<N>` av `<N>` kategorier inkludert" by
 *     counting all nodes beneath the first root.
 */

import * as React from "react";

import { Button } from "@/components/ui/button";
import { CategoryTree } from "@/components/ui/category-tree";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
	useGetAssortmentStructure,
	useGetCatalogStructure,
} from "@/hooks/useAssortmentQueries";
import { useCategoryTreeSelection } from "@/hooks/useCategoryTreeSelection";
import type { AssortmentNode } from "@/types/assortment.types";
import {
	BookOpen,
	Check,
	CircleX,
	Maximize2,
	Minus,
	RotateCcw,
	Search,
	X,
} from "lucide-react";

export interface TilpassKatalogDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Which data source to load: catalog (DEFAULT_SALES_NEW) or an existing KSU. */
	mode: "catalog" | "existing-ksu";
	/** Required when mode === "existing-ksu". */
	sourceAssortmentNumber?: string | null;
	initialSelected: Set<string>;
	onConfirm: (next: Set<string>) => void;
}

export function TilpassKatalogDrawer({
	open,
	onOpenChange,
	mode,
	sourceAssortmentNumber,
	initialSelected,
	onConfirm,
}: TilpassKatalogDrawerProps) {
	const catalogQuery = useGetCatalogStructure(open && mode === "catalog");
	const existingQuery = useGetAssortmentStructure(
		open && mode === "existing-ksu" ? sourceAssortmentNumber ?? null : null,
	);

	const rootNodes = React.useMemo<AssortmentNode[]>(() => {
		if (mode === "catalog") return catalogQuery.data?.categories ?? [];
		return existingQuery.data ?? [];
	}, [mode, catalogQuery.data, existingQuery.data]);

	const isLoading =
		mode === "catalog" ? catalogQuery.isLoading : existingQuery.isLoading;

	// Fresh selection buffer each time the drawer opens. Keeps "Avbryt" working
	// without pushing the user's temporary ticks back into the wizard state.
	const [draftSelected, setDraftSelected] = React.useState<Set<string>>(
		() => new Set(initialSelected),
	);
	React.useEffect(() => {
		if (open) setDraftSelected(new Set(initialSelected));
	}, [open, initialSelected]);

	const selection = useCategoryTreeSelection<AssortmentNode>({
		rootNodes,
		getNodeId: (n) => n.assortmentNumber,
		getNodeChildren: (n) => n.children,
		selectedIds: draftSelected,
		onChange: setDraftSelected,
	});

	const [searchTerm, setSearchTerm] = React.useState("");
	const [autoUpdates, setAutoUpdates] = React.useState(true);

	// Count every node in the tree so the root display can show
	// "N av N kategorier inkludert" (selected vs total).
	const totalNodeCount = React.useMemo(() => {
		let n = 0;
		const walk = (nodes: AssortmentNode[]) => {
			for (const node of nodes) {
				n += 1;
				if (node.children?.length) walk(node.children);
			}
		};
		walk(rootNodes);
		return n;
	}, [rootNodes]);

	// Expand the first root by default so the user sees sub-categories
	// landing on the drawer rather than needing to click to open it.
	const firstRootId = rootNodes[0]?.assortmentNumber;
	const [expandedIds, setExpandedIds] = React.useState<Set<string>>(
		() => new Set(),
	);
	React.useEffect(() => {
		if (!firstRootId) return;
		setExpandedIds((prev) => {
			if (prev.has(firstRootId)) return prev;
			const next = new Set(prev);
			next.add(firstRootId);
			return next;
		});
	}, [firstRootId]);

	// Collect every parent node id in the tree so "Åpne alle kategoriene"
	// can snap-expand everything at once. Leaves aren't included since
	// expanding them is a no-op.
	const allExpandableIds = React.useMemo(() => {
		const out = new Set<string>();
		const walk = (nodes: AssortmentNode[]) => {
			for (const n of nodes) {
				if (n.children?.length) {
					out.add(n.assortmentNumber);
					walk(n.children);
				}
			}
		};
		walk(rootNodes);
		return out;
	}, [rootNodes]);

	const handleExpandAll = () => setExpandedIds(new Set(allExpandableIds));
	const handleCollapseAll = () => setExpandedIds(new Set());

	const commit = (next: Set<string>) => {
		onConfirm(next);
		onOpenChange(false);
	};

	const handleResetToInitial = () =>
		setDraftSelected(new Set(initialSelected));

	// Checkbox: "Start uten valgte kategorier" — purely UI state until
	// toggled, so the user can tick it and then confirm with "Bruk valg".
	// Not a commit shortcut (the design renders it as a checkbox, not a
	// button).
	const [startEmpty, setStartEmpty] = React.useState(false);
	React.useEffect(() => {
		if (open) setStartEmpty(false);
	}, [open]);

	const handleCommit = () => {
		commit(startEmpty ? new Set() : new Set(draftSelected));
	};

	const title =
		mode === "catalog" ? "Tilpass TESS katalog" : "Tilpass kildekatalog";

	return (
		<Sheet
			open={open}
			onOpenChange={onOpenChange}>
			<SheetContent
				side="right"
				className="flex w-full flex-col gap-0 p-0 sm:max-w-[680px] [&>button]:hidden">
				{/* ---------------- Header ---------------- */}
				<div className="flex items-start justify-between border-b border-[#E5E7E6] px-5 pt-5 pb-4">
					<SheetTitle className="text-lg font-semibold text-[#0F1912]">
						{title}
					</SheetTitle>
					<SheetDescription className="sr-only">
						Velg hvilke kategorier som skal inngå i KSU-et.
					</SheetDescription>
					<div className="flex items-center gap-2 text-[#5A615D]">
						<button
							type="button"
							aria-label="Fullscreen"
							className="rounded p-1 hover:bg-[#F3F4F3] hover:text-[#0F1912]">
							<Maximize2 className="h-4 w-4" />
						</button>
						<button
							type="button"
							onClick={() => onOpenChange(false)}
							aria-label="Lukk"
							className="rounded p-1 hover:bg-[#F3F4F3] hover:text-[#0F1912]">
							<X className="h-4 w-4" />
						</button>
					</div>
				</div>

				{/* ---------------- Legend banner ---------------- */}
				<div className="border-b border-[#E5E7E6] bg-[#EFF9F1] px-5 py-3 text-xs">
					<p className="mb-2 font-medium text-[#0F1912]">
						Alle kategorier er valgt i KSU-et. Fjern dem du ikke vil ha.
					</p>
					<ul className="space-y-1.5 text-[#1C6D2C]">
						<li className="flex items-center gap-2">
							<span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-[#009640] text-white">
								<Check className="h-3 w-3" />
							</span>
							Alle kategorier er valgt.
						</li>
						<li className="flex items-center gap-2">
							<span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-[#8A8F8C] bg-white" />
							Fjern kategorier du ikke vil ha.
						</li>
						<li className="flex items-center gap-2">
							<span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-[#009640] text-white">
								<Minus className="h-3 w-3" />
							</span>
							Delvis valgt, med underkategorier er fjernet.
						</li>
					</ul>
				</div>

				{/* ---------------- Toolbar card (actions + checkboxes) ----------
					The whole block is wrapped in a bordered rounded card and
					sits visually detached from the legend banner above it.

					Button semantics (Figma):
					  "Åpne alle kategoriene"   = expand ALL tree nodes
					  "Lukk alle kategoriene"   = collapse ALL tree nodes
					  "Nullstill valg"          = revert draft to initialSelected
					  "Bruk valg" (greenSolid)  = commit draft + close drawer
				---------------- */}
				<div className="border-b border-[#E5E7E6] px-5 py-3">
					<div className="rounded-md border border-[#E5E7E6] bg-white px-3 py-3 shadow-sm">
						<div className="flex min-w-0 items-center gap-1.5">
							<Button
								variant="outlineGreen"
								size="sm"
								onClick={handleExpandAll}
								className="h-8 shrink-0 gap-1.5 px-2 text-xs">
								<BookOpen className="h-3.5 w-3.5" />
								Åpne alle kategoriene
							</Button>
							<Button
								variant="outlineGreen"
								size="sm"
								onClick={handleCollapseAll}
								className="h-8 shrink-0 gap-1.5 px-2 text-xs">
								<CircleX className="h-3.5 w-3.5" />
								Lukk alle kategoriene
							</Button>
							<Button
								variant="outlineGreen"
								size="sm"
								onClick={handleResetToInitial}
								className="h-8 shrink-0 gap-1.5 px-2 text-xs">
								<RotateCcw className="h-3.5 w-3.5" />
								Nullstill valg
							</Button>
							<Button
								variant="greenSolid"
								size="sm"
								onClick={handleCommit}
								disabled={isLoading || rootNodes.length === 0}
								className="ml-auto h-8 shrink-0 gap-1.5 px-2 text-xs">
								<Check className="h-3.5 w-3.5" />
								Bruk valg
							</Button>
						</div>

						<div className="mt-3 space-y-2 text-sm">
							<label className="flex items-start gap-2 text-[#0F1912]">
								<Checkbox
									checked={autoUpdates}
									onCheckedChange={(v) => setAutoUpdates(v === true)}
									className="mt-0.5"
								/>
								<span>
									Produktoppdateringer i valgte kategorier inkluderes
									automatisk.
								</span>
							</label>
							<label className="flex items-start gap-2 text-[#0F1912]">
								<Checkbox
									checked={startEmpty}
									onCheckedChange={(v) => setStartEmpty(v === true)}
									className="mt-0.5"
								/>
								<span>Start uten valgte kategorier</span>
							</label>
						</div>
					</div>
				</div>

				{/* ---------------- Search ---------------- */}
				<div className="border-b border-[#E5E7E6] px-5 py-3">
					<div className="relative">
						<Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#8A8F8C]" />
						<Input
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Søk eller skriv ..."
							className="pl-9"
						/>
					</div>
				</div>

				{/* ---------------- Root count + tree ---------------- */}
				<div className="flex-1 overflow-y-auto px-5 py-3">
					{isLoading ? (
						<div className="space-y-2">
							{[0, 1, 2, 3, 4, 5].map((i) => (
								<Skeleton
									key={i}
									className="h-8 w-full"
								/>
							))}
						</div>
					) : rootNodes.length === 0 ? (
						<p className="pt-6 text-center text-sm text-[#5A615D]">
							Ingen kategorier tilgjengelige.
						</p>
					) : (
						<>
							{mode === "catalog" && (
								<div className="mb-3 border-b border-[#E5E7E6] pb-2">
									<p className="text-sm font-semibold text-[#0F1912]">
										Hele TESS-Katalogen
									</p>
									<p className="text-xs text-[#5A615D]">
										{selection.selectedCount} av {totalNodeCount} kategorier
										inkludert
									</p>
								</div>
							)}
							<CategoryTree<AssortmentNode>
								nodes={rootNodes}
								getNodeId={(n) => n.assortmentNumber}
								getNodeLabel={(n) => n.nameNo ?? n.assortmentName}
								getNodeChildren={(n) => n.children}
								isSelected={selection.isSelected}
								isIndeterminate={selection.isIndeterminate}
								onToggle={selection.toggleWithDescendants}
								searchTerm={searchTerm}
								expandedIds={expandedIds}
								onExpandedChange={setExpandedIds}
							/>
						</>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
