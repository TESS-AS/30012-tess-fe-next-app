"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronDownIcon,
  MoreHorizontal,
  PlusIcon,
  CirclePlus,
  PenSquare,
  Trash2,
  X,
  Info,
  SquarePen,
  Check,
} from "lucide-react";
import type { ReactElement } from "react";
import { useEffect, useMemo, useRef, useState, Fragment, memo } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Modal, ModalHeader, ModalTitle } from "@/components/ui/modal";
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


interface Dimension {
  id: string;
  name: string;
  type: string;
  budget: string;
  children?: Dimension[];
  isExpanded?: boolean;
}

interface DimensionType {
  dimension: string;
  type: string;
  active: boolean;
}


const projects = [
  { value: "all", label: "Alle" },
  { value: "norsk-hydro", label: "Norsk Hydro" },
  { value: "equinor", label: "Equinor" },
  { value: "aker", label: "Aker Solutions" },
];


/** ---------------- NewRow (extracted & memoized) ---------------- */

type NewRowProps = {
  level: number;
  newRowKey: string;
  newDimension: { name: string; type: string; budget: string; cents: string };
  setNewDimension: React.Dispatch<
    React.SetStateAction<{ name: string; type: string; budget: string; cents: string }>
  >;
  handleAddDimension: () => void;
  cancelNew: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  onOpenTypeModal: () => void;
};

const NewRow = memo(function NewRow({
  level,
  newRowKey,
  newDimension,
  setNewDimension,
  handleAddDimension,
  cancelNew,
  inputRef,
  onOpenTypeModal,
}: NewRowProps): ReactElement {
  useEffect(() => {
    if (inputRef?.current) {
      inputRef.current.focus();
      inputRef.current.select?.();
    }
  }, [level, newRowKey]);

  const stopRow = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <tr key={newRowKey} className="bg-[#F3FAF7]" onClick={stopRow}>
      <td className="py-2 px-4">
        <div style={{ marginLeft: `${level * 24}px` }}>
          <Input
            ref={inputRef}
            placeholder="Skriv inn navn"
            className="w-full border-[#C1C4C2] hover:border-[#009640] focus:border-[#009640] focus:ring-1 focus:ring-[#009640]"
            value={newDimension.name}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              const value = e.target.value;
              setNewDimension((prev) => ({ ...prev, name: value }));
            }}
          />
        </div>
      </td>
      <td className="py-2 px-4">
        <Input
          placeholder="Sett type"
          className="w-full cursor-pointer border-[#C1C4C2] hover:border-[#009640] focus:border-[#009640] focus:ring-1 focus:ring-[#009640] bg-[#F3FAF7]"
          value={newDimension.type}
          onClick={(e) => {
            e.stopPropagation();
            onOpenTypeModal();
          }}
          readOnly
        />
      </td>
      <td className="py-2 px-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="466"
            className="w-[80px] text-right border-[#C1C4C2] hover:border-[#009640] focus:border-[#009640] focus:ring-1 focus:ring-[#009640]"
            value={newDimension.budget}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, "");
              setNewDimension((prev) => ({ ...prev, budget: value }));
            }}
          />
          ,
          <Input
            placeholder="00"
            className="w-[60px] text-right border-[#C1C4C2] hover:border-[#009640] focus:border-[#009640] focus:ring-1 focus:ring-[#009640]"
            value={newDimension.cents}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, "");
              setNewDimension((prev) => ({ ...prev, cents: value }));
            }}
          />
          <span>,- kr</span>
        </div>
      </td>
      <td className="py-2 px-4">
        <div className="flex items-center gap-2">
          <Button variant="green" onClick={handleAddDimension} size="sm">
            Lagre
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-0 text-[#C81E1E] shadow-none"
            onClick={cancelNew}
          >
            <X className="h-10 w-10" />
          </Button>
        </div>
      </td>
    </tr>
  );
});

