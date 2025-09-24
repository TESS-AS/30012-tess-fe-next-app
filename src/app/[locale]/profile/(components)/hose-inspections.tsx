import { useState } from "react";
import { useGetAssets } from "@/hooks/useGetAssets";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Calendar, MapPin, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type InspectionType = "completed" | "planned";

type Period = "last-12" | "last-6" | "last-3";

const HoseInspections = () => {
	const [selectedS1Code, setSelectedS1Code] = useState<string | undefined>(
		undefined,
	);
	const [selectedType, setSelectedType] = useState<InspectionType>("completed");
	const [selectedPeriod, setSelectedPeriod] = useState<Period>("last-12");

	const {
		loading,
		s1Codes = [],
		s1CodesPagination,
		fetchS1Codes,
	} = useGetAssets("", selectedS1Code);

	return (
		<div className="space-y-6">
			<div className="flex items-baseline space-x-4">
				<div className="flex items-center">
					<h1 className="text-2xl font-semibold">Inspeksjoner</h1>
				</div>

				<div className="flex w-[280px] items-center gap-3">
					<p className="text-base font-normal text-[#5A615D]">Lokasjon:</p>
					<div className="relative">
						<Select
							value={selectedS1Code || ""}
							onValueChange={(value) => {
								if (!value) setSelectedS1Code("");
								setSelectedS1Code(value);
							}}>
							<SelectTrigger className="relative w-[200px] border-[#C1C4C2] bg-white pr-8 font-medium text-[#0F1912]">
								<div className="flex items-center gap-2 overflow-hidden">
									<MapPin className="h-4 w-4 shrink-0 text-[#0F1912]" />
									<SelectValue
										className="truncate"
										placeholder="Velg S1 anlegg"
									/>
								</div>
							</SelectTrigger>
							<SelectContent
								className="max-h-[300px] overflow-y-auto"
								onScroll={(e) => {
									const target = e.target as HTMLDivElement;
									if (
										target.scrollTop + target.clientHeight >=
											target.scrollHeight - 20 &&
										!loading &&
										s1CodesPagination.currentPage < s1CodesPagination.totalPages
									) {
										fetchS1Codes(
											s1CodesPagination.currentPage + 1,
											s1CodesPagination.pageSize,
										);
									}
								}}>
								{(s1Codes || []).map((s1) => (
									<SelectItem
										key={s1.S1Code}
										value={s1.S1Code}>
										{s1.S1Name}
									</SelectItem>
								))}
								{loading && s1CodesPagination.currentPage > 1 && (
									<div className="py-2 text-center text-sm text-gray-500">
										Laster flere...
									</div>
								)}
							</SelectContent>
						</Select>
						{selectedS1Code && (
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									e.preventDefault();
									setSelectedS1Code("");
								}}
								className="absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-sm p-1 opacity-50 ring-offset-white transition-all hover:bg-[#F8F9F8] hover:opacity-100 focus:ring-2 focus:ring-[#1C6D2C] focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
								<X className="h-4 w-4 text-[#5A615D]" />
								<span className="sr-only">Fjern lokasjon</span>
							</button>
						)}
					</div>
				</div>
			</div>

			<div className="rounded-lg bg-white p-6 shadow-md">
				<div className="mb-8 flex items-center gap-8">
					<div className="flex items-center gap-4">
						<div className="text-sm text-[#5A615D]">Type:</div>
						<div className="flex gap-2 rounded-lg bg-[#E8EAE9] px-4 py-2">
							<button
								onClick={() => setSelectedType("completed")}
								className={`cursor-pointer rounded-lg px-3 py-1 text-sm text-[#5A615D] transition-colors ${selectedType === "completed" && "bg-[#003D1A] text-white"}`}>
								Utførte inspeksjoner
							</button>
							<button
								onClick={() => setSelectedType("planned")}
								className={`cursor-pointer rounded-lg px-3 py-1 text-sm text-[#5A615D] transition-colors ${selectedType === "planned" && "bg-[#05505C] text-white"}`}>
								Planlagte inspeksjoner
							</button>
						</div>
					</div>

					<div className="flex items-center gap-4">
						<div className="text-sm text-[#5A615D]">Periode:</div>
						<Select
							value={selectedPeriod}
							onValueChange={(value) => setSelectedPeriod(value as Period)}>
							<SelectTrigger className="w-[200px] border-[#C1C4C2] bg-white">
								<Calendar className="h-4 w-4 shrink-0 text-[#0F1912]" />
								<SelectValue placeholder="Velg periode" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="last-12">Siste 12 måneder</SelectItem>
								<SelectItem value="last-6">Siste 6 måneder</SelectItem>
								<SelectItem value="last-3">Siste 3 måneder</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="relative h-[400px] w-full">
					<div className="absolute bottom-0 left-0 flex h-[300px] w-full items-end justify-between gap-2">
						{/* Q4/24 */}
						<div className="flex h-[308px] w-[calc(25%-8px)] flex-col items-center gap-2">
							<div className="flex h-[260px] w-full justify-between">
								<div className="flex flex-col">
									<div className="mb-1 text-center text-xs text-[#0F1912]">
										2400
									</div>
									<div
										className={`flex h-[240px] w-[65px] flex-col justify-end ${selectedType === "completed" && "bg-[#003D1A]"} ${selectedType === "planned" && "bg-[#05505C]"}`}></div>
								</div>
								<div className="flex flex-col">
									<div className="mb-1 text-center text-xs text-[#0F1912]">
										1400
									</div>
									<div
										className={`flex h-[140px] w-[65px] flex-col justify-end ${selectedType === "completed" && "bg-[#003D1A]"} ${selectedType === "planned" && "bg-[#05505C]"}`}></div>
								</div>
								<div className="flex flex-col">
									<div className="mb-1 text-center text-xs text-[#0F1912]">
										2400
									</div>
									<div
										className={`flex h-[240px] w-[65px] flex-col justify-end ${selectedType === "completed" && "bg-[#003D1A]"} ${selectedType === "planned" && "bg-[#05505C]"}`}></div>
								</div>
							</div>
							<div className="flex w-full items-center gap-2 text-xs text-[#5A615D]">
								<Separator className="shrink-1" />
								Q4/24
								<Separator className="shrink-1" />
							</div>
							<div className="flex gap-4 text-xs text-[#5A615D]">
								<span>Okt</span>
								<span>Nov</span>
								<span>Des</span>
							</div>
						</div>
						<div
							aria-hidden="true"
							className="w-px self-stretch bg-[#C1C4C2]/60"
							role="presentation"
						/>

						{/* Q1/25 */}
						<div className="flex h-[308px] w-[calc(25%-8px)] flex-col items-center gap-2">
							<div className="flex h-[260px] w-full justify-between">
								<div className="flex flex-col">
									<div className="mb-1 text-center text-xs text-[#0F1912]">
										2400
									</div>
									<div
										className={`flex h-[240px] w-[65px] flex-col justify-end ${selectedType === "completed" && "bg-[#003D1A]"} ${selectedType === "planned" && "bg-[#05505C]"}`}></div>
								</div>
								<div className="flex flex-col">
									<div className="mb-1 text-center text-xs text-[#0F1912]">
										2400
									</div>
									<div
										className={`flex h-[240px] w-[65px] flex-col justify-end ${selectedType === "completed" && "bg-[#003D1A]"} ${selectedType === "planned" && "bg-[#05505C]"}`}></div>
								</div>
								<div className="flex flex-col">
									<div className="mb-1 text-center text-xs text-[#0F1912]">
										2360
									</div>
									<div
										className={`flex h-[236px] w-[65px] flex-col justify-end ${selectedType === "completed" && "bg-[#003D1A]"} ${selectedType === "planned" && "bg-[#05505C]"}`}></div>
								</div>
							</div>
							<div className="flex w-full items-center gap-2 text-xs text-[#5A615D]">
								<Separator className="shrink-1" />
								Q1/25
								<Separator className="shrink-1" />
							</div>
							<div className="flex gap-4 text-xs text-[#5A615D]">
								<span>Jan</span>
								<span>Feb</span>
								<span>Mar</span>
							</div>
						</div>

						{/* Q2/25 */}
						<div className="flex h-[308px] w-[calc(25%-8px)] flex-col items-center gap-2">
							<div className="flex h-[260px] w-full justify-between">
								<div className="flex flex-col">
									<div className="mb-1 text-center text-xs text-[#0F1912]">
										1600
									</div>
									<div
										className={`flex h-[160px] w-[65px] flex-col justify-end ${selectedType === "completed" && "bg-[#003D1A]"} ${selectedType === "planned" && "bg-[#05505C]"}`}></div>
								</div>
								<div className="flex flex-col">
									<div className="mb-1 text-center text-xs text-[#0F1912]">
										2400
									</div>
									<div
										className={`flex h-[240px] w-[65px] flex-col justify-end ${selectedType === "completed" && "bg-[#003D1A]"} ${selectedType === "planned" && "bg-[#05505C]"}`}></div>
								</div>
								<div className="flex flex-col">
									<div className="mb-1 text-center text-xs text-[#0F1912]">
										2400
									</div>
									<div
										className={`flex h-[240px] w-[65px] flex-col justify-end ${selectedType === "completed" && "bg-[#003D1A]"} ${selectedType === "planned" && "bg-[#05505C]"}`}></div>
								</div>
							</div>
							<div className="flex w-full items-center gap-2 text-xs text-[#5A615D]">
								<Separator className="shrink-1" />
								Q2/25
								<Separator className="shrink-1" />
							</div>
							<div className="flex gap-4 text-xs text-[#5A615D]">
								<span>Apr</span>
								<span>Mai</span>
								<span>Jun</span>
							</div>
						</div>

						{/* Q3/25 */}
						<div className="flex h-[308px] w-[calc(25%-8px)] flex-col items-center gap-2">
							<div className="flex h-[260px] w-full justify-between">
								<div className="flex flex-col">
									<div className="mb-1 text-center text-xs text-[#0F1912]">
										2139
									</div>
									<div
										className={`flex h-[213.9px] w-[65px] flex-col justify-end ${selectedType === "completed" && "bg-[#003D1A]"} ${selectedType === "planned" && "bg-[#05505C]"}`}></div>
								</div>
								<div className="flex flex-col">
									<div className="mb-1 text-center text-xs text-[#0F1912]">
										34
									</div>
									<div
										className={`flex h-[3.4px] w-[65px] flex-col justify-end ${selectedType === "completed" && "bg-[#003D1A]"} ${selectedType === "planned" && "bg-[#05505C]"}`}></div>
								</div>
								<div className="flex flex-col">
									<div className="mb-1 text-center text-xs text-[#0F1912]">
										0
									</div>
									<div
										className={`flex h-[0px] w-[65px] flex-col justify-end ${selectedType === "completed" && "bg-[#003D1A]"} ${selectedType === "planned" && "bg-[#05505C]"}`}></div>
								</div>
							</div>
							<div className="flex w-full items-center gap-2 text-xs text-[#5A615D]">
								<Separator className="shrink-1" />
								Q3/25
								<Separator className="shrink-1" />
							</div>
							<div className="flex gap-4 text-xs text-[#5A615D]">
								<span>Jul</span>
								<span className="text-[#1C6D2C]">Aug</span>
								<span>Sep</span>
							</div>
						</div>
					</div>
				</div>

				<div className="mt-26 flex items-center justify-center gap-8">
					<div className="flex items-center gap-2">
						<div
							className={`h-3 w-3 rounded-full ${selectedType === "completed" && "bg-[#003D1A]"} ${selectedType === "planned" && "bg-[#05505C]"}`}></div>
						<span className="text-sm text-[#5A615D]">
							{selectedType === "completed" ? "Utført" : "Planlagt"}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default HoseInspections;
