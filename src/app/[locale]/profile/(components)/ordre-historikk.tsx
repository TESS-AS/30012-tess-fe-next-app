import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DataTable } from "@/components/ui/data-table";
import { Search } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

const mockOrders = [
  {
    orderId: "#123456",
    date: "2023-08-01",
    totalAmount: "kr 1,499.00",
    status: "Levert",
  },
  {
    orderId: "#123457",
    date: "2023-07-28",
    totalAmount: "kr 2,299.00",
    status: "Kansellert",
  },
  {
    orderId: "#123458",
    date: "2023-07-25",
    totalAmount: "kr 899.00",
    status: "Levert",
  },
];

export function OrdreHistorikk() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Alle");
  const [currentPage, setCurrentPage] = useState(1);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Mottatt":
        return "bg-[#DCF7E0] text-[#005522]";
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

  const getStatusIcons = (status: string) => {
    switch (status) {
      case "Levert":
        return <Image src="/icons/profile/table/tick.svg" alt="Tick" width={12} height={12} className="[filter:brightness(0)_invert(1)]" />;
      case "Kansellert":
        return <Image src="/icons/profile/table/x.svg" alt="X" width={12} height={12} />;
      default:
        return null;
    }
  };

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         searchQuery.toLowerCase().includes(order.orderId.toLowerCase().replace("#", ""));
    const matchesStatus = selectedStatus === "Alle" || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const statuses = ["Alle", "Mottatt", "Bekreftet", "Plukket", "Under transport", "Levert", "Kansellert"];

  const columns = [
    {
      key: "orderId",
      header: "Ordrenummer",
      cell: (order: any) => order.orderId,
    },
    {
      key: "date",
      header: "Dato",
      cell: (order: any) => order.date,
    },
    {
      key: "totalAmount",
      header: "Sum",
      cell: (order: any) => order.totalAmount,
    },
    {
      key: "status",
      header: "Status",
      cell: (order: any) => (
        <span className={cn(
          "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs",
          getStatusColor(order.status)
        )}>
            {getStatusIcons(order.status)}
            {order.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
        <div className="flex items-baseline justify-between">
            <div className="flex items-center">
                <h1 className="text-2xl font-semibold">Ordrehistorikk</h1>
                <p className="text-[#5A615D] ml-4"><span className="font-semibold">Alle selskapets ordre </span>(e-handel,service senter, forsyningsløsninger, per e-post etc)</p>
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
            totalItems={1000}
            itemsPerPage={10}
            onPageChange={setCurrentPage}
            />
        </div>
        </div>
    </div>
  );
}