export function Dimensions(): ReactElement {
  const [showEmptyState, setShowEmptyState] = useState(true);
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [selectedProject, setSelectedProject] = useState(projects[0]);
  const [open, setOpen] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dimensionToDelete, setDimensionToDelete] = useState<{ id: string; name: string; path: string[] } | null>(null);

  const [editingDimension, setEditingDimension] = useState<{ id: string; path: string[] } | null>(null);
  const [editDimensionData, setEditDimensionData] = useState({ name: "", type: "", budget: "", cents: "" });

  const [isCreating, setIsCreating] = useState(false);
  const [createAtPath, setCreateAtPath] = useState<string[] | null>(null);
  const newRowKey = useMemo(() => `newrow:${(createAtPath || []).join("/")}`, [createAtPath]);

  const [showTypeModal, setShowTypeModal] = useState(false);
  const [dimensionTypes, setDimensionTypes] = useState<DimensionType[]>([
    { dimension: "1", type: "", active: false },
    { dimension: "2", type: "", active: false },
    { dimension: "3", type: "", active: false },
  ]);

  const [newDimension, setNewDimension] = useState({ name: "", type: "", budget: "", cents: "" });

  const newNameRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
  const editNameRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

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
          const updated = {
            ...dim,
            name: editDimensionData.name,
            type: editDimensionData.type,
            budget: `${editDimensionData.budget}${editDimensionData.cents ? "," + editDimensionData.cents : ""}`,
          };
          return updated;
        }
        return dim.children ? { ...dim, children: updateDimensionInTree(dim.children) } : dim;
      });

    setDimensions((prev) => {
      const next = updateDimensionInTree(prev);

      return next;
    });

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

  const handleTypeChange = (index: number, value: string) => {
    setDimensionTypes((prev) => {
      if (prev[index].type === value) {
        return prev;
      }
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

  const renderDimensionRow = (dimension: Dimension, path: string[], level: number): ReactElement => {
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
            if (target.closest("input, button, [role='button'], [data-no-row-toggle]")) return;
            if (dimension.children?.length) {
              toggleExpand(dimension.id);
            }
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
                    <ChevronDownIcon
                      className={cn("h-4 w-4 transition-transform", dimension.isExpanded && "rotate-180")}
                    />
                  </button>
                )}
                {isEditingThis ? (
                  <div className="flex-1">
                    <Input
                      ref={editNameRef}
                      value={editDimensionData.name}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEditDimensionData((prev) => ({ ...prev, name: value }));
                      }}
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
                    setShowTypeModal(true);
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
                    setEditDimensionData((prev) => ({ ...prev, budget: value }));
                  }}
                  className="w-[80px] h-8 px-2 text-right border-[#C1C4C2] hover:border-[#009640] focus:border-[#009640] focus:ring-1 focus:ring-[#009640]"
                />
                ,
                <Input
                  value={editDimensionData.cents}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setEditDimensionData((prev) => ({ ...prev, cents: value }));
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
                      setEditingDimension(null);
                      setEditDimensionData({ name: "", type: "", budget: "", cents: "" });
                    }}
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
                        <button
                          className="p-0.5 border border-[#5A615D] rounded-full cursor-pointer hover:bg-[#E8EAE9] hover:border-[#C1C4C2] hover:text-[#009640]"
                          onClick={(e) => {
                            e.stopPropagation();
                            addSubcategory([...path, dimension.id]);
                          }}
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
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
                          setDimensionToDelete({ id: dimension.id, name: dimension.name, path });
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
          dimension.children?.map((child) => renderDimensionRow(child, [...path, dimension.id], level + 1))}
        {isCreating && pathEquals(createAtPath, [...path, dimension.id]) && (
          <NewRow
            level={level + 1}
            newRowKey={newRowKey}
            newDimension={newDimension}
            setNewDimension={setNewDimension}
            handleAddDimension={handleAddDimension}
            cancelNew={cancelNew}
            inputRef={newNameRef}
            onOpenTypeModal={() => setShowTypeModal(true)}
          />
        )}
      </Fragment>
    );
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
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-[200px] justify-between text-[#0F1912] font-medium border-[#C1C4C2] hover:bg-[#F3FAF7]"
                    >
                      {selectedProject.label}
                      <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Søk prosjekt..." />
                      <CommandEmpty>Ingen prosjekter funnet.</CommandEmpty>
                      <CommandGroup>
                        {projects.map((project) => (
                          <CommandItem
                            key={project.value}
                            value={project.value}
                            onSelect={() => {
                              setSelectedProject(project);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedProject.value === project.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {project.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
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
              {dimensions.map((dimension) => renderDimensionRow(dimension, [], 0))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showTypeModal} onOpenChange={(v) => {
        setShowTypeModal(v);
        if (!v) {
          setTimeout(returnFocusAfterTypePick, 0);
        }
      }}>
        <ModalHeader>
          <ModalTitle>Sett dimensjonstyper</ModalTitle>
        </ModalHeader>
        <div className="space-y-8 p-6">
          {dimensionTypes.map((dim, index) => (
            <div key={dim.dimension} className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm">Dimensjon</p>
                  <Input value={dim.dimension} className="bg-[#F8F9F8] border-[#C1C4C2]" readOnly />
                  <div className="flex items-center gap-2 pt-1">
                    <Checkbox
                      id={`active-${dim.dimension}`}
                      checked={dim.active}
                      onCheckedChange={(checked) => handleActiveChange(index, checked as boolean)}
                    />
                    <label htmlFor={`active-${dim.dimension}`} className="text-sm">
                      Aktiv
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm">Type</p>
                  <Input
                    placeholder="Skriv type"
                    className="bg-white border-[#C1C4C2] hover:border-[#009640] focus:border-[#009640] focus:ring-1 focus:ring-[#009640]"
                    value={dim.type}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      handleTypeChange(index, e.target.value);
                    }}
                  />
                  {index === 0 && <p className="text-xs text-[#6B7280]">Eksempel: Prosjekt, avdeling, arbeidsordre osv.</p>}
                </div>
              </div>
              {index === 0 && (
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Dimensjon vises på utsjekk
                  <br />
                  og blir påkrevd å fylle ut av alle ansatte
                </p>
              )}
            </div>
          ))}
          <Button onClick={handleSaveDimensionTypes} className="bg-[#009640] hover:bg-[#005522] text-white w-fit">
            Lagre dimensjonstyper
          </Button>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <div className="p-6 space-y-6">
          <div className="flex justify-center">
            <Trash2 className="h-6 w-6 text-[#6B726F]" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-base text-[#5A615D]">Er du sikker på at du vil slette "{dimensionToDelete?.name}"?</p>
            <p className="text-base text-[#5A615D]">Dette vil også slette alle underliggende elementer.</p>
          </div>
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              className="border-[#C1C4C2] text-[#0F1912] hover:bg-[#F3FAF7] hover:text-[#0F1912]"
              onClick={() => setShowDeleteModal(false)}
            >
              Nei, avbryt
            </Button>
            <Button
              className="bg-[#C81E1E] hover:bg-[#A01818] text-white"
              onClick={() => {
                if (dimensionToDelete) {
                  deleteDimension(dimensionToDelete.id, dimensionToDelete.path);
                  setShowDeleteModal(false);
                  setDimensionToDelete(null);
                }
              }}
            >
              Ja, jeg er sikker
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
