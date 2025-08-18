"use client";

import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { Button } from "./button";
import { Check, X, RotateCcw, ChevronDown as ChevronDownIcon } from "lucide-react";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, MoreVertical, Eye, ShoppingCart, Truck, CircleX, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./dropdown-menu";

interface Column<T> {
  key: string;
  header: string;
  cell: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  onOrderClick?: (orderId: string) => void;
  expandableContent?: (item: T) => React.ReactNode;
  isExpandable?: boolean;
  data: T[];
  columns: Column<T>[];
  currentPage?: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function DataTable<T extends { orderId: string }>({ 
  onOrderClick,
  expandableContent,
  isExpandable = false,
  data,
  columns,
  currentPage = 1,
  itemsPerPage = 10,
  totalItems = 0,
  onPageChange,
  className
}: DataTableProps<T>) {
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <>
      <div className={className}>
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="border-b">
            <tr>
              {isExpandable && (
                <th className="w-10 min-w-[40px] py-4 px-4 bg-[#F8F9F8] border-b border-[#C1C4C2]"></th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "text-left text-sm py-4 px-4 font-medium bg-[#F8F9F8] border-b border-[#C1C4C2] text-[#5A615D]",
                    {
                      "min-w-[160px]": column.key === "orderId",
                      "min-w-[140px]": column.key === "requester",
                      "min-w-[120px]": column.key === "createdDate",
                      "min-w-[100px]": column.key === "price",
                      "min-w-[180px]": column.key === "status"
                    }
                  )}
                >
                  {column.header}
                  {column.sortable && (
                    <button className="ml-1 text-gray-400">
                      <Image src="/icons/toggle-caret.svg" alt="Toggle" width={8} height={8} />
                    </button>
                  )}
                </th>
              ))}
              <th className="w-20 min-w-[80px] py-4 px-4 bg-[#F8F9F8] border-b border-[#C1C4C2] sticky right-0"></th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <React.Fragment key={index}>
                <tr className="group border-b border-[#C1C4C2] hover:bg-[#F8F9F8] transition-colors duration-200">
                  {isExpandable && (
                    <td className="w-10 py-4 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 transition-all duration-200"
                        onClick={() => {
                          setExpandedRows((prev: number[]) =>
                            prev.includes(index)
                              ? prev.filter((i: number) => i !== index)
                              : [...prev, index]
                          );
                        }}
                      >
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            expandedRows.includes(index) ? "rotate-180 text-[#1C6D2C]" : ""
                          )}
                        />
                      </Button>
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className="py-4 px-4 text-[#0F1912] font-medium">
                      {column.cell(item)}
                    </td>
                  ))}
                  <td className="py-4 px-4 text-right sticky right-0 bg-white group-hover:bg-[#F8F9F8]">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 text-[#5A615D] hover:text-[#0F1912]"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuItem 
                          className="flex items-center gap-3 text-xs"
                          onClick={() => onOrderClick?.(item.orderId)}
                        >
                          <Eye className="h-4 w-4" />
                          <span>Vis ordre</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-3 text-xs">
                          <ShoppingCart className="h-4 w-4" />
                          <span>Legg til varer i ny handlekurv</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-3 text-xs">
                          <Truck className="h-4 w-4" />
                          <span>Spor bestillingen</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-3 text-xs">
                          <CircleX className="h-4 w-4" />
                          <span>Kanseller bestilling</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
                {isExpandable && expandedRows.includes(index) && expandableContent && (
                  <tr className="border-b border-[#C1C4C2] bg-[#F3FAF7] animate-in fade-in-0 zoom-in-95 duration-200">
                    <td colSpan={columns.length + 2} className="py-6 pl-16 border-t border-[#E5E7E6]">
                      {expandableContent(item)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        </div>
      </div>
      {totalItems > 0 && (
        <div className="flex items-center justify-between px-2 py-4">
          <p className="text-sm text-gray-700">
            Viser {startItem} til {endItem} av {totalItems} resultater
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600 px-2">
              Side {currentPage} av {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={!totalPages || currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>

    </>
  );
}
