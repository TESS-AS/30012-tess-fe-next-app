"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  ChevronDownIcon, 
  MoreVertical, 
  PlusIcon, 
  CirclePlus, 
  PenSquare, 
  Trash2, 
  X, 
  Info, 
  SquarePen, 
  Check, 
  MoreHorizontal, 
  CircleX 
} from "lucide-react";
import type { ReactElement } from "react";
import { useState, Fragment } from "react";
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

export function Dimensions(): ReactElement {
  const [showEmptyState, setShowEmptyState] = useState(true);
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [selectedProject, setSelectedProject] = useState(projects[0]);
  const [open, setOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dimensionToDelete, setDimensionToDelete] = useState<{id: string; name: string; path: string[]} | null>(null);
  const [editingDimension, setEditingDimension] = useState<{id: string; path: string[]} | null>(null);
  const [editDimensionData, setEditDimensionData] = useState({
    name: "",
    type: "",
    budget: "",
    cents: "",
  });

  const startEditing = (dimension: Dimension, path: string[]) => {
    setEditingDimension({ id: dimension.id, path });
    setEditDimensionData({
      name: dimension.name,
      type: dimension.type || "",
      budget: dimension.budget || "",
      cents: "", // Add cents handling if needed
    });
  };

  const saveEdit = () => {
    if (!editingDimension) return;

    const updateDimensionInTree = (dims: Dimension[]): Dimension[] => {
      return dims.map(dim => {
        if (dim.id === editingDimension.id) {
          return {
            ...dim,
            name: editDimensionData.name,
            type: editDimensionData.type,
            budget: editDimensionData.budget,
          };
        }
        if (dim.children) {
          return {
            ...dim,
            children: updateDimensionInTree(dim.children)
          };
        }
        return dim;
      });
    };

    setDimensions(prev => updateDimensionInTree(prev));
    setEditingDimension(null);
    setEditDimensionData({ name: "", type: "", budget: "", cents: "" });
  };

  const deleteDimension = (id: string, path: string[]) => {
    const deleteRecursively = (dims: Dimension[], targetId: string): Dimension[] => {
      return dims.filter(dim => {
        if (dim.id === targetId) return false;
        if (dim.children) {
          dim.children = deleteRecursively(dim.children, targetId);
        }
        return true;
      });
    };

    setDimensions(prev => deleteRecursively(prev, id));
  };
  const [isEditing, setIsEditing] = useState(false);
  const [parentPath, setParentPath] = useState<string[]>([]);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [dimensionTypes, setDimensionTypes] = useState<DimensionType[]>([
    { dimension: "1", type: "", active: false },
    { dimension: "2", type: "", active: false },
    { dimension: "3", type: "", active: false }
  ]);
  const [newDimension, setNewDimension] = useState({
    name: "",
    type: "",
    budget: "",
    cents: "",
  });

  const handleTypeChange = (index: number, value: string) => {
    setDimensionTypes(prev => {
      const newTypes = [...prev];
      newTypes[index] = { ...newTypes[index], type: value };
      return newTypes;
    });
  };

  const handleActiveChange = (index: number, checked: boolean) => {
    setDimensionTypes(prev => {
      const newTypes = [...prev];
      newTypes[index] = { ...newTypes[index], active: checked };
      return newTypes;
    });
  };

  const handleSaveDimensionTypes = () => {
    const activeTypes = dimensionTypes
      .filter(d => d.active)
      .map(d => d.type)
      .join(" < ");
    setNewDimension(prev => ({ ...prev, type: activeTypes }));
    setShowTypeModal(false);
  };

  const addSubcategory = (path: string[]) => {
    setIsEditing(true);
    setParentPath(path);
    setNewDimension({ name: "", type: "", budget: "", cents: "" });
  };

  const updateDimensionAtPath = (dims: Dimension[], path: string[], newItem: Dimension): Dimension[] => {
    if (path.length === 0) {
      return [...dims, newItem];
    }

    return dims.map(d => {
      if (d.id === path[0]) {
        return {
          ...d,
          children: updateDimensionAtPath(d.children || [], path.slice(1), newItem),
          isExpanded: true, // Auto-expand when adding child
        };
      }
      return d;
    });
  };

  const handleAddDimension = () => {
    if (newDimension.name && newDimension.type && newDimension.budget) {
      const newItem = {
        id: `dim_${Date.now()}`,
        name: newDimension.name,
        type: newDimension.type,
        budget: `${newDimension.budget}${newDimension.cents ? ',' + newDimension.cents : ''},- kr`,
        children: [],
      };

      setDimensions(dims => updateDimensionAtPath(dims, parentPath, newItem));
      setNewDimension({ name: "", type: "", budget: "", cents: "" });
      setIsEditing(false);
      setParentPath([]);
      setShowEmptyState(false);
    }
  };

  const toggleExpand = (dimensionId: string) => {
    const updateDimension = (dims: Dimension[]): Dimension[] => {
      return dims.map(dim => {
        if (dim.id === dimensionId) {
          const newExpanded = !dim.isExpanded;
          if (!newExpanded && dim.children) {
            // If collapsing, recursively collapse all children
            return {
              ...dim,
              isExpanded: false,
              children: dim.children.map(child => ({
                ...child,
                isExpanded: false,
                children: child.children ? child.children.map(grandchild => ({
                  ...grandchild,
                  isExpanded: false
                })) : undefined
              }))
            };
          }
          return { ...dim, isExpanded: newExpanded };
        } else if (dim.children) {
          // Recursively search in children
          return {
            ...dim,
            children: updateDimension(dim.children)
          };
        }
        return dim;
      });
    };

    setDimensions(updateDimension(dimensions));
  };

  const renderDimensionRow = (dimension: Dimension, path: string[], level: number): ReactElement => {
    const isEditing = editingDimension?.id === dimension.id;

    return (
    <Fragment key={dimension.id}>
      <tr
        className="hover:bg-[#DCF7E0] group"
        onClick={(e) => {
          if (!isEditing) {
            e.stopPropagation();
            toggleExpand(dimension.id);
          }
        }}
      >
        <td className="py-4 px-4">
          <div className="flex items-center gap-2">
            <div style={{ marginLeft: `${level * 24}px` }} className="flex items-center gap-2">
              {dimension.children && dimension.children.length > 0 && (
                <ChevronDownIcon
                  className={cn(
                    "h-4 w-4 transition-transform",
                    dimension.isExpanded && "rotate-180"
                  )}
                />
              )}
              {isEditing ? (
                <Input
                  value={editDimensionData.name}
                  onChange={(e) => setEditDimensionData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border-[#1C6D2C]"
                />
              ) : (
                dimension.name
              )}
            </div>
          </div>
        </td>
        <td className="py-4 px-4">
          {isEditing ? (
            <Input
              value={editDimensionData.type}
              onChange={(e) => setEditDimensionData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full"
              onClick={() => setShowTypeModal(true)}
              readOnly
            />
          ) : (
            <span className="bg-[#E8EAE9] px-2 py-1 rounded text-sm">
              {dimension.type}
            </span>
          )}
        </td>
        <td className="py-4 px-4">
          {isEditing ? (
            <div className="flex items-center gap-1">
              <Input
                value={editDimensionData.budget}
                onChange={(e) => setEditDimensionData(prev => ({ ...prev, budget: e.target.value }))}
                className="w-[120px]"
              />
              <span>,- kr</span>
            </div>
          ) : (
            dimension.budget
          )}
        </td>
        <td className="py-4 px-4">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#C1C4C2] hover:bg-[#F3FAF7] hover:text-[#0F1912]"
                  onClick={() => {
                    setEditingDimension(null);
                    setEditDimensionData({ name: "", type: "", budget: "", cents: "" });
                  }}
                >
                  Avbryt
                </Button>
                <Button
                  size="sm"
                  className="bg-[#009640] hover:bg-[#005522] text-white"
                  onClick={saveEdit}
                >
                  Lagre
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="p-0.5 border-1 border-[#5A615D] rounded-full cursor-pointer hover:bg-[#E8EAE9] hover:border-[#C1C4C2] hover:text-[#009640]"
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
                  <button
                    className="p-1 hover:bg-[#E8EAE9] rounded cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
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
                      setDimensionToDelete({ id: dimension.id, name: dimension.name, path: path });
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
      {dimension.isExpanded && dimension.children?.map(child => 
        renderDimensionRow(child, [...path, dimension.id], level + 1)
      )}
    </Fragment>
  );
};

  const columns = [
    {
      key: "name",
      header: "NAVN",
      cell: (dimension: Dimension) => dimension.name,
    },
    {
      key: "type",
      header: "TYPE",
      cell: (dimension: Dimension) => dimension.type,
    },
    {
      key: "budget",
      header: "BUDSJETT",
      cell: (dimension: Dimension) => (
        <div className="flex items-center gap-2">
          <span>{dimension.budget}</span>
          <span>,- kr</span>
        </div>
      ),
    },
  ];



  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold">Konteringsdimensjoner</h1>
          <p className="text-[#5A615D] ml-4">Organiser prosjekter, avdelinger, arbeidsordre osv i hierarkisk struktur med budsjetter. Konteringsdimensjoner du legger til her vises i utsjekk for alle dine brukere.</p>
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
                onClick={() => setShowEmptyState(false)}
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
                >
                  <SquarePen className="h-4 w-4" />
                  Endre dimensjonstyper
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(true);
                    setParentPath([]);
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
                  <th className="w-[100px] text-left text-sm py-4 px-4 font-medium bg-[#F8F9F8] text-[#5A615D]">HANDLING</th>
                </tr>
              </thead>
              <tbody>
                {isEditing ? (
                  <tr>
                    <td className="py-2 px-4">
                      <Input 
                        placeholder="Skriv inn navn"
                        className="w-full border-[#1C6D2C]"
                        value={newDimension.name}
                        onChange={(e) => setNewDimension({ ...newDimension, name: e.target.value })}
                      />
                    </td>
                    <td className="py-2 px-4">
                      <Input 
                        placeholder="Sett type"
                        className="w-full cursor-pointer"
                        value={newDimension.type}
                        onClick={() => setShowTypeModal(true)}
                        readOnly
                      />
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-2">
                      <Input 
                        placeholder="466"
                        className="w-[80px]"
                        value={newDimension.budget}
                        onChange={(e) => setNewDimension({ ...newDimension, budget: e.target.value })}
                      />
                      ,
                      <Input 
                        placeholder="00"
                        className="w-[60px]"
                        value={newDimension.cents}
                        onChange={(e) => setNewDimension({ ...newDimension, cents: e.target.value })}
                      />
                      <span>,- kr</span>
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="green"
                        onClick={handleAddDimension}
                        size="sm"
                      >
                        Lagre
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-0 text-[#C81E1E] shadow-none"
                        onClick={() => setShowEmptyState(true)}
                      >
                        <X className="h-10 w-10" />
                      </Button>
                    </div>
                  </td>
                </tr>
                ) : (
                  dimensions.map((dimension) => (
                    renderDimensionRow(dimension, [], 0)
                  ))
                )}
              </tbody>
            </table>
        </div>
      )}
      <Modal open={showTypeModal} onOpenChange={setShowTypeModal}>
        <ModalHeader>
          <ModalTitle>Sett dimensjonstyper</ModalTitle>
        </ModalHeader>
        <div className="space-y-8">
          {dimensionTypes.map((dim, index) => (
            <div key={dim.dimension} className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm">Dimensjon</p>
                  <Input
                    value={dim.dimension}
                    className="bg-[#F8F9F8]"
                    readOnly
                  />
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
                    className="bg-white"
                    value={dim.type}
                    onChange={(e) => handleTypeChange(index, e.target.value)}
                  />
                  {index === 0 && (
                    <p className="text-xs text-[#6B7280]">
                      Eksempel: Prosjekt, avdeling, arbeidsordre osv.
                    </p>
                  )}
                </div>
              </div>
              {index === 0 && (
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Dimensjon vises på utsjekk<br />og blir påkrevd å fylle ut av alle ansatte
                </p>
              )}
            </div>
          ))}
          <Button 
            onClick={handleSaveDimensionTypes}
            className="bg-[#009640] hover:bg-[#005522] text-white w-fit"
          >
            Lagre dimensjonstyper
          </Button>
        </div>
      </Modal>

      <Modal open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <div className="p-6 space-y-6">
          <div className="flex justify-center">
            <X className="h-6 w-6 text-[#C81E1E]" />
          </div>
          <div className="text-center space-y-2">
            <p className="font-medium">Er du sikker på at du vil slette "{dimensionToDelete?.name}"?</p>
            <p className="text-sm text-[#5A615D]">Dette vil også slette alle underliggende elementer.</p>
          </div>
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              className="border-[#C1C4C2] hover:bg-[#F3FAF7] hover:text-[#0F1912]"
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
