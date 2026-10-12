"use client";

/**
 * "Opprett og tilpass KSU" — admin surface drawer.
 *
 * Opens from the admin page's "Juster denne KSU'en" button on the detail
 * header card. A 2-column workspace where the user composes a custom
 * category/group structure on top of the Tessix catalog.
 *
 * LEFT column — catalog browser
 *   - "Opprett ny gruppe" form at top: input + "Opprett gruppe" button
 *     spawns a new empty custom group on the right.
 *   - Green info banner explains the drag-drop flow.
 *   - Search filters category + item labels.
 *   - "Dine varer utvalgt i Tessix.no" tree:
 *     - category rows (expand/collapse)
 *     - item rows under each category — these are the draggable payload.
 *
 * RIGHT column — Nye grupper (user-authored structure)
 *   - Two sections: NEW empty groups the user just created (small cards,
 *     "+ Hjelmer XX" look), then "Grupperstrukturen:" subheader + the
 *     already-structured groups (expandable, nested, with items + counts).
 *   - Each group row has pencil (rename), chevron (expand/collapse),
 *     trash (delete).
 *   - Drops: item onto group → add item to that group. Group onto group
 *     → nest the dragged group as a child of the target.
 *   - Trash button at bottom bulk-deletes all empty groups.
 *
 * Drag-and-drop: uses the native HTML5 API (same pattern as
 * `ThmCustomizeColumnsModal` in MSL — no extra lib needed). `onDragStart`
 * stashes a payload id in state; `onDragOver` on a droppable calls
 * `e.preventDefault()` and reads the id to decide what move to perform.
 *
 * BE gaps flagged with TODO BE: catalog-items endpoint, custom-groups
 * read/write endpoints. See `assortment.service.ts` for proposed paths.
 */

import * as React from "react";

import { Button } from "@/components/ui/button";
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
	useGetCustomGroups,
	useGetItemsForAssortment,
	useSaveCustomGroups,
} from "@/hooks/useAssortmentQueries";
import { cn } from "@/lib/utils";
import type {
	AssortmentNode,
	CatalogItem,
	CustomGroup,
} from "@/types/assortment.types";
import {
	CheckCircle2,
	ChevronDown,
	ChevronRight,
	Maximize2,
	Pencil,
	Plus,
	Search,
	Trash2,
	X,
} from "lucide-react";
import { toast } from "react-toastify";

export interface OpprettOgTilpassDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	assortmentNumber: string | null;
}

/** Shape of the native HTML5 drag payload we stash in local state while
 *  a drag is in flight. (The `dataTransfer` API is awkward for anything
 *  richer than strings; keeping the payload in a ref lets us ship typed
 *  objects.) */
type DragPayload =
	| { kind: "item"; item: CatalogItem; sourceGroupId: string | null }
	| { kind: "group"; groupId: string };

