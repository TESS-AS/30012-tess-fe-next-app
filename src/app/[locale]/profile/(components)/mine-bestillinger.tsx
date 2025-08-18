"use client";

import { useEffect, useState } from "react";
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

type Order = OrderItems & {
  orderId: string; // For backward compatibility with DataTable
};

interface MineBestillingerProps {
  onOrderClick: (orderId: string) => void;
}

export const getStatusIcons = (status: string) => {
  switch (status) {
    case "Mottatt": // Written
      return <Image src="/icons/profile/table/like.svg" alt="Like" width={12} height={12} />;
    case "Bekreftet": // Confirmed
      return <Image src="/icons/profile/table/tick.svg" alt="Tick" width={12} height={12} />;
    case "Plukket": // Picked
      return <Image src="/icons/profile/table/tick.svg" alt="Tick" width={12} height={12} />;
    case "Under transport": // Shipped
      return <Image src="/icons/profile/table/truck.svg" alt="Truck" width={12} height={12} />;
    case "Levert": // Invoiced
      return <Image src="/icons/profile/table/tick.svg" alt="Tick" width={12} height={12} className="[filter:brightness(0)_invert(1)]" />;
    case "Kansellert": // Something Wrong
      return <Image src="/icons/profile/table/x.svg" alt="X" width={12} height={12} />;
    default:
      return null;
  }
};
export function MineBestillinger({ onOrderClick }: MineBestillingerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("Alle");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<OrderFilters>({
    orderNumber: undefined,
    invoiceNumber: "",
    fromDate: "",
    toDate: "",
    status: undefined
  });

  const ITEMS_PER_PAGE = 10;

  const { data: orders, isLoading, totalPages, totalItems } = useGetOrders(
    currentPage,
    ITEMS_PER_PAGE,
    filters
  );

  useEffect(() => {
    const orderNumber = searchQuery ? parseInt(searchQuery.replace(/#/g, "")) : undefined;
    setFilters(prev => ({
      ...prev,
      orderNumber: orderNumber || undefined,
      status: selectedStatus === "Alle" ? undefined : getStatusNumber(selectedStatus)
    }));
  }, [searchQuery, selectedStatus]);

  const statuses = ["Alle", "Mottatt", "Bekreftet", "Plukket", "Under transport", "Levert", "Kansellert"];

  const getStatusNumber = (status: string): number | undefined => {
    switch (status) {
      case "Mottatt": return 10; // Written
      case "Bekreftet": return 20; // Confirmed
      case "Plukket": return 30; // Picked
      case "Under transport": return 45; // Shipped
      case "Levert": return 60; // Invoiced
      case "Kansellert": return 0; // Something Wrong
      default: return undefined;
    }
  };
  
  console.log(orders,"orders test")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Mottatt": // Written
        return "bg-[#DCF7E0] text-[#005522]";
      case "Bekreftet": // Confirmed
        return "bg-[#DCF7E0] text-[#005522]";
      case "Plukket": // Picked
        return "bg-[#E5EDFF] text-[#42389D]";
      case "Under transport": // Shipped
        return "bg-[#FDF6B2] text-[#723B13]";
      case "Levert": // Invoiced
        return "bg-[#009640] text-white";
      case "Kansellert": // Something Wrong
        return "bg-[#FDE8E8] text-[#9B1C1C]";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };



  const filteredOrders = (orders || []).map(order => ({
    ...order,
    orderId: order.id.toString() // Map id to orderId for DataTable compatibility
  }));

  const columns = [
    {
      key: "id",
      header: "ORDRE ID",
      cell: (order: Order) => <span className="">#{order.id}</span>,
      sortable: true
    },
    {
      key: "date",
      header: "BESTILLINGSDATO",
      cell: (order: Order) => {
        const date = new Date(order.date);
        const formattedDate = date.toLocaleDateString('no', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }).replace(',', '');
        return <span className="">{formattedDate}</span>;
      },
      sortable: true
    },
    {
      key: "total",
      header: "PRIS",
      cell: (order: Order) => `${order.total?.toFixed(2)},-`,
      sortable: true
    },
    {
      key: "status",
      header: "STATUS",
      cell: (order: Order) => (
        <span className={cn(
          "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs",
          getStatusColor(order.status)
        )}>
          {getStatusIcons(order.status)}
          {order.status}
        </span>
      ),
      sortable: true
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold">Mine bestillinger</h1>
          <p className="text-[#5A615D] ml-4">Dine utførte bestillinger her i e-handelen.</p>
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
              type="submit"
              className="absolute right-0 top-1/2 -translate-y-1/2 h-10 px-4 bg-white hover:bg-white text-[#0F1912]  font-medium border-1 border-l-2 border-[#8A8F8C] rounded-none rounded-r-md"
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
                      selectedStatus === status ? "border-[#1C6D2C] text-[#1C6D2C]" : "border-[#C1C4C2]"
                    )}
                  />
                  <Label
                    htmlFor={status}
                    className={cn(
                      "text-sm font-medium text-[#0F1912]"
                    )}
                  >
                    {status}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <div className="">
          <DataTable
            data={filteredOrders}
            columns={columns}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
