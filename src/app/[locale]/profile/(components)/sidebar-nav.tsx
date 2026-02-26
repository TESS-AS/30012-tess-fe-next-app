import { ComponentType, SVGProps, useState } from "react";

import { SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER } from "@/constants/checkout";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import { cn, isImageSource } from "@/lib/utils";
import { SidebarNavProps } from "@/types/sidebar.types";
import {
	LucideIcon,
	ArrowRight,
	ChevronRight,
	ChevronLeft,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import CartSvg from "../../../../../public/icons/profile/cart.svg";
import ClipboardSvg from "../../../../../public/icons/profile/clipboard-check.svg";
import TessEdiSvg from "../../../../../public/icons/profile/navbar/tess-edi.svg";

export function SidebarNav({
	items,
	activeMode,
	activeTab,
	onModeChange,
	onTabChange,
	onCollapse,
	profile,
}: SidebarNavProps) {
	const t = useTranslations("SidebarNav");
	const pathname = usePathname();
	const [expandedItems, setExpandedItems] = useState<string[]>([]);
	const [isCollapsed, setIsCollapsed] = useState(
		profile?.defaultCustomerNumber === "184200" ? true : false,
	);

	const toggleCollapse = () => {
		const newCollapsed = !isCollapsed;
		setIsCollapsed(newCollapsed);
		onCollapse?.(newCollapsed);
	};

	const toggleItem = (href: string) => {
		setExpandedItems((prev: string[]) =>
			prev.includes(href)
				? prev.filter((item: string) => item !== href)
				: [...prev, href],
		);
	};

	return (
		<nav
			className={cn(
				"flex h-[650px] flex-col rounded-lg bg-white transition-all duration-300",
				isCollapsed ? "w-20" : "min-w-[350px]",
			)}>
			<div className="flex h-full gap-1">
				<div className="flex flex-col gap-4 py-4 pr-2 pb-30 pl-2">
					<button
						onClick={() => onModeChange("hose")}
						className={cn(
							"flex w-16 cursor-pointer flex-col items-center gap-1 rounded-md p-1 text-[10px] font-medium transition-colors",
						)}>
						<div
							className={cn(
								"flex h-[40px] w-[40px] items-center justify-center rounded",
								activeMode === "hose" && "bg-[#DCF7E0]",
							)}>
							<Image
								src={ClipboardSvg}
								alt="Hose Management"
								width={24}
								height={24}
							/>
						</div>
						<span>{t("hoseManagement")}</span>
					</button>
					{profile?.defaultCustomerNumber !==
						SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER && (
						<>
							<button
								onClick={() => onModeChange("ehandel")}
								className={cn(
									"flex w-16 cursor-pointer flex-col items-center gap-1 rounded-md p-1 text-[10px] font-medium transition-colors",
								)}>
								<div
									className={cn(
										"flex h-[40px] w-[40px] items-center justify-center rounded",
										activeMode === "ehandel" && "bg-[#DCF7E0]",
									)}>
									<Image
										src={CartSvg}
										alt="E-handel"
										width={24}
										height={24}
									/>
								</div>
								<span>{t("eCommerce")}</span>
							</button>
							{profile?.role === "admin" && (
								<button
									onClick={() => onModeChange("tess-edi")}
									className={cn(
										"flex w-16 cursor-pointer flex-col items-center gap-1 rounded-md p-1 text-[10px] font-medium transition-colors",
									)}>
									<div
										className={cn(
											"flex h-[40px] w-[40px] items-center justify-center rounded",
											activeMode === "tess-edi" && "bg-[#DCF7E0]",
										)}>
										<Image
											src={TessEdiSvg}
											alt="TESS EDI"
											width={24}
											height={24}
										/>
									</div>
									<span>TESS EDI</span>
								</button>
							)}
						</>
					)}
				</div>
				<div
					className={`relative flex w-full flex-col items-end border-l pb-30 ${!isCollapsed ? "pr-4" : ""}`}>
					{!isCollapsed && (
						<div className="flex w-full flex-col">
							<p className="mt-4 ml-6 text-[14px] font-medium uppercase">
								{activeMode === "ehandel"
									? t("eCommerce")
									: activeMode === "tess-edi"
									? "TESS EDI"
									: t("hoseManagement")}
							</p>
							<div className="flex w-full flex-col py-2 pl-4">
								{items.map((item, index) => {
									const isActive =
										pathname === item.href ||
										item.subitems?.some((subitem) => pathname === subitem.href) ||
										(!item.subitems && item.href === activeTab);
									const isLastTwoItems = index >= items.length - 2;

									return (
										<div
											key={item.href}
											className={cn(
												"flex flex-col",
												item.href === "settings" && "mt-4 border-t border-gray-200 pt-4",
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
													"mb-2 flex w-full cursor-pointer items-center justify-between rounded-md p-2 text-base font-medium transition-colors",
													isActive && !item.subitems && "bg-[#DCF7E0] text-[#1C6D2C]",
													item.variant === "logout" &&
														"mt-4 text-red-600 hover:text-red-700",
												)}>
												<div
													className={cn(
														"flex items-center gap-3",
														isCollapsed && "justify-center",
													)}>
													{isImageSource(item.icon) ? (
														<Image
															src={item.icon}
															alt=""
															width={20}
															height={20}
														/>
													) : (
														(() => {
															const IconComp = item.icon as
																| LucideIcon
																| ComponentType<SVGProps<SVGSVGElement>>;
															return <IconComp className="h-5 w-5" />;
														})()
													)}
													{!isCollapsed && <span>{item.label}</span>}
												</div>
												{!item.subitems && isActive && (
													<ArrowRight className="h-4 w-4 shrink-0 text-[#1C6D2C]" />
												)}
												{item.subitems && (
													<ChevronRight
														className={cn(
															"h-5 w-5 shrink-0 text-gray-400 transition-transform",
															expandedItems.includes(item.href) && "rotate-90",
														)}
													/>
												)}
											</button>

											{item.subitems && expandedItems.includes(item.href) && (
												<div className="flex flex-col gap-1">
													{item.subitems.map((subitem) => (
														<Link
															key={subitem.href}
															href="#"
															onClick={(e) => {
																e.preventDefault();
																onTabChange?.(subitem.href);
															}}
															className={cn(
																"mb-1 flex cursor-pointer items-center rounded-md px-3 py-1.5 text-sm transition-colors",
																subitem.href === activeTab
																	? "bg-[#DCF7E0] text-[#1C6D2C]"
																	: "ml-7 text-[#5A615D]",
															)}>
															{subitem.href === activeTab && (
																<ArrowRight className="me-2 h-4 w-4 text-[#1C6D2C]" />
															)}
															{!isCollapsed && <span>{subitem.label}</span>}
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
						className="absolute right-2 bottom-4 flex w-16 cursor-pointer items-center justify-center rounded-md">
						<ChevronLeft
							className={cn(
								"h-5 w-5 transition-transform",
								isCollapsed && "rotate-180",
							)}
						/>
					</button>
				</div>
			</div>
		</nav>
	);
}
