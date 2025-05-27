// mocks/mockCategories.ts

import {
	Package,
	Image,
	MonitorSmartphone,
	Type,
	LayoutTemplate,
	Figma,
	Shapes,
	Gift,
} from "lucide-react";

export const mockCategories = [
	{
		name: "Hoses & pipes",
		slug: "hoses-and-pipes",
		subcategories: [
			{ name: "Hydraulic Hoses", slug: "hydraulic-hoses" },
			{ name: "PVC Pipes", slug: "pvc-pipes" },
			{ name: "Flexible Ducting", slug: "flexible-ducting" },
		],
	},
	{
		name: "Tools & machines",
		slug: "tools-and-machines",
		subcategories: [
			{ name: "Power Tools", slug: "power-tools" },
			{ name: "Hand Tools", slug: "hand-tools" },
			{ name: "Workshop Machinery", slug: "workshop-machinery" },
		],
	},
	{
		name: "PPE, clothing & shoes",
		slug: "ppe-clothing-and-shoes",
		subcategories: [
			{ name: "Safety Helmets", slug: "safety-helmets" },
			{ name: "Work Gloves", slug: "work-gloves" },
			{ name: "Safety Boots", slug: "safety-boots" },
		],
	},
	{
		name: "Welding",
		slug: "welding",
		subcategories: [
			{ name: "Welding Machines", slug: "welding-machines" },
			{ name: "Welding Electrodes", slug: "welding-electrodes" },
			{ name: "Welding Helmets", slug: "welding-helmets" },
		],
	},
	{
		name: "Fasteners",
		slug: "fasteners",
		subcategories: [
			{ name: "Bolts & Nuts", slug: "bolts-and-nuts" },
			{ name: "Screws", slug: "screws" },
			{ name: "Anchors", slug: "anchors" },
		],
	},
	{
		name: "Chemicals",
		slug: "chemicals",
		subcategories: [
			{ name: "Lubricants", slug: "lubricants" },
			{ name: "Adhesives", slug: "adhesives" },
			{ name: "Cleaning Agents", slug: "cleaning-agents" },
		],
	},
	{
		name: "Lighting & electrical equipment",
		slug: "lighting-and-electrical-equipment",
		subcategories: [
			{ name: "LED Lights", slug: "led-lights" },
			{ name: "Switches & Sockets", slug: "switches-and-sockets" },
			{ name: "Cables & Wires", slug: "cables-and-wires" },
		],
	},
	{
		name: "Transmissions",
		slug: "transmissions",
		subcategories: [
			{ name: "Gearboxes", slug: "gearboxes" },
			{ name: "Belts & Chains", slug: "belts-and-chains" },
			{ name: "Couplings", slug: "couplings" },
		],
	},
];

export const mockMainCategories = [
	{
		id: "3d",
		name: "3D Assets",
		description: "Immersive elements",
		icon: Package,
	},
	{
		id: "illustrations",
		name: "Illustrations",
		description: "Dimensional elements",
		icon: Image,
	},
	{
		id: "mockups",
		name: "Mockups",
		description: "Realistic display devices",
		icon: MonitorSmartphone,
	},
	{
		id: "fonts",
		name: "Fonts",
		description: "Expressive typography",
		icon: Type,
	},
	{
		id: "framer",
		name: "Framer Templates",
		description: "Easy-to-edit websites",
		icon: LayoutTemplate,
	},
	{
		id: "figma",
		name: "Figma Templates",
		description: "User interfaces",
		icon: Figma,
	},
	{
		id: "icons",
		name: "Icons",
		description: "Simplified symbols",
		icon: Shapes,
	},
	{
		id: "freebies",
		name: "Freebies",
		description: "Grab them all",
		icon: Gift,
	},
];
