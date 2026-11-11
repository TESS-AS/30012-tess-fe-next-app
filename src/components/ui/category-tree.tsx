"use client";

/**
 * Generic recursive checkbox tree. Feature-agnostic — holds no vocabulary
 * from assortments/KSU. Pair with `useCategoryTreeSelection` for cascade
 * select + indeterminate-state computation.
 *
 * Usage:
 *
 *     const sel = useCategoryTreeSelection({ rootNodes, getNodeId, getNodeChildren });
 *     <CategoryTree
 *         nodes={rootNodes}
 *         getNodeId={(n) => n.assortmentNumber}
 *         getNodeLabel={(n) => n.nameNo ?? n.assortmentName}
 *         getNodeChildren={(n) => n.children}
 *         isSelected={sel.isSelected}
 *         isIndeterminate={sel.isIndeterminate}
 *         onToggle={sel.toggleWithDescendants}
 *     />
 *
 * Not virtualized. If a single tree ever grows past ~500 visible rows, swap
 * the flat `<ul>` body for `@tanstack/react-virtual` at the leaf level — the
 * API stays the same, only the renderer changes.
 */

import * as React from "react";

import { cn } from "@/lib/utils";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, ChevronRight, Minus } from "lucide-react";

export interface CategoryTreeProps<T> {
	nodes: T[];
	getNodeId: (node: T) => string;
	getNodeLabel: (node: T) => string;
	getNodeChildren: (node: T) => T[] | undefined;
	isSelected: (id: string) => boolean;
	isIndeterminate: (id: string) => boolean;
	onToggle: (id: string) => void;
	/** Case-insensitive label filter. Nodes are kept visible if they match OR
	 *  any descendant matches (so a hit deep in the tree stays reachable). */
	searchTerm?: string;
	/** Controlled expansion — pass if you want to lift expanded state (e.g. to
	 *  auto-expand all when a search term is active). */
	expandedIds?: Set<string>;
	onExpandedChange?: (next: Set<string>) => void;
	className?: string;
}

export function CategoryTree<T>(props: CategoryTreeProps<T>) {
	const {
		nodes,
		getNodeId,
		getNodeLabel,
		getNodeChildren,
		isSelected,
		isIndeterminate,
		onToggle,
		searchTerm,
		expandedIds,
		onExpandedChange,
		className,
	} = props;

	const [internalExpanded, setInternalExpanded] = React.useState<Set<string>>(
		() => new Set(),
	);
	const expanded = expandedIds ?? internalExpanded;
	const setExpanded = React.useCallback(
		(next: Set<string>) => {
			if (onExpandedChange) onExpandedChange(next);
			else setInternalExpanded(next);
		},
		[onExpandedChange],
	);

	const toggleExpanded = React.useCallback(
		(id: string) => {
			const next = new Set(expanded);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			setExpanded(next);
		},
		[expanded, setExpanded],
	);

	// Filter is depth-first: a node is visible if its label matches OR any
	// descendant matches. When a search is active, auto-expand matched
	// ancestors so the hit is on-screen.
	const normalizedSearch = (searchTerm ?? "").trim().toLowerCase();
	const matchesSelf = React.useCallback(
		(node: T) =>
			!normalizedSearch ||
			getNodeLabel(node).toLowerCase().includes(normalizedSearch),
		[normalizedSearch, getNodeLabel],
	);
	const matchesDeep = React.useMemo(() => {
		const cache = new Map<string, boolean>();
		const walk = (node: T): boolean => {
			const id = getNodeId(node);
			const hit = cache.get(id);
			if (hit !== undefined) return hit;
			if (matchesSelf(node)) {
				cache.set(id, true);
				return true;
			}
			const kids = getNodeChildren(node) ?? [];
			for (const kid of kids) {
				if (walk(kid)) {
					cache.set(id, true);
					return true;
				}
			}
			cache.set(id, false);
			return false;
		};
		return walk;
	}, [getNodeChildren, getNodeId, matchesSelf]);

	return (
		<ul
			role="tree"
			className={cn("space-y-1 text-sm", className)}>
			{nodes.map((n) =>
				normalizedSearch && !matchesDeep(n) ? null : (
					<TreeNode
						key={getNodeId(n)}
						node={n}
						depth={0}
						getNodeId={getNodeId}
						getNodeLabel={getNodeLabel}
						getNodeChildren={getNodeChildren}
						isSelected={isSelected}
						isIndeterminate={isIndeterminate}
						onToggle={onToggle}
						expanded={expanded}
						onToggleExpanded={toggleExpanded}
						matchesDeep={matchesDeep}
						hasSearch={normalizedSearch.length > 0}
					/>
				),
			)}
		</ul>
	);
}

