"use client";

import * as React from "react";
import { ChangeEvent, useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, ChevronDown } from "lucide-react";

import { Button } from "./button";
import { Input } from "./input";
import { MapFilter } from "./map-filter";
import { Select } from "./select";

const filterVariants = cva(
	"flex flex-col gap-4 rounded-lg border bg-background p-6 shadow-sm",
	{
		variants: {
			variant: {
				default: "bg-background",
				secondary: "bg-muted/50",
			},
			size: {
				default: "p-6",
				sm: "p-4",
				lg: "p-8",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface FilterProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof filterVariants> {
	onFilterChange?: (filters: FilterValues) => void;
}

interface FilterValues {
	search: string;
	category: string;
	brand: string;
	minPrice: string;
	maxPrice: string;
	availability: string[];
	spec: string;
	certification: string;
	location: string;
	mapCoords?: [number, number];
}

const categories = [
	{ value: "category1", label: "Category 1" },
	{ value: "category2", label: "Category 2" },
	{ value: "category3", label: "Category 3" },
];

const brands = [
	{ value: "brand1", label: "Brand 1" },
	{ value: "brand2", label: "Brand 2" },
	{ value: "brand3", label: "Brand 3" },
];

const availabilityOptions = ["In Stock", "Pre-order", "Coming Soon"];
const specifications = [
	{ value: "spec1", label: "Specification 1" },
	{ value: "spec2", label: "Specification 2" },
	{ value: "spec3", label: "Specification 3" },
];

const certifications = [
	{ value: "cert1", label: "Certification 1" },
	{ value: "cert2", label: "Certification 2" },
	{ value: "cert3", label: "Certification 3" },
];

export function Filter({
	className,
	variant,
	size,
	onFilterChange,
	...props
}: FilterProps) {
	const [filters, setFilters] = useState<FilterValues>({
		search: "",
		category: "",
		brand: "",
		minPrice: "",
		maxPrice: "",
		availability: [],
		spec: "",
		certification: "",
		location: "",
		mapCoords: undefined,
	});

	useEffect(() => {
		onFilterChange?.(filters);
	}, [filters, onFilterChange]);

	const handleInputChange = (
		e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value } = e.target;
		setFilters((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleAvailabilityToggle = (value: string) => {
		setFilters((prev) => ({
			...prev,
			availability: prev.availability.includes(value)
				? prev.availability.filter((v) => v !== value)
				: [...prev.availability, value],
		}));
	};

	const handleLocationChange = (coords: [number, number]) => {
		setFilters((prev) => ({
			...prev,
			mapCoords: coords,
		}));
	};

	return (
		<div
			className={cn(filterVariants({ variant, size }), className)}
			{...props}>
			<div className="space-y-4">
				<Input
					type="search"
					name="search"
					placeholder="Search products..."
					value={filters.search}
					onChange={handleInputChange}
				/>

				<div className="grid grid-cols-1 gap-4">
					<Select
						name="category"
						value={filters.category}
						onChange={handleInputChange}
						options={categories}
						placeholder="Select Category"
					/>

					<Select
						name="brand"
						value={filters.brand}
						onChange={handleInputChange}
						options={brands}
						placeholder="Select Brand"
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<Input
						type="number"
						name="minPrice"
						placeholder="Min Price"
						value={filters.minPrice}
						onChange={handleInputChange}
					/>
					<Input
						type="number"
						name="maxPrice"
						placeholder="Max Price"
						value={filters.maxPrice}
						onChange={handleInputChange}
					/>
				</div>

				<div className="space-y-2">
					<label className="text-sm font-medium">Availability</label>
					<div className="flex flex-wrap gap-2">
						{availabilityOptions.map((option) => (
							<Button
								key={option}
								variant={
									filters.availability.includes(option) ? "default" : "outline"
								}
								size="sm"
								onClick={() => handleAvailabilityToggle(option)}>
								{filters.availability.includes(option) && (
									<Check className="mr-1 h-4 w-4" />
								)}
								{option}
							</Button>
						))}
					</div>
				</div>

				<div className="grid grid-cols-1 gap-4">
					<Select
						name="spec"
						value={filters.spec}
						onChange={handleInputChange}
						options={specifications}
						placeholder="Select Specification"
					/>

					<Select
						name="certification"
						value={filters.certification}
						onChange={handleInputChange}
						options={certifications}
						placeholder="Select Certification"
					/>
				</div>

				<div className="space-y-2">
					<label className="text-sm font-medium">Location</label>
					<MapFilter onLocationChange={handleLocationChange} />
				</div>
			</div>
		</div>
	);
}
