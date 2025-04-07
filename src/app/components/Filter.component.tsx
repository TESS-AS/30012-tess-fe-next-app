"use client";
import { ChangeEvent, FormEvent, useState } from "react";

import { cva } from "class-variance-authority";

import { MapFilter } from "./MapFilter.component";

const filterGroup = cva(
	"flex flex-col gap-2 p-4 rounded-2xl shadow-md border",
	{
		variants: {
			intent: {
				primary: "bg-white",
				secondary: "bg-gray-100",
			},
		},
		defaultVariants: {
			intent: "primary",
		},
	},
);

interface Filters {
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

export default function ProductFilter() {
	const [filters, setFilters] = useState<Filters>({
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

	const handleChange = (
		e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value, type } = e.target as
			| HTMLInputElement
			| HTMLSelectElement;
		const { checked } = e.target as HTMLInputElement;
		if (type === "checkbox") {
			setFilters((prev) => ({
				...prev,
				[name]: checked
					? [...(prev[name as keyof Filters] as string[]), value]
					: (prev[name as keyof Filters] as string[]).filter(
							(v) => v !== value,
						),
			}));
		} else {
			setFilters((prev) => ({ ...prev, [name]: value }));
		}
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		console.log("Applied filters:", filters);
	};

	return (
		<form
			className="max-w-md space-y-4"
			onSubmit={handleSubmit}>
			{/* Search */}
			<input
				type="text"
				name="search"
				placeholder="Search products..."
				value={filters.search}
				onChange={handleChange}
				className="w-full rounded border p-2"
			/>

			<div className={filterGroup()}>
				{/* Category */}
				<label htmlFor="category">Category</label>
				<select
					name="category"
					id="category"
					value={filters.category}
					onChange={handleChange}
					className="rounded border p-2">
					<option value="">All Categories</option>
					<option value="hoses">Hoses and Pipes</option>
					<option value="tools">Tools and Machines</option>
					<option value="ppe">PPE, Clothing, and Shoes</option>
					<option value="welding">Welding</option>
					<option value="fasteners">Fasteners</option>
					<option value="chemicals">Chemicals</option>
					<option value="lighting">Lighting and Electrical</option>
					<option value="transmissions">Transmissions</option>
					<option value="lifting">Lifting and Loading</option>
					<option value="storage">Storage Equipment</option>
					<option value="filters">Filters</option>
					<option value="maintenance">Maintenance Products</option>
				</select>
			</div>

			<div className={filterGroup()}>
				{/* Price */}
				<label>Price Range</label>
				<div className="flex gap-2">
					<input
						type="number"
						name="minPrice"
						placeholder="Min"
						value={filters.minPrice}
						onChange={handleChange}
						className="w-full rounded border p-2"
					/>
					<input
						type="number"
						name="maxPrice"
						placeholder="Max"
						value={filters.maxPrice}
						onChange={handleChange}
						className="w-full rounded border p-2"
					/>
				</div>
			</div>

			<div className={filterGroup()}>
				{/* Availability */}
				<label>Availability</label>
				<div className="flex flex-col gap-1">
					{["In Stock", "Out of Stock", "Discontinued"].map((label) => (
						<label
							key={label}
							className="inline-flex items-center gap-2">
							<input
								type="checkbox"
								name="availability"
								value={label}
								checked={filters.availability.includes(label)}
								onChange={handleChange}
							/>
							{label}
						</label>
					))}
				</div>
			</div>

			<div className={filterGroup()}>
				{/* Technical Specification */}
				<label htmlFor="spec">Specification</label>
				<input
					type="text"
					name="spec"
					id="spec"
					value={filters.spec}
					onChange={handleChange}
					className="w-full rounded border p-2"
				/>
			</div>

			<div className={filterGroup()}>
				{/* Certification */}
				<label htmlFor="certification">Certification</label>
				<input
					type="text"
					name="certification"
					id="certification"
					value={filters.certification}
					onChange={handleChange}
					className="w-full rounded border p-2"
				/>
			</div>

			<div className={filterGroup()}>
				{/* Location */}
				<label htmlFor="location">Location</label>
				<select
					name="location"
					id="location"
					value={filters.location}
					onChange={handleChange}
					className="rounded border p-2">
					<option value="">All Locations</option>
					<option value="oslo">Oslo</option>
					<option value="bergen">Bergen</option>
					<option value="trondheim">Trondheim</option>
					<option value="stavanger">Stavanger</option>
				</select>
			</div>

			<div className={filterGroup()}>
				<label>Pick Location on Map</label>
				<MapFilter
					onLocationChange={(coords) =>
						setFilters((prev) => ({ ...prev, mapCoords: coords }))
					}
				/>
				{filters.mapCoords && (
					<p className="mt-2 text-sm text-gray-600">
						Selected Coords: {filters.mapCoords.join(", ")}
					</p>
				)}
			</div>
			<button
				type="submit"
				className="w-full rounded-xl bg-blue-600 p-2 text-white">
				Apply Filters
			</button>
		</form>
	);
}