interface TreeNodeProps<T> {
	node: T;
	depth: number;
	getNodeId: (node: T) => string;
	getNodeLabel: (node: T) => string;
	getNodeChildren: (node: T) => T[] | undefined;
	isSelected: (id: string) => boolean;
	isIndeterminate: (id: string) => boolean;
	onToggle: (id: string) => void;
	expanded: Set<string>;
	onToggleExpanded: (id: string) => void;
	matchesDeep: (node: T) => boolean;
	hasSearch: boolean;
}

function TreeNode<T>({
	node,
	depth,
	getNodeId,
	getNodeLabel,
	getNodeChildren,
	isSelected,
	isIndeterminate,
	onToggle,
	expanded,
	onToggleExpanded,
	matchesDeep,
	hasSearch,
}: TreeNodeProps<T>) {
	const id = getNodeId(node);
	const children = getNodeChildren(node) ?? [];
	const hasChildren = children.length > 0;
	// Auto-expand when a search is active and this node has matching descendants.
	const isExpanded = hasSearch ? matchesDeep(node) : expanded.has(id);

	const selected = isSelected(id);
	const indeterminate = !selected && isIndeterminate(id);
	// Radix's Checkbox accepts `checked: boolean | "indeterminate"`.
	const checkedValue: boolean | "indeterminate" = indeterminate
		? "indeterminate"
		: selected;

	return (
		<li
			role="treeitem"
			aria-expanded={hasChildren ? isExpanded : undefined}
			aria-selected={selected}
			className="select-none">
			<div
				className="flex items-center gap-2 rounded-sm px-1 py-1 hover:bg-[#F3F4F3]"
				style={{ paddingLeft: `${depth * 16 + 4}px` }}>
				<button
					type="button"
					aria-label={isExpanded ? "Collapse" : "Expand"}
					onClick={() => hasChildren && onToggleExpanded(id)}
					className={cn(
						"flex h-4 w-4 shrink-0 items-center justify-center rounded-sm text-[#5A615D]",
						hasChildren ? "hover:text-[#0F1912]" : "invisible",
					)}>
					<ChevronRight
						className={cn(
							"h-3.5 w-3.5 transition-transform",
							isExpanded && "rotate-90",
						)}
					/>
				</button>
				<CheckboxWithIndeterminate
					id={`tree-${id}`}
					checked={checkedValue}
					onCheckedChange={() => onToggle(id)}
				/>
				<label
					htmlFor={`tree-${id}`}
					className="flex-1 cursor-pointer truncate text-sm text-[#0F1912]">
					{getNodeLabel(node)}
				</label>
			</div>
			{hasChildren && isExpanded && (
				<ul
					role="group"
					className="space-y-1">
					{children.map((kid) =>
						hasSearch && !matchesDeep(kid) ? null : (
							<TreeNode
								key={getNodeId(kid)}
								node={kid}
								depth={depth + 1}
								getNodeId={getNodeId}
								getNodeLabel={getNodeLabel}
								getNodeChildren={getNodeChildren}
								isSelected={isSelected}
								isIndeterminate={isIndeterminate}
								onToggle={onToggle}
								expanded={expanded}
								onToggleExpanded={onToggleExpanded}
								matchesDeep={matchesDeep}
								hasSearch={hasSearch}
							/>
						),
					)}
				</ul>
			)}
		</li>
	);
}

/**
 * Local to the tree because the shared Checkbox hardcodes a Check icon in its
 * Indicator — we need to swap it for a Minus when the state is "indeterminate".
 */
const CheckboxWithIndeterminate = React.forwardRef<
	React.ElementRef<typeof CheckboxPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ checked, className, ...props }, ref) => (
	<CheckboxPrimitive.Root
		ref={ref}
		checked={checked}
		className={cn(
			"peer focus-visible:ring-ring h-4 w-4 shrink-0 cursor-pointer rounded-sm border border-[#8A8F8C] bg-[#F8F9F8] focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-none data-[state=checked]:bg-[#009640] data-[state=indeterminate]:border-none data-[state=indeterminate]:bg-[#009640]",
			className,
		)}
		{...props}>
		<CheckboxPrimitive.Indicator className="flex items-center justify-center">
			{checked === "indeterminate" ? (
				<Minus className="h-3 w-3 text-white" />
			) : (
				<Check className="h-3 w-3 text-white" />
			)}
		</CheckboxPrimitive.Indicator>
	</CheckboxPrimitive.Root>
));
CheckboxWithIndeterminate.displayName = "CheckboxWithIndeterminate";