export function OpprettOgTilpassDrawer({
	open,
	onOpenChange,
	assortmentNumber,
}: OpprettOgTilpassDrawerProps) {
	const structureQuery = useGetAssortmentStructure(
		open ? assortmentNumber : null,
	);
	const customGroupsQuery = useGetCustomGroups(open ? assortmentNumber : null);
	const saveMutation = useSaveCustomGroups();

	const rootNodes = structureQuery.data ?? [];

	const [groups, setGroups] = React.useState<CustomGroup[]>([]);
	React.useEffect(() => {
		if (customGroupsQuery.data) setGroups(customGroupsQuery.data);
	}, [customGroupsQuery.data]);

	const [newGroupName, setNewGroupName] = React.useState("");
	const [searchTerm, setSearchTerm] = React.useState("");
	const dragPayload = React.useRef<DragPayload | null>(null);

	const handleCreateGroup = () => {
		const name = newGroupName.trim();
		if (!name) return;
		setGroups((prev) => [
			...prev,
			{
				id: `cg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
				name,
				children: [],
				items: [],
			},
		]);
		setNewGroupName("");
	};

	const handleRenameGroup = (id: string, name: string) =>
		setGroups((prev) => mapGroups(prev, (g) => (g.id === id ? { ...g, name } : g)));

	const handleDeleteGroup = (id: string) =>
		setGroups((prev) => removeGroup(prev, id));

	const handleRemoveItemFromGroup = (groupId: string, itemNumber: string) =>
		setGroups((prev) =>
			mapGroups(prev, (g) =>
				g.id === groupId
					? { ...g, items: g.items.filter((it) => it.itemNumber !== itemNumber) }
					: g,
			),
		);

	const handleBulkDeleteEmptyGroups = () => {
		setGroups((prev) => filterGroups(prev, (g) => !isEmptyGroupDeep(g)));
	};

	// ---- Drag handlers (native HTML5) ---- //
	const handleItemDragStart =
		(item: CatalogItem, sourceGroupId: string | null) =>
		(e: React.DragEvent) => {
			dragPayload.current = { kind: "item", item, sourceGroupId };
			e.dataTransfer.effectAllowed = "move";
			// Set a tiny payload so the browser treats this as a real drag.
			e.dataTransfer.setData("text/plain", item.itemNumber);
		};

	const handleGroupDragStart =
		(groupId: string) => (e: React.DragEvent) => {
			dragPayload.current = { kind: "group", groupId };
			e.dataTransfer.effectAllowed = "move";
			e.dataTransfer.setData("text/plain", groupId);
		};

	const handleGroupDragOver = (e: React.DragEvent) => {
		if (dragPayload.current) e.preventDefault();
	};

	const handleGroupDrop = (targetGroupId: string) => () => {
		const payload = dragPayload.current;
		dragPayload.current = null;
		if (!payload) return;

		if (payload.kind === "item") {
			setGroups((prev) => {
				// Remove from source group (if dragged from inside another group)
				// then add to target. No-op when dropping into the source group.
				if (payload.sourceGroupId === targetGroupId) return prev;
				const stripped = payload.sourceGroupId
					? mapGroups(prev, (g) =>
							g.id === payload.sourceGroupId
								? {
										...g,
										items: g.items.filter(
											(it) => it.itemNumber !== payload.item.itemNumber,
										),
									}
								: g,
						)
					: prev;
				return mapGroups(stripped, (g) =>
					g.id === targetGroupId
						? { ...g, items: mergeItems(g.items, [payload.item]) }
						: g,
				);
			});
		} else {
			// Nest a group under another group — guard against moving a group
			// into one of its own descendants (would form a cycle).
			if (payload.groupId === targetGroupId) return;
			setGroups((prev) => {
				const moving = findGroup(prev, payload.groupId);
				if (!moving) return prev;
				if (containsGroup(moving, targetGroupId)) return prev;
				const withoutMoving = removeGroup(prev, payload.groupId);
				return mapGroups(withoutMoving, (g) =>
					g.id === targetGroupId
						? { ...g, children: [...g.children, moving] }
						: g,
				);
			});
		}
	};

	const handleSave = async () => {
		if (!assortmentNumber) return;
		try {
			await saveMutation.mutateAsync({ assortmentNumber, groups });
			toast.success("Gruppestruktur lagret.");
			onOpenChange(false);
		} catch (e) {
			console.error("save custom groups failed", e);
			toast.error("Kunne ikke lagre gruppestruktur.");
		}
	};

	const isLoading =
		structureQuery.isLoading || customGroupsQuery.isLoading || !assortmentNumber;

	// Two-section split on the right (new empty vs structured) — the Figma
	// shows newly-created empties (small "+ Hjelmer XX" chips) before the
	// "Grupperstrukturen:" subheader + the groups that have content.
	const emptyGroups = groups.filter(isEmptyGroupDeep);
	const structuredGroups = groups.filter((g) => !isEmptyGroupDeep(g));

	return (
		<Sheet
			open={open}
			onOpenChange={onOpenChange}>
			<SheetContent
				side="right"
				className="flex w-full flex-col gap-0 p-0 sm:max-w-[1120px] [&>button]:hidden">
				{/* Header */}
				<div className="flex items-start justify-between border-b border-[#E5E7E6] px-5 pt-5 pb-4">
					<SheetTitle className="text-lg font-semibold text-[#0F1912]">
						Opprett og tilpass KSU
					</SheetTitle>
					<SheetDescription className="sr-only">
						Bygg en egendefinert gruppestruktur ved å dra varer fra
						Tessix-katalogen inn i nye grupper på høyre side.
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

				{/* Body */}
				<div className="flex flex-1 overflow-hidden">
					{/* ---------- LEFT ---------- */}
					<div className="flex w-1/2 flex-col border-r border-[#E5E7E6]">
						<div className="space-y-2 border-b border-[#E5E7E6] p-4">
							<label className="text-xs font-semibold text-[#0F1912]">
								Opprett ny gruppe
							</label>
							<div className="flex items-center gap-2">
								<Input
									value={newGroupName}
									onChange={(e) => setNewGroupName(e.target.value)}
									placeholder="Hjelmer"
									className="flex-1"
									onKeyDown={(e) => {
										if (e.key === "Enter") handleCreateGroup();
									}}
								/>
								<Button
									variant="outlineGreen"
									size="sm"
									className="gap-2"
									onClick={handleCreateGroup}
									disabled={newGroupName.trim().length === 0}>
									<Plus className="h-4 w-4" />
									Opprett gruppe
								</Button>
							</div>
						</div>

						<InfoBanner />

						<div className="border-b border-[#E5E7E6] p-4">
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

						<h3 className="px-4 pt-3 text-xs font-semibold tracking-wide text-[#5A615D] uppercase">
							Dine varer utvalgt i Tessix.no
						</h3>
						<div className="flex-1 overflow-y-auto px-4 py-3">
							{isLoading ? (
								<SkeletonList rows={5} />
							) : rootNodes.length === 0 ? (
								<p className="pt-4 text-center text-sm text-[#5A615D]">
									Ingen kategorier.
								</p>
							) : (
								<ul className="space-y-0.5 text-sm">
									{rootNodes.map((n) => (
										<CatalogNodeRow
											key={n.assortmentNumber}
											node={n}
											depth={0}
											searchTerm={searchTerm}
											onItemDragStart={handleItemDragStart}
										/>
									))}
								</ul>
							)}
						</div>
					</div>

					{/* ---------- RIGHT ---------- */}
					<div className="flex w-1/2 flex-col">
						<h3 className="border-b border-[#E5E7E6] px-4 py-3 text-xs font-semibold tracking-wide text-[#5A615D] uppercase">
							Nye grupper
						</h3>
						<div className="flex-1 overflow-y-auto px-4 py-3">
							{isLoading ? (
								<SkeletonList rows={3} tall />
							) : groups.length === 0 ? (
								<p className="pt-6 text-center text-sm text-[#5A615D]">
									Ingen grupper enda. Opprett en gruppe til venstre og dra
									varer hit.
								</p>
							) : (
								<div className="space-y-5">
									{emptyGroups.length > 0 && (
										<ul className="space-y-2">
											{emptyGroups.map((g) => (
												<EmptyGroupChip
													key={g.id}
													group={g}
													onRename={(name) => handleRenameGroup(g.id, name)}
													onDelete={() => handleDeleteGroup(g.id)}
													onDragOver={handleGroupDragOver}
													onDrop={handleGroupDrop(g.id)}
													onGroupDragStart={handleGroupDragStart(g.id)}
												/>
											))}
										</ul>
									)}
									{structuredGroups.length > 0 && (
										<>
											<h4 className="text-xs font-semibold text-[#0F1912]">
												Grupperstrukturen:
											</h4>
											<ul className="space-y-2">
												{structuredGroups.map((g) => (
													<StructuredGroupCard
														key={g.id}
														group={g}
														depth={0}
														onRename={handleRenameGroup}
														onDelete={handleDeleteGroup}
														onRemoveItem={handleRemoveItemFromGroup}
														onItemDragStart={handleItemDragStart}
														onGroupDragStart={handleGroupDragStart}
														onGroupDragOver={handleGroupDragOver}
														onGroupDrop={handleGroupDrop}
													/>
												))}
											</ul>
										</>
									)}
								</div>
							)}
						</div>
						{/* Bulk-delete sweep: removes groups that have no items + no
							 children (handy after a drag session leaves stragglers). */}
						<div className="border-t border-[#E5E7E6] px-4 py-2">
							<button
								type="button"
								onClick={handleBulkDeleteEmptyGroups}
								disabled={emptyGroups.length === 0}
								aria-label="Fjern tomme grupper"
								className="rounded p-1 text-[#B0261A] hover:bg-[#FDE7EA] disabled:cursor-not-allowed disabled:opacity-40">
								<Trash2 className="h-4 w-4" />
							</button>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between gap-2 border-t border-[#E5E7E6] px-5 py-3">
					<Button
						variant="ghost"
						onClick={() => onOpenChange(false)}
						className="gap-2 text-[#5A615D]">
						<X className="h-4 w-4" />
						Tilbake til oversikt
					</Button>
					<Button
						variant="greenSolid"
						onClick={handleSave}
						disabled={saveMutation.isPending || !assortmentNumber}
						className="gap-2">
						{saveMutation.isPending ? "Lagrer ..." : "Lagre valg"}
					</Button>
				</div>
			</SheetContent>
		</Sheet>
	);
}

// ---------------- Info banner ---------------- //

function InfoBanner() {
	return (
		<div className="border-b border-[#E5E7E6] bg-[#EFF9F1] px-4 py-3 text-xs">
			<p className="flex items-center gap-2 font-medium text-[#0F1912]">
				<CheckCircle2 className="h-4 w-4 text-[#009640]" />
				Juster strukturen med dra og slipp
			</p>
			<ul className="mt-2 space-y-1 pl-6 text-[#1C6D2C]">
				<li>Du kan flytte grupper og nivåer med dra og slipp.</li>
				<li>
					Velg fra Tessix.no (standard grupper) eller egne grupper (høyre
					side).
				</li>
				<li>
					For å velge flere samtidig, bruk Ctrl/Shift knappen mens du setter.
				</li>
			</ul>
		</div>
	);
}

function SkeletonList({ rows, tall }: { rows: number; tall?: boolean }) {
	return (
		<div className="space-y-2">
			{Array.from({ length: rows }).map((_, i) => (
				<Skeleton
					key={i}
					className={cn("w-full", tall ? "h-16" : "h-7")}
				/>
			))}
		</div>
	);
}

// ---------------- Left: catalog row ---------------- //

function CatalogNodeRow({
	node,
	depth,
	searchTerm,
	onItemDragStart,
}: {
	node: AssortmentNode;
	depth: number;
	searchTerm: string;
	onItemDragStart: (
		item: CatalogItem,
		sourceGroupId: string | null,
	) => (e: React.DragEvent) => void;
}) {
	const [expanded, setExpanded] = React.useState(depth < 1);
	const itemsQuery = useGetItemsForAssortment(expanded ? node.assortmentNumber : null);
	const normalizedSearch = searchTerm.trim().toLowerCase();

	const label = node.nameNo ?? node.assortmentName;
	const items = itemsQuery.data ?? [];
	const filteredItems = normalizedSearch
		? items.filter((i) =>
				i.productName.toLowerCase().includes(normalizedSearch),
			)
		: items;

	return (
		<li>
			<div
				className="flex items-center gap-1 rounded-sm px-1 py-1 hover:bg-[#F3F4F3]"
				style={{ paddingLeft: `${depth * 14 + 4}px` }}>
				<button
					type="button"
					onClick={() => setExpanded((v) => !v)}
					className="flex h-4 w-4 shrink-0 items-center justify-center text-[#5A615D] hover:text-[#0F1912]">
					{expanded ? (
						<ChevronDown className="h-3.5 w-3.5" />
					) : (
						<ChevronRight className="h-3.5 w-3.5" />
					)}
				</button>
				<span className="truncate text-sm font-medium text-[#0F1912]">
					{label}
				</span>
			</div>
			{expanded && (
				<ul>
					{node.children?.map((c) => (
						<CatalogNodeRow
							key={c.assortmentNumber}
							node={c}
							depth={depth + 1}
							searchTerm={searchTerm}
							onItemDragStart={onItemDragStart}
						/>
					))}
					{itemsQuery.isLoading && items.length === 0 && (
						<li
							className="px-1 py-1 text-xs text-[#5A615D]"
							style={{ paddingLeft: `${(depth + 1) * 14 + 20}px` }}>
							Laster varer ...
						</li>
					)}
					{filteredItems.map((it) => (
						<CatalogItemRow
							key={it.itemNumber}
							item={it}
							depth={depth + 1}
							onDragStart={onItemDragStart(it, null)}
						/>
					))}
				</ul>
			)}
		</li>
	);
}

function CatalogItemRow({
	item,
	depth,
	onDragStart,
}: {
	item: CatalogItem;
	depth: number;
	onDragStart: (e: React.DragEvent) => void;
}) {
	return (
		<li
			draggable
			onDragStart={onDragStart}
			style={{ paddingLeft: `${depth * 14 + 24}px` }}
			className="flex cursor-grab items-center gap-2 rounded-sm px-1 py-1 text-xs text-[#0F1912] hover:bg-[#F3F4F3] active:cursor-grabbing">
			<span className="truncate">{item.productName}</span>
		</li>
	);
}

// ---------------- Right: empty-group chip ---------------- //

function EmptyGroupChip({
	group,
	onRename,
	onDelete,
	onDragOver,
	onDrop,
	onGroupDragStart,
}: {
	group: CustomGroup;
	onRename: (name: string) => void;
	onDelete: () => void;
	onDragOver: (e: React.DragEvent) => void;
	onDrop: () => void;
	onGroupDragStart: (e: React.DragEvent) => void;
}) {
	const [editing, setEditing] = React.useState(false);
	const [draftName, setDraftName] = React.useState(group.name);
	React.useEffect(() => setDraftName(group.name), [group.name]);

	return (
		<li
			draggable
			onDragStart={onGroupDragStart}
			onDragOver={onDragOver}
			onDrop={onDrop}
			className="flex cursor-grab items-center gap-2 rounded-md border border-[#E5E7E6] bg-white px-3 py-2 active:cursor-grabbing hover:border-[#C1C4C2]">
			<Plus className="h-3.5 w-3.5 shrink-0 text-[#1C6D2C]" />
			{editing ? (
				<Input
					autoFocus
					value={draftName}
					onChange={(e) => setDraftName(e.target.value)}
					onBlur={() => {
						const name = draftName.trim();
						if (name) onRename(name);
						setEditing(false);
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter") (e.target as HTMLInputElement).blur();
						if (e.key === "Escape") {
							setDraftName(group.name);
							setEditing(false);
						}
					}}
					className="h-7 flex-1 text-sm"
				/>
			) : (
				<span className="flex-1 truncate text-sm font-medium text-[#0F1912]">
					{group.name}{" "}
					<span className="text-xs font-normal text-[#5A615D]">({group.items.length})</span>
				</span>
			)}
			<button
				type="button"
				onClick={() => setEditing(true)}
				aria-label={`Rediger ${group.name}`}
				className="rounded p-1 text-[#5A615D] hover:bg-[#F3F4F3] hover:text-[#0F1912]">
				<Pencil className="h-3.5 w-3.5" />
			</button>
			<button
				type="button"
				onClick={onDelete}
				aria-label={`Slett ${group.name}`}
				className="rounded p-1 text-[#B0261A] hover:bg-[#FDE7EA]">
				<X className="h-3.5 w-3.5" />
			</button>
		</li>
	);
}

// ---------------- Right: structured group card ---------------- //

function StructuredGroupCard({
	group,
	depth,
	onRename,
	onDelete,
	onRemoveItem,
	onItemDragStart,
	onGroupDragStart,
	onGroupDragOver,
	onGroupDrop,
}: {
	group: CustomGroup;
	depth: number;
	onRename: (id: string, name: string) => void;
	onDelete: (id: string) => void;
	onRemoveItem: (groupId: string, itemNumber: string) => void;
	onItemDragStart: (
		item: CatalogItem,
		sourceGroupId: string | null,
	) => (e: React.DragEvent) => void;
	onGroupDragStart: (groupId: string) => (e: React.DragEvent) => void;
	onGroupDragOver: (e: React.DragEvent) => void;
	onGroupDrop: (groupId: string) => () => void;
}) {
	const [expanded, setExpanded] = React.useState(true);
	const [editing, setEditing] = React.useState(false);
	const [draftName, setDraftName] = React.useState(group.name);
	React.useEffect(() => setDraftName(group.name), [group.name]);

	const totalCount = group.items.length + sumGroupItems(group.children);

	return (
		<li
			draggable
			onDragStart={onGroupDragStart(group.id)}
			onDragOver={onGroupDragOver}
			onDrop={onGroupDrop(group.id)}
			style={{ marginLeft: `${depth * 12}px` }}
			className="cursor-grab rounded-md border border-[#E5E7E6] bg-white active:cursor-grabbing">
			<div
				className={cn(
					"flex items-center gap-1 border-b border-[#E5E7E6] px-3 py-2",
					depth === 0 && "bg-[#DCF7E0]/40",
				)}>
				<button
					type="button"
					onClick={() => setExpanded((v) => !v)}
					className="flex h-5 w-5 shrink-0 items-center justify-center text-[#5A615D] hover:text-[#0F1912]">
					{expanded ? (
						<ChevronDown className="h-4 w-4" />
					) : (
						<ChevronRight className="h-4 w-4" />
					)}
				</button>
				{editing ? (
					<Input
						autoFocus
						value={draftName}
						onChange={(e) => setDraftName(e.target.value)}
						onBlur={() => {
							const name = draftName.trim();
							if (name) onRename(group.id, name);
							setEditing(false);
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter") (e.target as HTMLInputElement).blur();
							if (e.key === "Escape") {
								setDraftName(group.name);
								setEditing(false);
							}
						}}
						className="h-7 flex-1 text-sm"
					/>
				) : (
					<span className="flex-1 truncate text-sm font-semibold text-[#0F1912]">
						{group.name}{" "}
						<span className="text-xs font-normal text-[#5A615D]">
							({totalCount})
						</span>
					</span>
				)}
				<button
					type="button"
					onClick={() => setEditing(true)}
					aria-label={`Rediger ${group.name}`}
					className="rounded p-1 text-[#5A615D] hover:bg-[#F3F4F3] hover:text-[#0F1912]">
					<Pencil className="h-3.5 w-3.5" />
				</button>
				<button
					type="button"
					onClick={() => onDelete(group.id)}
					aria-label={`Slett ${group.name}`}
					className="rounded p-1 text-[#B0261A] hover:bg-[#FDE7EA]">
					<Trash2 className="h-3.5 w-3.5" />
				</button>
			</div>
			{expanded && (
				<>
					{group.children.length > 0 && (
						<ul className="space-y-2 px-3 pt-2 pb-1">
							{group.children.map((child) => (
								<StructuredGroupCard
									key={child.id}
									group={child}
									depth={depth + 1}
									onRename={onRename}
									onDelete={onDelete}
									onRemoveItem={onRemoveItem}
									onItemDragStart={onItemDragStart}
									onGroupDragStart={onGroupDragStart}
									onGroupDragOver={onGroupDragOver}
									onGroupDrop={onGroupDrop}
								/>
							))}
						</ul>
					)}
					<ul className="min-h-[32px] space-y-1 px-3 py-2">
						{group.items.length === 0 && group.children.length === 0 ? (
							<li className="text-center text-xs text-[#5A615D] italic">
								Dra varer hit
							</li>
						) : (
							group.items.map((it) => (
								<li
									key={it.itemNumber}
									draggable
									onDragStart={onItemDragStart(it, group.id)}
									className="flex cursor-grab items-center gap-2 rounded-sm bg-[#F8F9F8] px-2 py-1 text-xs text-[#0F1912] active:cursor-grabbing hover:bg-[#F3F4F3]">
									<span className="flex-1 truncate">{it.productName}</span>
									<button
										type="button"
										onClick={() => onRemoveItem(group.id, it.itemNumber)}
										aria-label={`Fjern ${it.productName}`}
										className="rounded p-0.5 text-[#5A615D] hover:bg-[#F3F4F3] hover:text-[#0F1912]">
										<X className="h-3 w-3" />
									</button>
								</li>
							))
						)}
					</ul>
				</>
			)}
		</li>
	);
}

// ---------------- Tree helpers ---------------- //

function mapGroups(
	groups: CustomGroup[],
	fn: (g: CustomGroup) => CustomGroup,
): CustomGroup[] {
	return groups.map((g) => {
		const mapped = fn(g);
		return { ...mapped, children: mapGroups(mapped.children, fn) };
	});
}

function removeGroup(groups: CustomGroup[], id: string): CustomGroup[] {
	return groups
		.filter((g) => g.id !== id)
		.map((g) => ({ ...g, children: removeGroup(g.children, id) }));
}

function filterGroups(
	groups: CustomGroup[],
	predicate: (g: CustomGroup) => boolean,
): CustomGroup[] {
	return groups
		.filter(predicate)
		.map((g) => ({ ...g, children: filterGroups(g.children, predicate) }));
}

function findGroup(
	groups: CustomGroup[],
	id: string,
): CustomGroup | null {
	for (const g of groups) {
		if (g.id === id) return g;
		const hit = findGroup(g.children, id);
		if (hit) return hit;
	}
	return null;
}

function containsGroup(group: CustomGroup, id: string): boolean {
	if (group.id === id) return true;
	return group.children.some((c) => containsGroup(c, id));
}

function mergeItems(
	existing: CatalogItem[],
	incoming: CatalogItem[],
): CatalogItem[] {
	const seen = new Set(existing.map((i) => i.itemNumber));
	const deduped = incoming.filter((i) => !seen.has(i.itemNumber));
	return [...existing, ...deduped];
}

function isEmptyGroupDeep(g: CustomGroup): boolean {
	return (
		g.items.length === 0 &&
		(g.children.length === 0 || g.children.every(isEmptyGroupDeep))
	);
}

function sumGroupItems(groups: CustomGroup[]): number {
	let n = 0;
	for (const g of groups) {
		n += g.items.length + sumGroupItems(g.children);
	}
	return n;
}
