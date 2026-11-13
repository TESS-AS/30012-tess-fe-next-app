"use client";

/**
 * Feature-agnostic selection state for a hierarchical tree used with the
 * `CategoryTree` primitive.
 *
 * Handles:
 *   - toggle a single node (leaf-level selection)
 *   - toggle a node AND cascade its selection to all descendants (what the
 *     Figma spec actually wants for the KSU tree — selecting a parent means
 *     "all its children too")
 *   - indeterminate state: a parent is indeterminate when SOME but not all
 *     of its descendants are selected
 *   - bulk select-all / clear-all
 *
 * Selection is held as a Set<string> keyed by `getNodeId(node)`. Caller
 * controls the Set reference via `setSelectedIds` or leaves it uncontrolled
 * and reads from the hook's own state.
 */

import { useCallback, useMemo, useState } from "react";

export interface UseCategoryTreeSelectionArgs<T> {
	rootNodes: T[];
	getNodeId: (node: T) => string;
	getNodeChildren: (node: T) => T[] | undefined;
	/** Pass to drive from outside (controlled). Omit for uncontrolled. */
	selectedIds?: Set<string>;
	onChange?: (next: Set<string>) => void;
}

export interface UseCategoryTreeSelectionResult {
	selectedIds: Set<string>;
	isSelected: (id: string) => boolean;
	/** True when some but not all descendants of `id` are selected. */
	isIndeterminate: (id: string) => boolean;
	/** Toggle just this node — does not cascade. Rarely what you want. */
	toggle: (id: string) => void;
	/** Toggle this node AND cascade to all descendants. Default UX. */
	toggleWithDescendants: (id: string) => void;
	/** Select every node in the tree. */
	selectAll: () => void;
	clearAll: () => void;
	/** Count of selected ids. O(1). */
	selectedCount: number;
}

export function useCategoryTreeSelection<T>({
	rootNodes,
	getNodeId,
	getNodeChildren,
	selectedIds: controlledIds,
	onChange,
}: UseCategoryTreeSelectionArgs<T>): UseCategoryTreeSelectionResult {
	const [internalIds, setInternalIds] = useState<Set<string>>(
		() => new Set(),
	);
	const selectedIds = controlledIds ?? internalIds;
	const setSelected = useCallback(
		(next: Set<string>) => {
			if (onChange) onChange(next);
			if (controlledIds === undefined) setInternalIds(next);
		},
		[controlledIds, onChange],
	);

	// Node lookup + descendant index. Rebuilt only when the tree reference
	// changes — keeps toggle operations O(descendants) instead of walking
	// the whole tree every time.
	const index = useMemo(() => {
		const byId = new Map<string, T>();
		const descendants = new Map<string, string[]>();
		const walk = (node: T): string[] => {
			const id = getNodeId(node);
			byId.set(id, node);
			const kids = getNodeChildren(node) ?? [];
			const allDesc: string[] = [];
			for (const kid of kids) {
				const kidId = getNodeId(kid);
				allDesc.push(kidId, ...walk(kid));
			}
			descendants.set(id, allDesc);
			return allDesc;
		};
		for (const root of rootNodes) walk(root);
		return { byId, descendants };
	}, [rootNodes, getNodeId, getNodeChildren]);

	const isSelected = useCallback(
		(id: string) => selectedIds.has(id),
		[selectedIds],
	);

	const isIndeterminate = useCallback(
		(id: string) => {
			if (selectedIds.has(id)) return false;
			const desc = index.descendants.get(id);
			if (!desc || desc.length === 0) return false;
			for (const d of desc) {
				if (selectedIds.has(d)) return true;
			}
			return false;
		},
		[selectedIds, index],
	);

	const toggle = useCallback(
		(id: string) => {
			const next = new Set(selectedIds);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			setSelected(next);
		},
		[selectedIds, setSelected],
	);

	const toggleWithDescendants = useCallback(
		(id: string) => {
			const desc = index.descendants.get(id) ?? [];
			const next = new Set(selectedIds);
			// Treat the parent's own state as the toggle target: if the parent is
			// fully selected, deselect it + all descendants. Otherwise (unselected
			// OR partially selected / indeterminate), select it + all descendants.
			const shouldSelect = !next.has(id);
			if (shouldSelect) {
				next.add(id);
				for (const d of desc) next.add(d);
			} else {
				next.delete(id);
				for (const d of desc) next.delete(d);
			}
			setSelected(next);
		},
		[selectedIds, index, setSelected],
	);

	const selectAll = useCallback(() => {
		const next = new Set<string>();
		for (const id of index.byId.keys()) next.add(id);
		setSelected(next);
	}, [index, setSelected]);

	const clearAll = useCallback(() => setSelected(new Set()), [setSelected]);

	return {
		selectedIds,
		isSelected,
		isIndeterminate,
		toggle,
		toggleWithDescendants,
		selectAll,
		clearAll,
		selectedCount: selectedIds.size,
	};
}
