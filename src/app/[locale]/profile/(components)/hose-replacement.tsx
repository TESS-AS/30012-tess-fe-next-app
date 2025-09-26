"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ChevronDown, MapPin, X } from "lucide-react";

type ReplacementData = {
	orderId: string;
	structure: string;
	"2025": number;
	"2026": number;
	"2027": number;
	"2028": number;
	total: number;
	cost?: string;
};

const mockData: ReplacementData[] = [
	{
		orderId: "1",
		structure: "Anchor Mooring Winch 01",
		"2025": 12,
		"2026": 4,
		"2027": 0,
		"2028": 0,
		total: 16,
	},
	{
		orderId: "2",
		structure: "Anchor Mooring Winch 02",
		"2025": 12,
		"2026": 4,
		"2027": 0,
		"2028": 0,
		total: 16,
	},
	{
		orderId: "3",
		structure: "Floatel Endurance Total",
		"2025": 1195,
		"2026": 1002,
		"2027": 104,
		"2028": 44,
		total: 2345,
		cost: "14.500,-",
	},
];

const mockLocations = [
	"Floatel Endurance",
	"Floatel Reliance",
	"Floatel Superior",
	"Floatel Triumph",
	"Floatel Victory",
];

const HoseReplacement = () => {
	const [selectedLocation, setSelectedLocation] = useState<string>("");

	return (
		<div className="space-y-6">
			<div className="flex items-baseline space-x-4">
				<div className="flex items-center">
					<h1 className="text-2xl font-semibold">Fremtidige slangebytter</h1>
				</div>

				<div className="flex w-[280px] items-center gap-3">
					<p className="text-base font-normal text-[#5A615D]">Lokasjon:</p>
					<div className="relative">
						<Select
							value={selectedLocation}
							onValueChange={setSelectedLocation}>
							<SelectTrigger className="relative w-[200px] border-[#C1C4C2] bg-white pr-8 font-medium text-[#0F1912]">
								<div className="flex items-center gap-2 overflow-hidden">
									<MapPin className="h-4 w-4 shrink-0 text-[#0F1912]" />
									<SelectValue placeholder="Alle lokasjoner" />
								</div>
							</SelectTrigger>
							<SelectContent className="max-h-[300px] overflow-y-auto">
								{mockLocations.map((location) => (
									<SelectItem
										key={location}
										value={location}>
										{location}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{selectedLocation && (
							<button
								type="button"
								onClick={() => setSelectedLocation("")}
								className="absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-sm p-1 opacity-50 ring-offset-white transition-all hover:bg-[#F8F9F8] hover:opacity-100 focus:ring-2 focus:ring-[#1C6D2C] focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
								<X className="h-4 w-4 text-[#5A615D]" />
								<span className="sr-only">Fjern lokasjon</span>
							</button>
						)}
					</div>
				</div>
			</div>

			<div className="rounded-lg border border-[#C1C4C2] bg-white">
				<div className="p-6">
					<div className="mb-4 rounded-lg bg-[#FFF9E6] p-4">
						<p className="flex items-center gap-2 text-sm text-[#5A615D]">
							Estimerte priser – ikke endelig kostnad
						</p>
						<p className="mt-1 text-sm text-[#5A615D]">
							Priser som vises er veiledende for budsjetteringsformål og er ikke
							justert for eventuelle fremtidige prisendringer. Prisene inkluderer
							ikke frakt og eventuelle tjenester som montering mv.
						</p>
					</div>

					<DataTable<ReplacementData>
						columns={[
							{
								key: "structure",
								header: "STRUKTUR (S1+S2)",
								cell: (row: ReplacementData) => (
									<span className={row.cost ? "font-medium" : ""}>
										{row.structure}
									</span>
								),
							},
							{
								key: "2025",
								header: () => (
									<div className="flex items-center gap-1">
										2025
										<ChevronDown className="h-4 w-4" />
									</div>
								),
								cell: (row: ReplacementData) => (
									<span className={row.cost ? "font-medium" : ""}>
										{row["2025"]}
									</span>
								),
							},
							{
								key: "2026",
								header: () => (
									<div className="flex items-center gap-1">
										2026
										<ChevronDown className="h-4 w-4" />
									</div>
								),
								cell: (row: ReplacementData) => (
									<span className={row.cost ? "font-medium" : ""}>
										{row["2026"]}
									</span>
								),
							},
							{
								key: "2027",
								header: () => (
									<div className="flex items-center gap-1">
										2027
										<ChevronDown className="h-4 w-4" />
									</div>
								),
								cell: (row: ReplacementData) => (
									<span className={row.cost ? "font-medium" : ""}>
										{row["2027"]}
									</span>
								),
							},
							{
								key: "2028",
								header: () => (
									<div className="flex items-center gap-1">
										2028
										<ChevronDown className="h-4 w-4" />
									</div>
								),
								cell: (row: ReplacementData) => (
									<span className={row.cost ? "font-medium" : ""}>
										{row["2028"]}
									</span>
								),
							},
							{
								key: "total",
								header: "TOTAL",
								cell: (row: ReplacementData) => (
									<span className={row.cost ? "font-medium" : ""}>
										{row.total}
									</span>
								),
							},
						]}
						data={mockData}
						className="w-full"
						currentPage={1}
						totalPages={1}
						totalItems={mockData.length}
						itemsPerPage={10}
					/>
				</div>
			</div>
		</div>
	);
};

export default HoseReplacement;
