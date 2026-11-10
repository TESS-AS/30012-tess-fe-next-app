import { ComponentType, SVGProps, useState } from "react";

import { SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER } from "@/constants/checkout";
import { USER_ROLES } from "@/constants/userRoles";
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

import ThmProjectsSvg from "../../../../../public/icons/arrow-right-arrow-left.svg";
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
				isCollapsed ? "w-[68px]" : "w-[260px]",
			)}>
			<div className="flex h-full gap-1">
				<div className="flex shrink-0 flex-col gap-3 py-3.5 pr-1.5 pb-30 pl-1.5">
					<button
						onClick={() => onModeChange("hose")}
						className={cn(
							"flex w-[58px] cursor-pointer flex-col items-center gap-1 rounded-md p-0.5 text-[9px] leading-tight font-medium transition-colors",
						)}>
						<div
							className={cn(
								"flex h-9 w-9 items-center justify-center rounded",
								activeMode === "hose" && "bg-[#DCF7E0]",
							)}>
							<Image
								src={ClipboardSvg}
								alt="Hose Management"
								width={20}
								height={20}
								loading="eager"
								className="h-5 w-5"
							/>
						</div>
						<span className="text-center">{t("hoseManagement")}</span>
					</button>
					{profile?.defaultCustomerNumber !==
						SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER && (
						<>
							<button
								onClick={() => onModeChange("ehandel")}
								className={cn(
									"flex w-[58px] cursor-pointer flex-col items-center gap-1 rounded-md p-0.5 text-[9px] leading-tight font-medium transition-colors",
								)}>
								<div
									className={cn(
										"flex h-9 w-9 items-center justify-center rounded",
										activeMode === "ehandel" && "bg-[#DCF7E0]",
									)}>
									<Image
										src={CartSvg}
										alt="E-handel"
										width={20}
										height={20}
										loading="eager"
										className="h-5 w-5"
									/>
								</div>
								<span className="text-center">{t("eCommerce")}</span>
							</button>
							{(profile?.role === USER_ROLES.ADMIN ||
								profile?.role === USER_ROLES.EMPLOYEE) && (
								<button
									onClick={() => onModeChange("tess-edi")}
									className={cn(
										"flex w-[58px] cursor-pointer flex-col items-center gap-1 rounded-md p-0.5 text-[9px] leading-tight font-medium transition-colors",
									)}>
									<div
										className={cn(
											"flex h-9 w-9 items-center justify-center rounded",
											activeMode === "tess-edi" && "bg-[#DCF7E0]",
										)}>
										<Image
											src={TessEdiSvg}
											alt="TESS EDI"
											width={20}
											height={20}
											loading="eager"
											className="h-5 w-5"
										/>
									</div>
									<span className="text-center">TESS EDI</span>
								</button>
							)}
							{(profile?.role === USER_ROLES.ADMIN || profile?.role === USER_ROLES.THM_ADMIN) && (
								<button
									onClick={() => onModeChange("thm")}
									className={cn(
										"flex w-[58px] cursor-pointer flex-col items-center gap-1 rounded-md p-0.5 text-[9px] leading-tight font-medium transition-colors",
									)}>
									<div
										className={cn(
											"flex h-9 w-9 items-center justify-center rounded",
											activeMode === "thm" && "bg-[#DCF7E0]",
										)}>
										<Image
											src={ThmProjectsSvg}
											alt="THM Projects (MSL)"
											width={20}
											height={20}
											loading="eager"
											className="h-5 w-5"
										/>
									</div>
									<span className="text-center">THM Projects (MSL)</span>
								</button>
							)}
						</>
					)}
				</div>
				<div
					className={`relative flex min-w-0 flex-1 flex-col items-end border-l pb-30 ${!isCollapsed ? "pr-2" : ""}`}>
					{!isCollapsed && (
						<div className="flex w-full flex-col">
							<p className="mt-3.5 ml-3 text-[12px] font-medium tracking-wide uppercase text-[#5A615D]">
								{activeMode === "ehandel"
									? t("eCommerce")
									: activeMode === "tess-edi"
										? "TESS EDI"
										: activeMode === "thm"
											? "THM Projects (MSL)"
											: t("hoseManagement")}
							</p>
							<div className="flex w-full flex-col py-2 pl-2">
								{items.map((item, index) => {
									const isActive =
										pathname === item.href ||
										item.subitems?.some(
											(subitem) => pathname === subitem.href,
										) ||
										(!item.subitems && item.href === activeTab);
									const isLastTwoItems = index >= items.length - 2;

									return (
										<div
											key={item.href}
											className={cn(
												"flex flex-col",
												item.href === "settings" &&
													"mt-3.5 border-t border-gray-200 pt-3.5",
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
													"mb-1.5 flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-[14px] font-medium transition-colors",
													isActive &&
														!item.subitems &&
														"bg-[#DCF7E0] text-[#1C6D2C]",
													item.variant === "logout" &&
														"mt-3.5 text-red-600 hover:text-red-700",
												)}>
												<div
													className={cn(
														"flex items-center gap-2.5",
														isCollapsed && "justify-center",
													)}>
													{isImageSource(item.icon) ? (
														<Image
															src={item.icon}
															alt=""
															width={18}
															height={18}
															loading="eager"
															className="h-[18px] w-[18px]"
														/>
													) : (
														(() => {
															const IconComp = item.icon as
																| LucideIcon
																| ComponentType<SVGProps<SVGSVGElement>>;
															return <IconComp className="h-[18px] w-[18px]" />;
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
															"h-4 w-4 shrink-0 text-gray-400 transition-transform",
															expandedItems.includes(item.href) && "rotate-90",
														)}
													/>
												)}
											</button>

											{item.subitems && expandedItems.includes(item.href) && (
												<div className="flex flex-col gap-0.5">
													{item.subitems.map((subitem) => (
														<Link
															key={subitem.href}
															href="#"
															onClick={(e) => {
																e.preventDefault();
																onTabChange?.(subitem.href);
															}}
															className={cn(
																"mb-0.5 flex cursor-pointer items-center rounded-md px-2.5 py-1 text-[13px] transition-colors",
																subitem.href === activeTab
																	? "bg-[#DCF7E0] text-[#1C6D2C]"
																	: "ml-6 text-[#5A615D]",
															)}>
															{subitem.href === activeTab && (
																<ArrowRight className="me-1.5 h-3.5 w-3.5 text-[#1C6D2C]" />
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
						className="absolute right-1 bottom-4 flex w-10 cursor-pointer items-center justify-center rounded-md">
						<ChevronLeft
							className={cn(
								"h-4 w-4 transition-transform",
								isCollapsed && "rotate-180",
							)}
						/>
					</button>
				</div>
			</div>
		</nav>
	);
}
