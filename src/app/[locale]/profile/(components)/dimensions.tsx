"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { createDimension, deleteCustomerDimensions, updateDimension } from "@/services/dimensions.service";
import { useCustomerDimensions } from "@/hooks/useCustomerDimensions";
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
import { usePunchoutProfile } from "@/hooks/usePunchoutProfile";
import { getUserDimensions } from "@/services/dimensions.service";

const projects = [
  { value: "all", label: "Alle" },
  { value: "norsk-hydro", label: "Norsk Hydro" },
  { value: "equinor", label: "Equinor" },
  { value: "aker", label: "Aker Solutions" },
];

export function Dimensions(): ReactElement {

  const { data: profile } = usePunchoutProfile();
  const { dimensions: fetchedDimensions, isLoading, error } = useCustomerDimensions();
  const [selectedProject, setSelectedProject] = useState(projects[0]);
  const [localDimensions, setLocalDimensions] = useState<Dimension[]>([]);
  const [showEmptyState, setShowEmptyState] = useState(!isLoading && localDimensions.length === 0);

  // Keep local state in sync with fetched data
  useEffect(() => {
    const loadDimensionTypes = async () => {
      if (profile?.customerNumbers[0]) {
        try {
          const userDimensions = await getUserDimensions(profile.customerNumbers[0]);
          if (userDimensions[0]?.hierarchy) {
            const hierarchy = userDimensions[0].hierarchy;
            setDimensionTypes([
              { dimension: "1", type: hierarchy.dimension1?.label || "Department", active: false },
              { dimension: "2", type: hierarchy.dimension2?.label || "Project", active: false },
              { dimension: "3", type: hierarchy.dimension3?.label || "Workorder", active: false },
            ]);
          }
        } catch (error) {
          console.error('Error loading dimension types:', error);
        }
      }
    };

    loadDimensionTypes();
  }, [profile?.customerNumbers]);

  useEffect(() => {
    if (fetchedDimensions) {
      setLocalDimensions(fetchedDimensions);
    }
  }, [fetchedDimensions]);

  // delete dialog
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dimensionToDelete, setDimensionToDelete] = useState<{ id: string; name: string; level: string; path: string[] } | null>(null);

  // edit existing
  const [editingDimension, setEditingDimension] = useState<{ id: string; path: string[] } | null>(null);
  const [editDimensionData, setEditDimensionData] = useState({ name: "", type: "", budget: "", cents: "" });

  // create inline
  const [isCreating, setIsCreating] = useState(false);
  const [createAtPath, setCreateAtPath] = useState<string[] | null>(null);
  const newRowKey = useMemo(() => `newrow:${(createAtPath || []).join("/")}`, [createAtPath]);

  // type modal
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [dimensionTypes, setDimensionTypes] = useState<DimensionType[]>([
    { dimension: "1", type: "Department", active: false },
    { dimension: "2", type: "Project", active: false },
    { dimension: "3", type: "Workorder", active: false },
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
    setLocalDimensions((prev) =>
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


  const handleDeleteDimension = async () => {
    if (dimensionToDelete) {
      try {
        await deleteCustomerDimensions(profile?.customerNumbers[0] || "", dimensionToDelete.id, dimensionToDelete.level);
        
        setLocalDimensions((prev: Dimension[]) => {
          const dims = prev.filter((dim) => dim.id !== dimensionToDelete.id);
          return dims;
        });

        toast.success('Dimensjonen ble slettet');
        setDimensionToDelete(null);
        setShowDeleteModal(false);
      } catch (error) {
        console.error('Error deleting dimension:', error);
        toast.error('Kunne ikke slette dimensjonen. Vennligst prøv igjen.');
      }
    }
  };

  const addSubcategory = (path: string[]) => {
    const level = path.length;
    console.log('Creating dimension at level:', level + 1);
    
    // Reset all dimension types to inactive
    setDimensionTypes(prev => prev.map(d => ({ ...d, active: false })));
    
    setIsCreating(true);
    setCreateAtPath(path);
    setNewDimension({ name: "", type: "", budget: "", cents: "" });
    setShowEmptyState(false);
  };

  const findParentDimensionId = (path: string[] | null): string | undefined => {
    if (!path || path.length === 0) return undefined;

    let current = localDimensions;
    let parentId: string | undefined;

    for (let i = 0; i < path.length; i++) {
      const dimension = current.find(d => d.id === path[i]);
      if (dimension) {
        parentId = dimension.id;
        current = dimension.children || [];
      }
    }

    return parentId;
  };

  const handleAddDimension = async () => {
    if (!newDimension.name?.trim()) {
      toast.error('Vennligst fyll ut navn');
      return;
    }
    if (!newDimension.type?.trim()) {
      toast.error('Vennligst velg type');
      return;
    }
    if (!newDimension.budget?.trim()) {
      toast.error('Vennligst fyll ut budsjett');
      return;
    }

    try {
      const activeDimensionIndex = dimensionTypes.findIndex(d => d.active);
      if (activeDimensionIndex === -1) {
        toast.error('Vennligst velg en dimensjonstype');
        return;
      }

      const parentId = findParentDimensionId(createAtPath);
      
      const response = await createDimension(
        {
          customerNumber: profile?.customerNumbers[0] || '',
          dimensionName: newDimension.name,
          dimensionType: `dimension_${activeDimensionIndex + 1}`,
          budget: Number(newDimension.budget + "." + (newDimension.cents || "0")),
          parentDimension: parentId,
        },
      );


      if (response.success) {
        const newItem: Dimension = {
          id: (response.data as any).dimension_id?.toString(),
          name: newDimension.name,
          type: newDimension.type,
          budget: (response.data as any).budget?.toString().replace(".", ",") || 
                 `${newDimension.budget}${newDimension.cents ? "," + newDimension.cents : ""}`,
          children: [],
        };

        setLocalDimensions((dims) => updateDimensionAtPath(dims, createAtPath || [], newItem));
        setNewDimension({ name: "", type: "", budget: "", cents: "" });
        setIsCreating(false);
        setCreateAtPath(null);
        setShowEmptyState(false);
        setDimensionTypes(prev => prev.map(d => ({ ...d, active: false })));
        
        toast.success('Dimensjon opprettet');
      }
    } catch (error) {
      console.error('Error creating dimension:', error);
      toast.error('Kunne ikke opprette dimensjon. Vennligst prøv igjen.');
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

  const saveEdit = async () => {
    if (!editingDimension) return;

    try {
      const response = await updateDimension({
        customerNumber: profile?.customerNumbers[0] || '',
        dimensionName: editDimensionData.name,
        dimensionType: editDimensionData.type,
        dimensionValue: editingDimension.id,
        budget: Number(editDimensionData.budget + "." + (editDimensionData.cents || "0")),
      });

      if (response.success) {
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

        setLocalDimensions((prev) => updateDimensionInTree(prev));
        setEditingDimension(null);
        setEditDimensionData({ name: "", type: "", budget: "", cents: "" });
        toast.success('Dimensjon oppdatert');
      }
    } catch (error) {
      console.error('Error updating dimension:', error);
      toast.error('Det oppstod en feil ved oppdatering av dimensjon');
    }
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
console.log(dimensionTypes,"dimensionTypes");
  const handleOpenTypeModal = () => {
    const level = createAtPath?.length || 0;
    setCurrentLevel(level);
    
    // Reset all dimension types and only set the current level active
    setDimensionTypes(prev => prev.map((d, i) => ({
      ...d,
      active: i === level
    })));
    
    setShowTypeModal(true);
  };

  const handleSaveDimensionTypes = () => {
    const activeType = dimensionTypes.find(d => d.active)?.type || '';
    if (editingDimension) {
      setEditDimensionData((prev) => ({ ...prev, type: activeType }));
    } else if (isCreating) {
      setNewDimension((prev) => ({ ...prev, type: activeType }));
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
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEmptyState(false);
                  setIsCreating(true);
                  setCreateAtPath([]);
                  setNewDimension({ name: "", type: "", budget: "", cents: "" });
                  setCurrentLevel(0)
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
                    setCurrentLevel(0)
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
                  onOpenTypeModal={handleOpenTypeModal}
                />
              )}

              {localDimensions.map((dimension) => (
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
                  onOpenTypeModal={handleOpenTypeModal}
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
        currentLevel={currentLevel}
      />

      <DeleteConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        name={dimensionToDelete?.name}
        onConfirm={handleDeleteDimension}
      />
    </div>
  );
}

export default Dimensions;
