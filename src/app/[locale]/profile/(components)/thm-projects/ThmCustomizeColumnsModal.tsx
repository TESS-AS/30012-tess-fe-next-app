"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal, ModalHeader, ModalTitle } from "@/components/ui/modal";
import type {
	ColumnDef,
	ColumnPreferences,
} from "@/lib/thm-column-views";
import { EyeOff, GripVertical, Plus, Search } from "lucide-react";

export type { ColumnDef, ColumnPreferences };

type FilterMode = "all" | "visible" | "hidden" | "global";

interface ThmCustomizeColumnsModalProps<K extends string> {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	columns: ColumnDef<K>[];
	value: ColumnPreferences<K>;
	defaults: ColumnPreferences<K>;
	viewName: string;
	onSave: (
		next: ColumnPreferences<K>,
		meta: { viewName: string },
	) => void;
	onCopyView?: () => void;
	onDeleteView?: () => void;
}

export function ThmCustomizeColumnsModal<K extends string>({
	open,
	onOpenChange,
	columns,
	value,
	defaults,
	viewName,
	onSave,
	onCopyView,
	onDeleteView,
}: ThmCustomizeColumnsModalProps<K>) {
	const [draft, setDraft] = useState<ColumnPreferences<K>>(value);
	const [name, setName] = useState(viewName);
	const [filterMode, setFilterMode] = useState<FilterMode>("all");
	const [search, setSearch] = useState("");
	const [dragKey, setDragKey] = useState<K | null>(null);
	const [highlightKey, setHighlightKey] = useState<K | null>(null);

	useEffect(() => {
		if (open) {
			setDraft(value);
			setName(viewName);
			setFilterMode("all");
			setSearch("");
			setHighlightKey(null);
		}
	}, [open, value, viewName]);

	const columnByKey = useMemo(
		() => new Map(columns.map((c) => [c.key, c])),
		[columns],
	);

	const q = search.trim().toLowerCase();
	const matchesSearch = (key: K) =>
		!q || (columnByKey.get(key)?.label.toLowerCase().includes(q) ?? false);

	const visibleList = draft.order.filter(
		(k) => draft.visible[k] && matchesSearch(k),
	);
	// Hidden list is alphabetised A–Z.
	const hiddenList = [...columns]
		.filter((c) => !draft.visible[c.key] && matchesSearch(c.key))
		.sort((a, b) => a.label.localeCompare(b.label))
		.map((c) => c.key);

	const totalVisible = draft.order.filter((k) => draft.visible[k]).length;
	const totalHidden = columns.length - totalVisible;

	const showVisiblePanel = filterMode === "all" || filterMode === "visible";
	const showHiddenPanel = filterMode === "all" || filterMode === "hidden";

	const flash = (key: K) => {
		setHighlightKey(key);
		window.setTimeout(() => {
			setHighlightKey((k) => (k === key ? null : k));
		}, 1500);
	};

	const hide = (key: K) => {
		setDraft((prev) => ({
			...prev,
			visible: { ...prev.visible, [key]: false },
		}));
		flash(key);
	};

	const show = (key: K) => {
		setDraft((prev) => {
			// Append newly-shown column to the end of the order so it appears
			// at the tail; user can drag it into position.
			const order = prev.order.includes(key) ? prev.order : [...prev.order, key];
			return {
				order,
				visible: { ...prev.visible, [key]: true },
			};
		});
		flash(key);
	};

	const moveKey = (from: K, to: K) => {
		if (from === to) return;
		setDraft((prev) => {
			const next = [...prev.order];
			const fromIdx = next.indexOf(from);
			const toIdx = next.indexOf(to);
			if (fromIdx < 0 || toIdx < 0) return prev;
			next.splice(fromIdx, 1);
			next.splice(toIdx, 0, from);
			return { ...prev, order: next };
		});
	};

	const handleDragStart = (key: K) => (e: React.DragEvent) => {
		setDragKey(key);
		e.dataTransfer.effectAllowed = "move";
	};

	const handleDragOver = (key: K) => (e: React.DragEvent) => {
		if (!dragKey || dragKey === key) return;
		e.preventDefault();
		moveKey(dragKey, key);
	};

	const handleDragEnd = () => setDragKey(null);

	const handleReset = () => {
		setDraft(defaults);
		setName(viewName);
	};

	const handleSave = () => {
		onSave(draft, { viewName: name.trim() || viewName });
		onOpenChange(false);
	};

	return (
		<Modal
			open={open}
			onOpenChange={onOpenChange}
			className="max-w-[720px]">
			<ModalHeader className="border-b border-[#E5E7E6] pb-4">
				<ModalTitle className="text-lg font-semibold text-[#0F1912]">
					Customize columns
				</ModalTitle>
			</ModalHeader>

			<div className="space-y-5 py-4">
				<div className="space-y-2">
					<label
						htmlFor="thm-view-name"
						className="block text-sm text-[#0F1912]">
						View Name:{" "}
						<span className="font-semibold">&ldquo;{viewName}&rdquo;</span>
					</label>
					<div className="flex gap-2">
						<Input
							id="thm-view-name"
							placeholder="Keep Name or Rename"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="h-10 flex-1"
						/>
						<Button
							variant="greenSolid"
							onClick={handleSave}
							className="h-10 shrink-0 px-4">
							Save and run new view
						</Button>
					</div>
					<div className="flex flex-wrap gap-2 pt-1">
						<Button
							variant="outlineGreen"
							size="sm"
							onClick={onCopyView}>
							Copy view
						</Button>
						<Button
							variant="outlineGreen"
							size="sm"
							onClick={handleReset}>
							Reset to default
						</Button>
						<Button
							variant="outlineGreen"
							size="sm"
							onClick={onDeleteView}>
							Delete this view
						</Button>
					</div>
				</div>

				<div className="grid grid-cols-[1fr_auto] items-end gap-4">
					<div className="space-y-1.5">
						<label
							htmlFor="thm-column-search"
							className="block text-sm font-medium text-[#0F1912]">
							Find columns
						</label>
						<div className="relative">
							<Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#8A8F8C]" />
							<Input
								id="thm-column-search"
								placeholder="Search columns ..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="h-9 pl-9"
							/>
						</div>
					</div>
					<div className="space-y-1.5">
						<span className="block text-sm font-medium text-[#0F1912]">
							Filters
						</span>
						<div className="flex items-center gap-3 py-1.5">
							{(["all", "visible", "hidden", "global"] as FilterMode[]).map(
								(mode) => (
									<label
										key={mode}
										className="flex cursor-pointer items-center gap-1.5 text-sm text-[#0F1912]">
										<input
											type="radio"
											name="thm-filter-mode"
											checked={filterMode === mode}
											onChange={() => setFilterMode(mode)}
											className="h-3.5 w-3.5 accent-[#1C6D2C]"
										/>
										<span className="capitalize">{mode}</span>
									</label>
								),
							)}
						</div>
					</div>
				</div>

				<div
					className={`grid gap-4 ${
						showVisiblePanel && showHiddenPanel
							? "grid-cols-2"
							: "grid-cols-1"
					}`}>
					{showVisiblePanel && (
						<div className="space-y-2">
							<h3 className="text-sm font-medium text-[#0F1912]">
								Visible columns ({totalVisible}){" "}
								<span className="text-[#8A8F8C]">- Drag to reorder</span>
							</h3>
							<ul className="max-h-[320px] overflow-y-auto rounded-md border border-[#E5E7E6] bg-white">
								{visibleList.length === 0 ? (
									<li className="px-3 py-6 text-center text-xs text-[#8A8F8C]">
										No columns
									</li>
								) : (
									visibleList.map((key) => {
										const col = columnByKey.get(key);
										if (!col) return null;
										const isDragging = dragKey === key;
										const isHighlighted = highlightKey === key;
										return (
											<li
												key={key}
												draggable
												onDragStart={handleDragStart(key)}
												onDragOver={handleDragOver(key)}
												onDragEnd={handleDragEnd}
												onDrop={handleDragEnd}
												className={`group flex items-center gap-2 border-b border-[#E5E7E6] px-2 py-2 last:border-b-0 ${
													isDragging
														? "opacity-50"
														: isHighlighted
															? "bg-[#DCF7E0]"
															: "hover:bg-[#F7F9F8]"
												}`}>
												<GripVertical
													className="h-4 w-4 shrink-0 cursor-grab text-[#8A8F8C] active:cursor-grabbing"
													aria-hidden
												/>
												<span className="flex-1 truncate text-sm text-[#0F1912]">
													{col.label}
												</span>
												<button
													type="button"
													onClick={() => hide(key)}
													aria-label={`Hide ${col.label}`}
													className="rounded p-1 text-[#1C6D2C] hover:bg-[#DCF7E0]">
													<EyeOff className="h-4 w-4" />
												</button>
											</li>
										);
									})
								)}
							</ul>
						</div>
					)}

					{showHiddenPanel && (
						<div className="space-y-2">
							<h3 className="text-sm font-medium text-[#0F1912]">
								Hidden columns A–Z ({totalHidden})
							</h3>
							<ul className="max-h-[320px] overflow-y-auto rounded-md border border-[#E5E7E6] bg-white">
								{hiddenList.length === 0 ? (
									<li className="px-3 py-6 text-center text-xs text-[#8A8F8C]">
										No columns
									</li>
								) : (
									hiddenList.map((key) => {
										const col = columnByKey.get(key);
										if (!col) return null;
										const isHighlighted = highlightKey === key;
										return (
											<li
												key={key}
												className={`group flex items-center gap-2 border-b border-[#E5E7E6] px-3 py-2 last:border-b-0 ${
													isHighlighted
														? "bg-[#DCF7E0]"
														: "hover:bg-[#F7F9F8]"
												}`}>
												<span className="flex-1 truncate text-sm text-[#0F1912]">
													{col.label}
												</span>
												<button
													type="button"
													onClick={() => show(key)}
													aria-label={`Show ${col.label}`}
													className="rounded p-1 text-[#1C6D2C] hover:bg-[#DCF7E0]">
													<Plus className="h-4 w-4" />
												</button>
											</li>
										);
									})
								)}
							</ul>
						</div>
					)}
				</div>
			</div>
		</Modal>
	);
}
