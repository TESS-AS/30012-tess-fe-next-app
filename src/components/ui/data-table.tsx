"use client";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Column<T> {
  key: string;
  header: string;
  cell: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  currentPage?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  className
}: DataTableProps<T>) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={className}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="text-left text-sm py-4 px-4 font-medium bg-[#F8F9F8] border-b border-[#C1C4C2] text-[#5A615D]"
                >
                  {column.header}
                  {column.sortable && (
                    <button className="ml-1 text-gray-400">
                      <Image src="/icons/toggle-caret.svg" alt="Toggle" width={8} height={8} />
                    </button>
                  )}
                </th>
              ))}
              <th className="py-4 px-4 bg-[#F8F9F8] border-b border-[#C1C4C2]"></th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="border-b border-[#C1C4C2]">
                {columns.map((column) => (
                  <td key={column.key} className="py-4 px-4 text-[#0F1912] font-medium">
                    {column.cell(item)}
                  </td>
                ))}
                <td className="py-4 px-4 text-right">
                  <button className="text-gray-400 hover:text-gray-600">•••</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalItems > 0 && (
          <div className="flex items-center justify-between text-sm text-[#5A615D] p-4">
          <div>
            Viser <span className="font-bold text-[#0F1912]">{startItem}-{endItem}</span> av <span className="font-bold text-[#0F1912]">{totalItems}</span>
          </div>
          <div className="flex items-center divide-x divide-[#C1C4C2] border border-[#C1C4C2] rounded-md overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-[#F8F9F8] hover:text-[#0F1912] rounded-none"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant="ghost"
                  className={cn(
                    "h-8 w-8 hover:bg-[#F8F9F8] rounded-none hover:text-[#0F1912]",
                    currentPage === pageNum && "bg-[#DCF7E0] text-[#1C6D2C] hover:bg-[#DCF7E0] hover:text-[#1C6D2C]"
                  )}
                  onClick={() => onPageChange?.(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            {totalPages > 5 && (
              <Button 
                variant="ghost" 
                className="h-8 w-8 hover:bg-[#F8F9F8] rounded-none hover:text-[#0F1912]"
              >
                ...
              </Button>
            )}
            {totalPages > 5 && (
              <Button
                variant="ghost"
                className="h-8 w-8 hover:bg-[#F8F9F8] rounded-none hover:text-[#0F1912]"
                onClick={() => onPageChange?.(totalPages)}
              >
                {totalPages}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-[#F8F9F8] hover:text-[#0F1912]"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
