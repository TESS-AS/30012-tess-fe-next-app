"use client";

import type { ReactElement, RefObject } from "react";
import { Fragment } from "react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Dimension } from "@/types/dimensions.types";
import {
	ChevronDownIcon,
	MoreHorizontal,
	CirclePlus,
	PenSquare,
	Trash2,
	PlusIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import NewRow from "./newRow";

type InputRef =
	| React.RefObject<HTMLInputElement>
	| React.MutableRefObject<HTMLInputElement | null>;

type Props = {
	dimension: Dimension;
	path: string[];
	level: number;

	editingDimension: { id: string; path: string[] } | null;
	editDimensionData: {
		name: string;
		type: string;
		budget: string;
		cents: string;
	};
	setEditDimensionData: React.Dispatch<
		React.SetStateAction<{
			name: string;
			type: string;
			budget: string;
			cents: string;
		}>
	>;
	toggleExpand: (id: string) => void;
	startEditing: (dimension: Dimension, path: string[]) => void;
	saveEdit: () => void;
	addSubcategory: (path: string[]) => void;
	setShowDeleteModal: (v: boolean) => void;
	setDimensionToDelete: (
		v: { id: string; name: string; level: string; path: string[] } | null,
	) => void;

	isCreating: boolean;
	createAtPath: string[] | null;
	pathEquals: (a: string[] | null, b: string[]) => boolean;
	newRowKey: string;
	newDimension: { name: string; type: string; budget: string; cents: string };
	setNewDimension: React.Dispatch<
		React.SetStateAction<{
			name: string;
			type: string;
			budget: string;
			cents: string;
		}>
	>;
	handleAddDimension: () => void;
	cancelNew: () => void;
	newNameRef: InputRef;
	onOpenTypeModal: () => void;
};

export default function DimensionRow(props: Props): ReactElement {
	const t = useTranslations("DimensionsDimensionRow");
	const {
		dimension,
		path,
		level,
		editingDimension,
		editDimensionData,
		setEditDimensionData,
		toggleExpand,
		startEditing,
		saveEdit,
		addSubcategory,
		setShowDeleteModal,
		setDimensionToDelete,
		isCreating,
		createAtPath,
		pathEquals,
		newRowKey,
		newDimension,
		setNewDimension,
		handleAddDimension,
		cancelNew,
		newNameRef,
		onOpenTypeModal,
	} = props;

	const isEditingThis = editingDimension?.id === dimension.id;

	return (
		<Fragment key={dimension.id}>
			<tr
				className={cn("group", {
					"hover:bg-[#DCF7E0]": !isEditingThis,
					"bg-[#F3FAF7]": isEditingThis,
				})}
				onClick={(e) => {
					if (isEditingThis) return;
					const target = e.target as HTMLElement;
					if (
						target.closest(
							"input, button, [role='button'], [data-no-row-toggle]",
						)
					)
						return;
					if (dimension.children?.length) toggleExpand(dimension.id);
				}}>
				<td className="px-4 py-4">
					<div className="flex items-center gap-2">
						<div
							style={{ marginLeft: `${level * 24}px` }}
							className="flex items-center gap-2">
							{dimension.children && dimension.children.length > 0 && (
								<button
									className="rounded p-0.5 hover:bg-[#E8EAE9]"
									onClick={(e) => {
										e.stopPropagation();
										toggleExpand(dimension.id);
									}}
									aria-label={dimension.isExpanded ? t("collapse") : t("expand")}>
									<ChevronDownIcon
										className={cn(
											"h-4 w-4 transition-transform",
											dimension.isExpanded && "rotate-180",
										)}
									/>
								</button>
							)}
							{isEditingThis ? (
								<div className="flex-1">
									<Input
										value={editDimensionData.name}
										onClick={(e) => e.stopPropagation()}
										onChange={(e) =>
											setEditDimensionData((p) => ({
												...p,
												name: e.target.value,
											}))
										}
										className="h-8 border-[#C1C4C2] px-2 hover:border-[#009640] focus:border-[#009640] focus:ring-1 focus:ring-[#009640]"
									/>
								</div>
							) : (
								dimension.name
							)}
						</div>
					</div>
				</td>

				<td className="px-4 py-4">
					{isEditingThis ? (
						<div className="flex items-center gap-1">
							<Input
								value={editDimensionData.type}
								className="h-8 cursor-pointer border-[#C1C4C2] bg-[#F3FAF7] px-2 hover:border-[#009640] focus:border-[#009640] focus:ring-1 focus:ring-[#009640]"
								onClick={(e) => {
									e.stopPropagation();
									onOpenTypeModal();
								}}
								disabled
								readOnly
							/>
						</div>
					) : (
						<span className="rounded bg-[#E8EAE9] px-2 py-1 text-sm">
							{dimension.type}
						</span>
					)}
				</td>

				<td className="px-4 py-4">
					{isEditingThis ? (
						<div className="flex items-center gap-1">
							<Input
								value={editDimensionData.budget}
								onChange={(e) => {
									const value = e.target.value.replace(/[^0-9]/g, "");
									setEditDimensionData((p) => ({ ...p, budget: value }));
								}}
								className="h-8 w-[80px] border-[#C1C4C2] px-2 text-right hover:border-[#009640] focus:border-[#009640] focus:ring-1 focus:ring-[#009640]"
							/>
							,
							<Input
								value={editDimensionData.cents}
								onChange={(e) => {
									const value = e.target.value.replace(/[^0-9]/g, "");
									setEditDimensionData((p) => ({ ...p, cents: value }));
								}}
								className="h-8 w-[60px] border-[#C1C4C2] px-2 text-right hover:border-[#009640] focus:border-[#009640] focus:ring-1 focus:ring-[#009640]"
							/>
							<span> {t("currency")}</span>
						</div>
					) : (
						<div className="flex items-center gap-1">
							<span>{dimension.budget}</span>
							{dimension.budget && <span> {t("currency")}</span>}
						</div>
					)}
				</td>

				<td className="px-4 py-4">
					<div className="flex items-center justify-end gap-2">
						{isEditingThis ? (
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									className="h-8 border-[#C1C4C2] px-3 hover:bg-[#F3FAF7] hover:text-[#0F1912]"
									onClick={() => {
										setEditDimensionData({
											name: "",
											type: "",
											budget: "",
											cents: "",
										});
									}}
									data-no-row-toggle>
									{t("cancel")}
								</Button>
								<Button
									size="sm"
									variant="greenSolid"
									className="h-8 px-3 hover:bg-green-900"
									onClick={saveEdit}>
									{t("save")}
								</Button>
							</div>
						) : (
							<div className="flex items-center gap-2">
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											{level < 2 && (
												<button
													className="cursor-pointer rounded-full border border-[#5A615D] p-0.5 hover:border-[#C1C4C2] hover:bg-[#E8EAE9] hover:text-[#009640]"
													onClick={(e) => {
														e.stopPropagation();
														addSubcategory([...path, dimension.id]);
													}}>
													<PlusIcon className="h-4 w-4" />
												</button>
											)}
										</TooltipTrigger>
										<TooltipContent>
											<p>{t("addSubcategory")}</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>

								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<button
											className="cursor-pointer rounded p-1 hover:bg-[#E8EAE9]"
											data-no-row-toggle>
											<MoreHorizontal className="h-4 w-4 text-[#2D3530]" />
										</button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align="end"
										className="w-[200px]">
										<DropdownMenuItem
											className="cursor-pointer gap-2 text-sm hover:bg-[#F3FAF7] hover:text-[#009640]"
											onClick={() => addSubcategory([...path, dimension.id])}>
											<CirclePlus className="h-4 w-4" />
											{t("addSubcategory")}
										</DropdownMenuItem>
										<DropdownMenuItem
											className="cursor-pointer gap-2 text-sm hover:bg-[#F3FAF7] hover:text-[#009640]"
											onClick={() => startEditing(dimension, path)}>
											<PenSquare className="h-4 w-4" />
											{t("editDimension")}
										</DropdownMenuItem>
										<DropdownMenuItem
											className="cursor-pointer gap-2 text-sm text-[#C81E1E] hover:bg-[#F3FAF7] hover:text-[#C81E1E]"
											onClick={() => {
												setDimensionToDelete({
													id: dimension.id,
													name: dimension.name,
													level: (level + 1).toString(),
													path,
												});
												setShowDeleteModal(true);
											}}>
											<Trash2 className="h-4 w-4" />
											{t("deleteDimension")}
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						)}
					</div>
				</td>
			</tr>

			{dimension.isExpanded &&
				dimension.children?.map((child) => (
					<DimensionRow
						key={child.id}
						dimension={child}
						path={[...path, dimension.id]}
						level={level + 1}
						editingDimension={editingDimension}
						editDimensionData={editDimensionData}
						setEditDimensionData={setEditDimensionData}
						toggleExpand={toggleExpand}
						startEditing={startEditing}
						saveEdit={saveEdit}
						addSubcategory={addSubcategory}
						setShowDeleteModal={setShowDeleteModal}
						setDimensionToDelete={setDimensionToDelete}
						isCreating={isCreating}
						createAtPath={createAtPath}
						pathEquals={pathEquals}
						newRowKey={newRowKey}
						newDimension={newDimension}
						setNewDimension={setNewDimension}
						handleAddDimension={handleAddDimension}
						cancelNew={cancelNew}
						newNameRef={newNameRef}
						onOpenTypeModal={onOpenTypeModal}
					/>
				))}

			{isCreating && pathEquals(createAtPath, [...path, dimension.id]) && (
				<NewRow
					level={level + 1}
					newRowKey={newRowKey}
					newDimension={newDimension}
					setNewDimension={setNewDimension}
					handleAddDimension={handleAddDimension}
					cancelNew={cancelNew}
					inputRef={newNameRef}
					onOpenTypeModal={onOpenTypeModal}
				/>
			)}
		</Fragment>
	);
}
