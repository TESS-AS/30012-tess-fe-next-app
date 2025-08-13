"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlusIcon, X, ChevronDown as ChevronDownIcon, Info } from "lucide-react";
import { useState, Fragment, ReactElement } from "react";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import Image from "next/image";
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

export function Dimensions() {
  const [showEmptyState, setShowEmptyState] = useState(true);
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [parentPath, setParentPath] = useState<string[]>([]);
  const [newDimension, setNewDimension] = useState({
    name: "",
    type: "",
    budget: "",
    cents: "",
  });

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

  const renderDimensionRow = (dimension: Dimension, path: string[], level: number): ReactElement => (
    <Fragment key={dimension.id}>
      <tr
        className={cn("hover:bg-[#F8F9F8] group", level > 0 && `pl-${6 * level}`)}
        onClick={(e) => {
          e.stopPropagation();
          toggleExpand(dimension.id);
        }}
      >
        <td className={`py-4 px-4 flex items-center gap-2 ${level > 0 ? `pl-${8 + level * 2}` : ''}`}>
          {dimension.children && dimension.children.length > 0 && (
            <ChevronDownIcon
              className={cn(
                "h-4 w-4 transition-transform",
                dimension.isExpanded ? "transform rotate-180" : ""
              )}
            />
          )}
          {dimension.name}
        </td>
        <td className="py-4 px-4">
          <span className="bg-[#F8F9F8] px-2 py-1 rounded text-sm">
            {dimension.type}
          </span>
        </td>
        <td className="py-4 px-4">{dimension.budget}</td>
        <td className="py-4 px-4">
          <div className="invisible group-hover:visible flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="p-1 hover:bg-[#F8F9F8] rounded"
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
            <button className="p-1 hover:bg-[#F8F9F8] rounded">
              <span className="text-sm">•••</span>
            </button>
          </div>
        </td>
      </tr>
      {dimension.isExpanded && dimension.children?.map(child => 
        renderDimensionRow(child, [...path, dimension.id], level + 1)
      )}
    </Fragment>
  );

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
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#5A615D]">Viser prosjekt for:</span>
                <span className="text-sm font-semibold">Alle</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="text-[#005522] hover:text-[#005522] hover:bg-[#F3FAF7]"
                >
                  Endre dimensjonstyper
                </Button>
                <Button
                  variant="green"
                  onClick={() => {
                    setIsEditing(true);
                    setParentPath([]);
                  }}
                >
                  <PlusIcon className="h-4 w-4" />
                  Lag ny dimensjon
                </Button>
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
                        placeholder="Karmøy"
                        className="w-full border-[#1C6D2C]"
                        value={newDimension.name}
                        onChange={(e) => setNewDimension({ ...newDimension, name: e.target.value })}
                      />
                    </td>
                    <td className="py-2 px-4">
                      <Input 
                        placeholder="Avdeling"
                      className="w-full"
                      value={newDimension.type}
                      onChange={(e) => setNewDimension({ ...newDimension, type: e.target.value })}
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
                        className="h-8 w-8"
                        onClick={() => setShowEmptyState(true)}
                      >
                        <X className="h-4 w-4" />
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
        </div>
      )}
    </div>
  );
}
