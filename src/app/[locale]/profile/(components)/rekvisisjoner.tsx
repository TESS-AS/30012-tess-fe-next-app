import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DataTable } from "@/components/ui/data-table";
import { Search, X, ChevronDown as ChevronDownIcon } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { cn } from "@/lib/utils";
import { Modal, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Status = "Alle" | "Venter godkjenning" | "Godkjent" | "Avvist";

const statuses: Status[] = ["Alle", "Venter godkjenning", "Godkjent", "Avvist"];

const getStatusCount = (status: Status, rekvisisjoner: Rekvisisjon[]) => {
  if (status === "Alle") return rekvisisjoner.length;
  return rekvisisjoner.filter(r => r.status === status).length;
};

interface OrderItem {
  name: string;
  sku: string;
  quantity: number;
  price: string;
}

interface Rekvisisjon {
  orderId: string;
  bestiller: string;
  opprettet: string;
  pris: string;
  status: Status;
  items: OrderItem[];
}

const mockRekvisisjoner: Rekvisisjon[] = [
  {
    orderId: "#FWB127364372",
    bestiller: "Lars Hansen",
    opprettet: "09 Mar 2025",
    pris: "466.00,-",
    status: "Venter godkjenning",
    items: [
      {
        name: "TESSGULL-GULLSLANGE BLÅ",
        sku: "P_65033",
        quantity: 5,
        price: "133.00,-"
      },
      {
        name: "TESSGULL-GULLSLANGE BLÅ",
        sku: "P_65033",
        quantity: 5,
        price: "133.00,-"
      },
      {
        name: "TESSGULL-GULLSLANGE BLÅ",
        sku: "P_65033",
        quantity: 5,
        price: "133.00,-"
      },
      {
        name: "TESSGULL-GULLSLANGE BLÅ",
        sku: "P_65033",
        quantity: 5,
        price: "133.00,-"
      },
      {
        name: "TESSGULL-GULLSLANGE BLÅ",
        sku: "P_65033",
        quantity: 5,
        price: "133.00,-"
      },
      {
        name: "TESSGULL-GULLSLANGE BLÅ",
        sku: "P_65033",
        quantity: 5,
        price: "133.00,-"
      },
      {
        name: "TESSGULL-GULLSLANGE BLÅ",
        sku: "P_65033",
        quantity: 5,
        price: "133.00,-"
      },
      {
        name: "TESSGULL-GULLSLANGE BLÅ",
        sku: "P_65033",
        quantity: 5,
        price: "133.00,-"
      },
      {
        name: "TESSGULL-GULLSLANGE BLÅ",
        sku: "P_65033",
        quantity: 5,
        price: "133.00,-"
      },
      {
        name: "TESSGULL-GULLSLANGE BLÅ",
        sku: "P_65033",
        quantity: 5,
        price: "133.00,-"
      },
    ]
  },
  {
    orderId: "#FWB125467980",
    bestiller: "Kari Nordahl",
    opprettet: "12 Mar 2025",
    pris: "245.00,-",
    status: "Venter godkjenning",
    items: [
      {
        name: "TESSGULL-GULLSLANGE BLÅ",
        sku: "P_65033",
        quantity: 5,
        price: "133.00,-"
      }
    ]
  },
  {
    orderId: "#FWB139485607",
    bestiller: "Erik Johansen",
    opprettet: "19 Mar 2025",
    pris: "2000.00,-",
    status: "Godkjent",
    items: [
      {
        name: "TESSGULL-GULLSLANGE HVIT",
        sku: "P_65034",
        quantity: 3,
        price: "133.00,-"
      }
    ]
  },
  {
    orderId: "#FWB137364371",
    bestiller: "Lars Hansen",
    opprettet: "23 Apr 2025",
    pris: "90.00,-",
    status: "Godkjent",
    items: [
      {
        name: "TESSGULL-GULLSLANGE HVIT",
        sku: "P_65034",
        quantity: 3,
        price: "133.00,-"
      }
    ]
  },
  {
    orderId: "#FWB148273645",
    bestiller: "Lars Hansen",
    opprettet: "20 Apr 2025",
    pris: "3040.00,-",
    status: "Avvist",
    items: [
      {
        name: "TESSGULL-GULLSLANGE BLÅ",
        sku: "P_65033",
        quantity: 5,
        price: "133.00,-"
      },
      {
        name: "TESSGULL-GULLSLANGE HVIT",
        sku: "P_65034",
        quantity: 5,
        price: "133.00,-"
      }
    ]
  }
];

export function Rekvisisjoner() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("Alle");
  const [currentPage, setCurrentPage] = useState(1);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Rekvisisjon | null>(null);
  const [showAllItems, setShowAllItems] = useState(false);

  const getStatusStyle = (status: Status) => {
    switch (status) {
      case "Venter godkjenning":
        return "bg-[#FEF9C3] text-[#854D0E]";
      case "Godkjent":
        return "bg-[#DCF7E0] text-[#1C6D2C]";
      case "Avvist":
        return "bg-[#FEE2E2] text-[#9B1C1C]";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const filteredRekvisisjoner = mockRekvisisjoner.filter(rekvisisjon => {
    const matchesSearch = 
      rekvisisjon.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rekvisisjon.bestiller.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "Alle" || rekvisisjon.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: "orderId",
      header: "ORDRE ID",
      cell: (rekvisisjon: Rekvisisjon) => rekvisisjon.orderId,
    },
    {
      key: "bestiller",
      header: "BESTILLER",
      cell: (rekvisisjon: Rekvisisjon) => rekvisisjon.bestiller,
    },
    {
      key: "opprettet",
      header: "OPPRETTET",
      cell: (rekvisisjon: Rekvisisjon) => rekvisisjon.opprettet,
    },
    {
      key: "pris",
      header: "PRIS",
      cell: (rekvisisjon: Rekvisisjon) => rekvisisjon.pris,
    },
    {
      key: "status",
      header: "STATUS",
      cell: (rekvisisjon: Rekvisisjon) => (
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded ${getStatusStyle(rekvisisjon.status)}`}>
          {rekvisisjon.status === "Godkjent" && (
            <Image
              src="/icons/check-filled.svg"
              alt="Check"
              width={16}
              height={16}
            />
          )}
          {rekvisisjon.status === "Avvist" && <X className="h-4 w-4" />}
          <span>{rekvisisjon.status}</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (rekvisisjon: Rekvisisjon) => (
        <div className="flex gap-2 justify-end">
          {rekvisisjon.status === "Venter godkjenning" && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="border-[#1C6D2C] text-[#1C6D2C] hover:bg-[#DCF7E0] hover:text-[#1C6D2C]"
                onClick={() => {
                  setSelectedOrder(rekvisisjon);
                  setShowAllItems(false);
                  setApprovalModalOpen(true);
                }}
              >
                Godkjenn
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-[#9B1C1C] text-[#9B1C1C] hover:bg-[#FEE2E2] hover:text-[#9B1C1C]"
              >
                Avvis
              </Button>
            </>
          )}
          {rekvisisjon.status === "Avvist" && (
            <Button
              variant="outline"
              size="sm"
              className="border-[#6B7280] text-[#6B7280] hover:bg-gray-100"
            >
              Gjenopprett
            </Button>
          )}
        </div>
      ),
    }
  ];

  return (
    <div className="space-y-6">
        <div className="flex items-baseline justify-between">
            <div className="flex items-center">
                <h1 className="text-2xl font-semibold">Rekvisisjoner</h1>
                <p className="text-[#5A615D] ml-4">Administrer og godkjenn innkomne rekvisisjoner fra ansatte og eksterne systemer.</p>
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
                    {statuses.map((status) => {
                      const count = getStatusCount(status, mockRekvisisjoner);
                      const badgeStyle = getStatusStyle(status);
                      return (
                        <div key={status} className="flex items-center">
                          <div className="flex items-center space-x-2">
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
                          {status !== "Alle" && count > 0 && (
                            <span className={cn("ml-2 px-1.5 rounded text-sm", badgeStyle)}>
                              {count}
                            </span>
                          )}
                        </div>

                    )})}
                    </RadioGroup>
                </div>
            </div>

            <DataTable
                data={filteredRekvisisjoner}
                columns={columns}
                currentPage={currentPage}
                itemsPerPage={10}
                totalItems={filteredRekvisisjoner.length}
                onPageChange={setCurrentPage}
                isExpandable
                expandableContent={(rekvisisjon) => (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-[#0F1912]">Enheter</h3>
                    <div className="space-y-2">
                      {rekvisisjon.items.map((item, index) => (
                        <div key={index} className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-[#5A615D]">Produktnummer</p>
                            <p className="font-medium text-[#0F1912]">{item.name}</p>
                          </div>
                          <div>
                            <p className="text-[#5A615D]">Varenummer</p>
                            <p className="font-medium text-[#0F1912]">{item.sku}</p>
                          </div>
                          <div>
                            <p className="text-[#5A615D]">Antall</p>
                            <p className="font-medium text-[#0F1912]">{item.quantity}</p>
                          </div>
                          <div>
                            <p className="text-[#5A615D]">Pris</p>
                            <p className="font-medium text-[#0F1912]">{item.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            />
        </div>

        <Modal open={approvalModalOpen} onOpenChange={setApprovalModalOpen}>
          <div>
            <ModalHeader>
              <ModalTitle className="flex items-center gap-2">
                <Image
                  src="/icons/check-filled.svg"
                  alt="Check"
                  width={20}
                  height={20}
                />
                <span>{selectedOrder?.items?.length || 0} varer lagt til i handlekurv</span>
              </ModalTitle>
            </ModalHeader>
            <div className="space-y-2 py-4">
              {selectedOrder?.items?.slice(0, showAllItems ? undefined : 5).map((item, index) => (
                <div key={index} className="text-sm text-gray-600">
                  1 × {item.sku}
                </div>
              ))}
              {selectedOrder?.items && selectedOrder.items.length > 5 && (
                <button
                  onClick={() => setShowAllItems(!showAllItems)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  {showAllItems ? (
                    <>
                      Vis færre <ChevronDownIcon className="h-4 w-4 rotate-180 transform" />
                    </>
                  ) : (
                    <>
                      Vis alle <ChevronDownIcon className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="flex">
              <Button
                variant="default"
                className="bg-[#1C6D2C] hover:bg-[#164B1F] text-white w-full"
                onClick={() => {
                  setApprovalModalOpen(false);
                  router.push("/cart");
                }}
              >
                Til handlekurven
              </Button>
            </div>
          </div>
        </Modal>
    </div>
  );
}
