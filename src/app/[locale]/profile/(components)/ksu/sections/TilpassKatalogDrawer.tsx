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
 * Selection is held locally while the drawer is open and committed to the
 * wizard controller via `onConfirm` on "Lagre". Discarding ("Avbryt" or
 * closing) preserves whatever was previously saved to the wizard.
 */

import * as React from "react";

import { Button } from "@/components/ui/button";
import { CategoryTree } from "@/components/ui/category-tree";
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
import { Search } from "lucide-react";

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

	const isLoading = mode === "catalog" ? catalogQuery.isLoading : existingQuery.isLoading;

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

	const handleConfirm = () => {
		onConfirm(new Set(draftSelected));
		onOpenChange(false);
	};

	const title =
		mode === "catalog"
			? "Tilpass TESS-kataloginnhold"
			: "Tilpass innhold fra kildekatalog";

	return (
		<Sheet
			open={open}
			onOpenChange={onOpenChange}>
			<SheetContent
				side="right"
				className="flex w-full flex-col gap-0 p-0 sm:max-w-[520px]">
				<div className="border-b border-[#E5E7E6] px-5 pt-5 pb-4">
					<SheetTitle className="text-lg font-semibold text-[#0F1912]">
						{title}
					</SheetTitle>
					<SheetDescription className="mt-1 text-sm text-[#5A615D]">
						Velg hvilke kategorier som skal inngå i KSU-et. Lar du alt stå
						umarkert, kopieres hele katalogen.
					</SheetDescription>
				</div>

				<div className="border-b border-[#E5E7E6] px-5 py-3">
					<div className="relative">
						<Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#8A8F8C]" />
						<Input
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Søk i kategorier ..."
							className="pl-9"
						/>
					</div>
					<div className="mt-3 flex items-center justify-between text-xs text-[#5A615D]">
						<span>
							{selection.selectedCount > 0
								? `${selection.selectedCount} valgt`
								: "Ingenting valgt (hele katalogen kopieres)"}
						</span>
						<div className="flex gap-3">
							<button
								type="button"
								onClick={selection.selectAll}
								className="text-[#1C6D2C] hover:underline">
								Velg alle
							</button>
							<button
								type="button"
								onClick={selection.clearAll}
								className="text-[#1C6D2C] hover:underline">
								Fjern alle
							</button>
						</div>
					</div>
				</div>

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
						<CategoryTree<AssortmentNode>
							nodes={rootNodes}
							getNodeId={(n) => n.assortmentNumber}
							getNodeLabel={(n) => n.nameNo ?? n.assortmentName}
							getNodeChildren={(n) => n.children}
							isSelected={selection.isSelected}
							isIndeterminate={selection.isIndeterminate}
							onToggle={selection.toggleWithDescendants}
							searchTerm={searchTerm}
						/>
					)}
				</div>

				<div className="flex justify-end gap-2 border-t border-[#E5E7E6] px-5 py-4">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}>
						Avbryt
					</Button>
					<Button
						variant="greenSolid"
						onClick={handleConfirm}
						disabled={isLoading || rootNodes.length === 0}>
						Lagre
					</Button>
				</div>
			</SheetContent>
		</Sheet>
	);
}
