"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import Image from "next/image";
import { OrderFilters, useGetOrders } from "@/hooks/useGetOrders";
import { OrderItems } from "@/types/orderHistory.types";

type Order = OrderItems & { orderId: string };

export const getStatusIcons = (status: string) => {
  switch (status) {
    case "Mottatt":
      return <Image src="/icons/profile/table/like.svg" alt="Like" width={12} height={12} />;
    case "Bekreftet":
    case "Plukket":
      return <Image src="/icons/profile/table/tick.svg" alt="Tick" width={12} height={12} />;
    case "Under transport":
      return <Image src="/icons/profile/table/truck.svg" alt="Truck" width={12} height={12} />;
    case "Levert":
      return (
        <Image
          src="/icons/profile/table/tick.svg"
          alt="Tick"
          width={12}
          height={12}
          className="[filter:brightness(0)_invert(1)]"
        />
      );
    case "Kansellert":
      return <Image src="/icons/profile/table/x.svg" alt="X" width={12} height={12} />;
    default:
      return null;
  }
};

export function OrdreHistorikk() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("Alle");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  const neutralFilters: OrderFilters = {
    orderNumber: undefined,
    invoiceNumber: "",
    fromDate: "",
    toDate: "",
    status: undefined,
  };

  const { data: orders, isLoading } = useGetOrders(
    1,
    9999,
    neutralFilters
  );

  const statuses = ["Alle", "Mottatt", "Bekreftet", "Plukket", "Under transport", "Levert", "Kansellert"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Mottatt":
      case "Bekreftet":
        return "bg-[#DCF7E0] text-[#005522]";
      case "Plukket":
        return "bg-[#E5EDFF] text-[#42389D]";
      case "Under transport":
        return "bg-[#FDF6B2] text-[#723B13]";
      case "Levert":
        return "bg-[#009640] text-white";
      case "Kansellert":
        return "bg-[#FDE8E8] text-[#9B1C1C]";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const normalizedQuery = searchQuery.trim().replace(/^#/, "").toLowerCase();

  const tableData: Order[] = useMemo(
    () =>
      (orders || []).map((order) => ({
        ...order,
        orderId: String(order.id),
      })),
    [orders]
  );

  const filteredOrders: Order[] = useMemo(() => {
    const matchesQuery = (o: any) => {
      if (!normalizedQuery) return true;
      const candidates = [
        o.id,
        o.orderNumber,
        o.invoiceNumber,
        o.customerName,
        o.customer,
      ]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase());

      return candidates.some((v) => v.includes(normalizedQuery));
    };

    const statusOk =
      selectedStatus === "Alle" ? () => true : (o: any) => o.status === selectedStatus;

    return tableData.filter((o) => matchesQuery(o) && statusOk(o));
  }, [tableData, normalizedQuery, selectedStatus]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus]);

  const derivedTotalItems = filteredOrders.length;
  const derivedTotalPages = Math.max(1, Math.ceil(derivedTotalItems / ITEMS_PER_PAGE));
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageRows = filteredOrders.slice(start, end);

  const columns = [
    {
      key: "id",
      header: "ORDRE ID",
      cell: (order: Order) => <span>#{order.id}</span>,
      sortable: true,
    },
    {
      key: "date",
      header: "BESTILLINGSDATO",
      cell: (order: Order) => {
        const date = new Date(order.date);
        const formattedDate = date
          .toLocaleDateString("no", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
          .replace(",", "");
        return <span>{formattedDate}</span>;
      },
      sortable: true,
    },
    {
      key: "total",
      header: "PRIS",
      cell: (order: Order) => `${order.total?.toFixed(2)},-`,
      sortable: true,
    },
    {
      key: "status",
      header: "STATUS",
      cell: (order: Order) => (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs",
            getStatusColor(order.status)
          )}
        >
          {getStatusIcons(order.status)}
          {order.status}
        </span>
      ),
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold">Ordrehistorikk</h1>
          <p className="text-[#5A615D] ml-4">
            <span className="font-semibold">Alle selskapets ordre </span>
            (e-handel,service senter, forsyningsløsninger, per e-post etc)
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#C1C4C2]">
        <div className="p-6 space-y-6">
          <div className="relative flex w-full max-w-[480px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#5A615D]" />
            <Input
              placeholder="Søk etter ordre-ID eller kundenavn"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 pl-12 pr-24 h-10 text-base border border-[#8A8F8C] rounded-md bg-[#F8F9F8] text-[#5A615D] font-sm"
            />
            <Button
              type="button"
              onClick={() => {/* optional manual trigger; filtering is instant */}}
              className="absolute right-0 top-1/2 -translate-y-1/2 h-10 px-4 bg-white hover:bg-white text-[#0F1912] font-medium border-1 border-l-2 border-[#8A8F8C] rounded-none rounded-r-md"
            >
              Søk
            </Button>
          </div>

          <div className="flex items-center gap-3 border-t border-[#C1C4C2] pt-6">
            <p className="text-sm font-bold text-[#0F1912]">Status:</p>
            <RadioGroup
              value={selectedStatus}
              onValueChange={setSelectedStatus}
              className="flex flex-wrap gap-3"
            >
              {statuses.map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={status}
                    id={status}
                    className={cn(
                      "h-5 w-5",
                      selectedStatus === status
                        ? "border-[#1C6D2C] text-[#1C6D2C]"
                        : "border-[#C1C4C2]"
                    )}
                  />
                  <Label htmlFor={status} className="text-sm font-medium text-[#0F1912]">
                    {status}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <div>
          <DataTable
            data={pageRows}            
            columns={columns}
            currentPage={currentPage}
            totalPages={derivedTotalPages}
            totalItems={derivedTotalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
