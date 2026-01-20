import { ComponentType } from "react";
import { SVGProps } from "react";

import { LucideIcon } from "lucide-react";
import { StaticImageData } from "next/image";

import { ProfileUser } from "./user.types";

export interface SubItem {
	href: string;
	label: string;
}

export interface SidebarNavItem {
	href: string;
	label: string;
	icon:
		| LucideIcon
		| ComponentType<SVGProps<SVGSVGElement>>
		| string
		| StaticImageData;
	variant?: "default" | "logout";
	subitems?: SubItem[];
}

export interface SidebarNavProps {
	items: SidebarNavItem[];
	activeMode: "hose" | "ehandel" | "tess-edi";
	activeTab: string;
	onModeChange: (mode: "hose" | "ehandel" | "tess-edi") => void;
	onTabChange: (tab: string) => void;
	onCollapse: (isCollapsed: boolean) => void;
	profile: ProfileUser;
}
