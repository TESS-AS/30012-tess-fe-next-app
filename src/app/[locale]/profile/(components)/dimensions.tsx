"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { Info, PlusIcon, SquarePen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Dimension, DimensionType } from "@/types/dimensions.types";
import DimensionRow from "./dimensions/dimensionRow";
import NewRow from "./dimensions/newRow";
import TypeModal from "./dimensions/typeModal";
import DeleteConfirmModal from "./dimensions/deleteConfirmModal";
import ProjectPicker from "./dimensions/projectPicker";

const projects = [
  { value: "all", label: "Alle" },
  { value: "norsk-hydro", label: "Norsk Hydro" },
  { value: "equinor", label: "Equinor" },
  { value: "aker", label: "Aker Solutions" },
];

export function Dimensions(): ReactElement {
  const [showEmptyState, setShowEmptyState] = useState(true);
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [selectedProject, setSelectedProject] = useState(projects[0]);

  // delete dialog
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dimensionToDelete, setDimensionToDelete] = useState<{ id: string; name: string; path: string[] } | null>(null);

  // edit existing
  const [editingDimension, setEditingDimension] = useState<{ id: string; path: string[] } | null>(null);
  const [editDimensionData, setEditDimensionData] = useState({ name: "", type: "", budget: "", cents: "" });

  // create inline
  const [isCreating, setIsCreating] = useState(false);
  const [createAtPath, setCreateAtPath] = useState<string[] | null>(null);
  const newRowKey = useMemo(() => `newrow:${(createAtPath || []).join("/")}`, [createAtPath]);

  // type modal
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [dimensionTypes, setDimensionTypes] = useState<DimensionType[]>([
    { dimension: "1", type: "", active: false },
    { dimension: "2", type: "", active: false },
    { dimension: "3", type: "", active: false },
  ]);

  // new row data
  const [newDimension, setNewDimension] = useState({ name: "", type: "", budget: "", cents: "" });

  // focus refs
  const newNameRef = useRef<HTMLInputElement>(null);
  const editNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreating && newNameRef.current) {
      newNameRef.current.focus();
      newNameRef.current.select?.();
    }
  }, [isCreating, newRowKey]);

  useEffect(() => {
    if (editingDimension && editNameRef.current) {
      editNameRef.current.focus();
      editNameRef.current.select?.();
    }
  }, [editingDimension?.id]);

  const returnFocusAfterTypePick = () => {
    if (isCreating && newNameRef.current) {
      newNameRef.current.focus();
      newNameRef.current.select?.();
    } else if (editingDimension && editNameRef.current) {
      editNameRef.current.focus();
      editNameRef.current.select?.();
    }
  };

  const pathEquals = (a: string[] | null, b: string[]) => !!a && a.length === b.length && a.every((v, i) => v === b[i]);

  const updateDimensionAtPath = (dims: Dimension[], path: string[], newItem: Dimension): Dimension[] => {
    if (path.length === 0) return [...dims, newItem];
    return dims.map((d) =>
      d.id === path[0]
        ? { ...d, children: updateDimensionAtPath(d.children || [], path.slice(1), newItem), isExpanded: true }
        : d
    );
  };

  const toggleExpand = (dimensionId: string) => {
    setDimensions((prev) =>
      prev.map((dim) => {
        if (dim.id === dimensionId) return { ...dim, isExpanded: !dim.isExpanded };
        if (dim.children) return { ...dim, children: collapseIfNeeded(dim.children, dimensionId) };
        return dim;
      })
    );
  };

  const collapseIfNeeded = (dims: Dimension[], id: string): Dimension[] =>
    dims.map((d) => {
      if (d.id === id) return { ...d, isExpanded: !d.isExpanded };
      if (d.children) return { ...d, children: collapseIfNeeded(d.children, id) };
      return d;
    });

  /** Create */
  const addSubcategory = (path: string[]) => {
    setIsCreating(true);
    setCreateAtPath(path);
    setNewDimension({ name: "", type: "", budget: "", cents: "" });
    setShowEmptyState(false);
  };

  const handleAddDimension = () => {
    if (newDimension.name && newDimension.type && newDimension.budget) {
      const newItem: Dimension = {
        id: `dim_${Date.now()}`,
        name: newDimension.name,
        type: newDimension.type,
        budget: `${newDimension.budget}${newDimension.cents ? "," + newDimension.cents : ""}`,
        children: [],
      };
      setDimensions((dims) => updateDimensionAtPath(dims, createAtPath || [], newItem));
      setNewDimension({ name: "", type: "", budget: "", cents: "" });
      setIsCreating(false);
      setCreateAtPath(null);
      setShowEmptyState(false);
    }
  };

  const cancelNew = () => {
    setIsCreating(false);
    setCreateAtPath(null);
  };

  /** Edit */
  const startEditing = (dimension: Dimension, path: string[]) => {
    const [whole, cents = ""] = dimension.budget.split(",");
    const initialData = { name: dimension.name, type: dimension.type || "", budget: whole || "", cents };
    setEditDimensionData(initialData);
    setEditingDimension({ id: dimension.id, path });
  };

  const saveEdit = () => {
    if (!editingDimension) return;

    const updateDimensionInTree = (dims: Dimension[]): Dimension[] =>
      dims.map((dim) => {
        if (dim.id === editingDimension.id) {
          return {
            ...dim,
            name: editDimensionData.name,
            type: editDimensionData.type,
            budget: `${editDimensionData.budget}${editDimensionData.cents ? "," + editDimensionData.cents : ""}`,
          };
        }
        return dim.children ? { ...dim, children: updateDimensionInTree(dim.children) } : dim;
      });

    setDimensions((prev) => updateDimensionInTree(prev));
    setEditingDimension(null);
    setEditDimensionData({ name: "", type: "", budget: "", cents: "" });
  };

  const deleteDimension = (id: string, _path: string[]) => {
    const deleteRecursively = (dims: Dimension[], targetId: string): Dimension[] =>
      dims
        .map((dim) => ({ ...dim, children: dim.children ? deleteRecursively(dim.children, targetId) : undefined }))
        .filter((dim) => dim.id !== targetId);
    setDimensions((prev) => deleteRecursively(prev, id));
  };

  /** Type modal (shared) */
  const handleTypeChange = (index: number, value: string) => {
    setDimensionTypes((prev) => {
      if (prev[index].type === value) return prev;
      const next = [...prev];
      next[index] = { ...next[index], type: value };
      return next;
    });
  };

  const handleActiveChange = (index: number, checked: boolean) => {
    setDimensionTypes((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], active: checked };
      return next;
    });
  };

  const handleSaveDimensionTypes = () => {
    const activeTypes = dimensionTypes.filter((d) => d.active).map((d) => d.type).join(" < ");
    if (editingDimension) {
      setEditDimensionData((prev) => ({ ...prev, type: activeTypes }));
    } else if (isCreating) {
      setNewDimension((prev) => ({ ...prev, type: activeTypes }));
    }
    setShowTypeModal(false);
    setTimeout(returnFocusAfterTypePick, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold">Konteringsdimensjoner</h1>
          <p className="text-[#5A615D] ml-4">
            Organiser prosjekter, avdelinger, arbeidsordre osv i hierarkisk struktur med budsjetter. Konteringsdimensjoner du
            legger til her vises i utsjekk for alle dine brukere.
          </p>
        </div>
      </div>

      {showEmptyState ? (
        <div className="bg-white rounded-lg border border-[#C1C4C2]">
          <div className="rounded-lg m-6 p-6 space-y-6 bg-[#F3FAF7]">
            <div className="text-start">
              <p className="text-[#005522] font-bold mb-1">Ingen dimensjoner enda</p>
              <p className="text-[#005522] text-sm">
                Kom i gang med å opprette din første dimensjon. Du kan organisere det i kategorier og elementer.
              </p>
            </div>
            <div className="flex justify-start">
              <Button
                variant="green"
                onClick={() => {
                  setShowEmptyState(false);
                  setIsCreating(true);
                  setCreateAtPath([]);
                  setNewDimension({ name: "", type: "", budget: "", cents: "" });
                }}
              >
                <PlusIcon className="h-4 w-4" />
                Lag ny dimensjon
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[#C1C4C2]">
          <div className="p-4 space-y-6">
            <div className="flex items-center justify-between mb-4 border-b border-[#C1C4C2] pb-4">
              <div className="flex items-center gap-2">
                <span className="text-[#5A615D] text-base font-bold">Viser prosjekt for:</span>
                <ProjectPicker
                  projects={projects}
                  selected={selectedProject}
                  setSelected={setSelectedProject}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="text-[#0F1912] hover:text-[#0F1912] hover:bg-[#F3FAF7] border-[#C1C4C2]"
                  onClick={() => setShowTypeModal(true)}
                >
                  <SquarePen className="h-4 w-4" />
                  Endre dimensjonstyper
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(true);
                    setCreateAtPath([]);
                    setNewDimension({ name: "", type: "", budget: "", cents: "" });
                  }}
                  className="text-[#0F1912] hover:text-[#0F1912] hover:bg-[#F3FAF7] border-[#C1C4C2]"
                >
                  <PlusIcon className="h-4 w-4" />
                  Lag ny dimensjon
                </Button>
              </div>
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-[#C1C4C2]">
                <th className="text-left text-sm py-4 px-4 font-medium bg-[#F8F9F8] text-[#5A615D]">
                  NAVN
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="ml-1">
                          <Info className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Dette feltet brukes til å identifisere dimensjonen.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </th>
                <th className="text-left text-sm py-4 px-4 font-medium bg-[#F8F9F8] text-[#5A615D]">
                  TYPE
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="ml-1">
                          <Info className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Velg en dimensjonstype fra listen.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </th>
                <th className="text-left text-sm py-4 px-4 font-medium bg-[#F8F9F8] text-[#5A615D]">
                  BUDSJETT
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="ml-1">
                          <Info className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Sett et budsjett for dimensjonen.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </th>
                <th className="w-[100px] text-left text-sm py-4 px-4 font-medium bg-[#F8F9F8] text-[#5A615D]">
                  HANDLING
                </th>
              </tr>
            </thead>
            <tbody>
              {isCreating && pathEquals(createAtPath, []) && (
                <NewRow
                  level={0}
                  newRowKey={newRowKey}
                  newDimension={newDimension}
                  setNewDimension={setNewDimension}
                  handleAddDimension={handleAddDimension}
                  cancelNew={cancelNew}
                  inputRef={newNameRef}
                  onOpenTypeModal={() => setShowTypeModal(true)}
                />
              )}

              {dimensions.map((dimension) => (
                <DimensionRow
                  key={dimension.id}
                  dimension={dimension}
                  path={[]}
                  level={0}
                  editingDimension={editingDimension}
                  editDimensionData={editDimensionData}
                  setEditDimensionData={setEditDimensionData}
                  toggleExpand={toggleExpand}
                  startEditing={(d, p) => {
                    startEditing(d, p);
                  }}
                  saveEdit={() => {
                    saveEdit();
                  }}
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
                  onOpenTypeModal={() => setShowTypeModal(true)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TypeModal
        open={showTypeModal}
        onOpenChange={setShowTypeModal}
        dimensionTypes={dimensionTypes}
        handleActiveChange={handleActiveChange}
        handleTypeChange={handleTypeChange}
        onSave={handleSaveDimensionTypes}
        onAfterCloseFocus={returnFocusAfterTypePick}
      />

      <DeleteConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        name={dimensionToDelete?.name}
        onConfirm={() => {
          if (dimensionToDelete) {
            deleteDimension(dimensionToDelete.id, dimensionToDelete.path);
            setShowDeleteModal(false);
            setDimensionToDelete(null);
          }
        }}
      />
    </div>
  );
}

export default Dimensions;
