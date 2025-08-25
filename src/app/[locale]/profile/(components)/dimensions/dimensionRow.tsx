"use client";

import type { ReactElement, RefObject } from "react";
import { Fragment } from "react";
import { cn } from "@/lib/utils";
import { ChevronDownIcon, MoreHorizontal, CirclePlus, PenSquare, Trash2, PlusIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import NewRow from "./newRow";
import { Dimension } from "@/types/dimensions.types";

type InputRef =
  | React.RefObject<HTMLInputElement>
  | React.MutableRefObject<HTMLInputElement | null>;

type Props = {
  dimension: Dimension;
  path: string[];
  level: number;

  editingDimension: { id: string; path: string[] } | null;
  editDimensionData: { name: string; type: string; budget: string; cents: string };
  setEditDimensionData: React.Dispatch<React.SetStateAction<{ name: string; type: string; budget: string; cents: string }>>;
  toggleExpand: (id: string) => void;
  startEditing: (dimension: Dimension, path: string[]) => void;
  saveEdit: () => void;
  addSubcategory: (path: string[]) => void;
  setShowDeleteModal: (v: boolean) => void;
  setDimensionToDelete: (v: { id: string; name: string; level: string; path: string[] } | null) => void;

  isCreating: boolean;
  createAtPath: string[] | null;
  pathEquals: (a: string[] | null, b: string[]) => boolean;
  newRowKey: string;
  newDimension: { name: string; type: string; budget: string; cents: string };
  setNewDimension: React.Dispatch<
    React.SetStateAction<{ name: string; type: string; budget: string; cents: string }>
  >;
  handleAddDimension: () => void;
  cancelNew: () => void;
  newNameRef: InputRef;
  onOpenTypeModal: () => void;
};

export default function DimensionRow(props: Props): ReactElement {
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

  console.log("dimension", dimension)

  return (
    <Fragment key={dimension.id}>
      <tr
        className={cn("group", { "hover:bg-[#DCF7E0]": !isEditingThis, "bg-[#F3FAF7]": isEditingThis })}
        onClick={(e) => {
          if (isEditingThis) return;
          const target = e.target as HTMLElement;
          if (target.closest("input, button, [role='button'], [data-no-row-toggle]")) return;
          if (dimension.children?.length) toggleExpand(dimension.id);
        }}
      >
        <td className="py-4 px-4">
          <div className="flex items-center gap-2">
            <div style={{ marginLeft: `${level * 24}px` }} className="flex items-center gap-2">
              {dimension.children && dimension.children.length > 0 && (
                <button
                  className="p-0.5 rounded hover:bg-[#E8EAE9]"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(dimension.id);
                  }}
                  aria-label={dimension.isExpanded ? "Collapse" : "Expand"}
                >
                  <ChevronDownIcon className={cn("h-4 w-4 transition-transform", dimension.isExpanded && "rotate-180")} />
                </button>
              )}
              {isEditingThis ? (
                <div className="flex-1">
                  <Input
                    value={editDimensionData.name}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setEditDimensionData((p) => ({ ...p, name: e.target.value }))}
                    className="border-[#C1C4C2] hover:border-[#009640] focus:border-[#009640] focus:ring-1 focus:ring-[#009640] h-8 px-2"
                  />
                </div>
              ) : (
                dimension.name
              )}
            </div>
          </div>
        </td>

        <td className="py-4 px-4">
          {isEditingThis ? (
            <div className="flex items-center gap-1">
              <Input
                value={editDimensionData.type}
                className="border-[#C1C4C2] hover:border-[#009640] focus:border-[#009640] focus:ring-1 focus:ring-[#009640] h-8 px-2 bg-[#F3FAF7] cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenTypeModal();
                }}
                readOnly
              />
            </div>
          ) : (
            <span className="bg-[#E8EAE9] px-2 py-1 rounded text-sm">{dimension.type}</span>
          )}
        </td>

        <td className="py-4 px-4">
          {isEditingThis ? (
            <div className="flex items-center gap-1">
              <Input
                value={editDimensionData.budget}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  setEditDimensionData((p) => ({ ...p, budget: value }));
                }}
                className="w-[80px] h-8 px-2 text-right border-[#C1C4C2] hover:border-[#009640] focus:border-[#009640] focus:ring-1 focus:ring-[#009640]"
              />
              ,
              <Input
                value={editDimensionData.cents}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  setEditDimensionData((p) => ({ ...p, cents: value }));
                }}
                className="w-[60px] h-8 px-2 text-right border-[#C1C4C2] hover:border-[#009640] focus:border-[#009640] focus:ring-1 focus:ring-[#009640]"
              />
              <span>,- kr</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span>{dimension.budget}</span>
              {dimension.budget && <span>,- kr</span>}
            </div>
          )}
        </td>

        <td className="py-4 px-4">
          <div className="flex items-center gap-2 justify-end">
            {isEditingThis ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 border-[#C1C4C2] hover:bg-[#F3FAF7] hover:text-[#0F1912]"
                  onClick={() => {
                    setEditDimensionData({ name: "", type: "", budget: "", cents: "" });
                    // parent will clear editing state
                  }}
                  data-no-row-toggle
                >
                  Avbryt
                </Button>
                <Button size="sm" className="h-8 px-3 bg-[#009640] hover:bg-[#005522] text-white" onClick={saveEdit}>
                  Lagre
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {level < 2 && <button
                        className="p-0.5 border border-[#5A615D] rounded-full cursor-pointer hover:bg-[#E8EAE9] hover:border-[#C1C4C2] hover:text-[#009640]"
                        onClick={(e) => {
                          e.stopPropagation();
                          addSubcategory([...path, dimension.id]);
                        }}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Legg til underkategori</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 hover:bg-[#E8EAE9] rounded cursor-pointer" data-no-row-toggle>
                      <MoreHorizontal className="h-4 w-4 text-[#2D3530]" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuItem
                      className="gap-2 text-sm cursor-pointer hover:bg-[#F3FAF7] hover:text-[#009640]"
                      onClick={() => addSubcategory([...path, dimension.id])}
                    >
                      <CirclePlus className="h-4 w-4" />
                      Legg til underkategori
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2 text-sm cursor-pointer hover:bg-[#F3FAF7] hover:text-[#009640]"
                      onClick={() => startEditing(dimension, path)}
                    >
                      <PenSquare className="h-4 w-4" />
                      Endre dimensjon
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2 text-sm cursor-pointer hover:bg-[#F3FAF7] text-[#C81E1E] hover:text-[#C81E1E]"
                      onClick={() => {
                        setDimensionToDelete({ id: dimension.id, name: dimension.name, level: (level + 1).toString(), path });
                        setShowDeleteModal(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Slett dimensjon
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
