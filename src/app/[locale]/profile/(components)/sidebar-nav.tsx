import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LucideIcon, ArrowRight, ChevronRight, ChevronLeft } from "lucide-react";
import Image from "next/image";
import CartSvg from "../../../../../public/icons/profile/cart.svg";
import ClipboardSvg from "../../../../../public/icons/profile/clipboard-check.svg";

interface SubItem {
  href: string;
  label: string;
}

interface SidebarNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  variant?: "default" | "logout";
  subitems?: SubItem[];
}

interface SidebarNavProps {
  items: SidebarNavItem[];
  activeMode: "hose" | "ehandel";
  onModeChange: (mode: "hose" | "ehandel") => void;
  onTabChange?: (tab: string) => void;
  onCollapse?: (isCollapsed: boolean) => void;
}

export function SidebarNav({ items, activeMode, onModeChange, onTabChange, onCollapse }: SidebarNavProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapse?.(newCollapsed);
  };

  const toggleItem = (href: string) => {
    setExpandedItems((prev: string[]) =>
      prev.includes(href)
        ? prev.filter((item: string) => item !== href)
        : [...prev, href]
    );
  };

  return (
    <nav className={cn(
      "flex h-[600px] bg-white rounded-lg transition-all duration-300 flex-col",
      isCollapsed ? "w-20" : "min-w-[350px]"
    )}>
      <div className="flex gap-1 h-full">
        <div className="flex flex-col gap-4 pr-2 py-4 pl-2 pb-30">
          <button
            onClick={() => onModeChange("hose")}
            className={cn(
              "flex flex-col items-center gap-1 rounded-md p-1 text-[10px] font-medium transition-colors w-16 cursor-pointer"
            )}
          >
            <div className={cn(
              "w-[40px] h-[40px] rounded flex items-center justify-center",
              activeMode === "hose" && "bg-[#DCF7E0]"
            )}>
              <Image
                src={ClipboardSvg}
                alt="Hose Management"
                width={24}
                height={24}
              />
            </div>
            <span>Hose Management</span>
          </button>
          <button
            onClick={() => onModeChange("ehandel")}
            className={cn(
              "flex flex-col items-center gap-1 rounded-md p-1 text-[10px] font-medium transition-colors w-16 cursor-pointer"
            )}
          >
            <div className={cn(
              "w-[40px] h-[40px] rounded flex items-center justify-center",
              activeMode === "ehandel" && "bg-[#DCF7E0]"
            )}>
              <Image
                src={CartSvg}
                alt="E-handel"
                width={24}
                height={24}
              />
            </div>
            <span>E-handel</span>
          </button>
        </div>
        <div className={`flex flex-col items-end border-l w-full relative pb-30 ${!isCollapsed ? "pr-4" : ""}`}>
          {!isCollapsed && (
            <div className="flex flex-col w-full">
              <p className="text-[14px] font-medium ml-6 mt-4 uppercase">{activeMode === "ehandel" ? "E-handel" : "Hose Management"}</p>
              <div className="flex flex-col pl-4 py-2 w-full">
                {items.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || item.subitems?.some(subitem => pathname === subitem.href);
                  const isLastTwoItems = index >= items.length - 2;
                  
                  return (
                    <div key={item.href} className={cn(
                      "flex flex-col",
                      isLastTwoItems && index === items.length - 2 && "mt-4 border-t pt-4"
                    )}>
                      <button
                        onClick={() => {
                          if (item.subitems) {
                            toggleItem(item.href);
                          } else if (onTabChange) {
                            onTabChange(item.href);
                          }
                        }}
                        className={cn(
                          "flex w-full items-center justify-between rounded-md p-2 text-base font-medium transition-colors mb-2",
                          isActive
                            ? "bg-green-50 text-green-600"
                            : expandedItems.includes(item.href)
                            ? "bg-[#DCF7E0]"
                            : "hover:bg-gray-50",
                          item.variant === "logout" && "mt-4 text-red-600 hover:text-red-700"
                        )}
                      >
                        <div className={cn(
                          "flex items-center gap-3",
                          isCollapsed && "justify-center"
                        )}>
                          <Icon className="h-5 w-5" />
                          {!isCollapsed && <span>{item.label}</span>}
                        </div>
                        {item.subitems && (
                          <ChevronRight className={cn(
                            "h-5 w-5 shrink-0 text-gray-400 transition-transform",
                            expandedItems.includes(item.href) && "rotate-90"
                          )} />
                        )}
                      </button>
                      
                      {item.subitems && expandedItems.includes(item.href) && (
                        <div className="ml-7 flex flex-col gap-1">
                          {item.subitems.map((subitem) => (
                            <Link
                              key={subitem.href}
                              href="#"
                              onClick={() => onTabChange?.(subitem.href)}
                              className={cn(
                                "flex items-center justify-between rounded-md px-3 py-1.5 text-sm transition-colors mb-1",
                                pathname === subitem.href
                                  ? "bg-[#DCF7E0] text-green-600"
                                  : "text-gray-600 hover:bg-[#DCF7E0] hover:text-green-600"
                              )}
                            >
                              {!isCollapsed && <span>{subitem.label}</span>}
                              {pathname === subitem.href && (
                                <ArrowRight className="h-3.5 w-3.5 text-green-600" />
                              )}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div> 
          )}
          <button
              onClick={toggleCollapse}
            className="flex w-16 items-center justify-center rounded-md absolute bottom-4 right-2 cursor-pointer"
          >
            <ChevronLeft className={cn(
              "h-5 w-5 transition-transform",
              isCollapsed && "rotate-180"
            )} />
          </button>
        </div>
      </div>
    </nav>
  );
}
