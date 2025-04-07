"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { LatLngExpression } from "leaflet";
import dynamic from "next/dynamic";

const MapFilterClient = dynamic(
	() => import("./map-filter-client").then((mod) => mod.MapFilterClient),
	{
		ssr: false,
	},
);

const mapFilterVariants = cva("overflow-hidden rounded-lg border shadow-sm", {
	variants: {
		variant: {
			default: "border-border",
			secondary: "border-muted",
		},
		size: {
			default: "h-64",
			sm: "h-48",
			lg: "h-96",
		},
	},
	defaultVariants: {
		variant: "default",
		size: "default",
	},
});

export interface MapFilterProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof mapFilterVariants> {
	onLocationChange?: (coords: [number, number]) => void;
	center?: LatLngExpression;
	zoom?: number;
}

export function MapFilter({
	className,
	variant,
	size,
	onLocationChange,
	center = [60.472, 8.4689] as LatLngExpression,
	zoom = 5,
	...props
}: MapFilterProps) {
	return (
		<div
			className={cn(mapFilterVariants({ variant, size }), className)}
			{...props}>
			<MapFilterClient
				center={center}
				zoom={zoom}
				onLocationChange={onLocationChange}
			/>
		</div>
	);
}
