import { usePunchoutProfile } from "@/hooks/usePunchoutProfile";
import { useState } from "react";
import { useGetAssets } from "@/hooks/useGetAssets";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import {
	ChevronRight,
	Ellipsis,
	MapPin,
	Search,
	Settings,
	X,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@radix-ui/react-select";

type Status = "ok" | "warn" | "error";

type ChildNode = {
	id: string;
	name: string;
	status: Status;
	children?: {
		id: string;
		name: string;
		status: Status;
	}[];
};

type LocationNode = {
	id: string;
	name: string;
	status: Status;
	children?: ChildNode[];
};

const HoseOverview = () => {
	const [selectedS1Code, setSelectedS1Code] = useState<string | undefined>(
		undefined,
	);

	const {
		loading,
		s1Codes = [],
		s1CodesPagination,
		fetchS1Codes,
	} = useGetAssets("", selectedS1Code);

	const locations: LocationNode[] = [
		{
			id: "1",
			name: "Floatel Endurance",
			status: "error",
			children: [
				{
					id: "1-1",
					name: "Anchor Mooring Winch 01",
					status: "warn",
					children: [
						{ id: "1-1-1", name: "Sub Component 1", status: "error" },
						{ id: "1-1-2", name: "Sub Component 2", status: "warn" },
					],
				},
				{
					id: "1-2",
					name: "Anchor Mooring Winch 02",
					status: "error",
					children: [
						{ id: "1-2-1", name: "Sub Component 3", status: "error" },
						{ id: "1-2-2", name: "Sub Component 4", status: "ok" },
					],
				},
			],
		},
		{
			id: "2",
			name: "Floatel Endurance",
			status: "error",
			children: [
				{
					id: "1-1",
					name: "Anchor Mooring Winch 01",
					status: "warn",
					children: [
						{ id: "1-1-1", name: "Sub Component 1", status: "error" },
						{ id: "1-1-2", name: "Sub Component 2", status: "warn" },
					],
				},
				{
					id: "1-2",
					name: "Anchor Mooring Winch 02",
					status: "error",
					children: [
						{ id: "1-2-1", name: "Sub Component 3", status: "error" },
						{ id: "1-2-2", name: "Sub Component 4", status: "ok" },
					],
				},
			],
		},
		{
			id: "3",
			name: "Floatel Endurance",
			status: "error",
			children: [
				{
					id: "1-1",
					name: "Anchor Mooring Winch 01",
					status: "warn",
					children: [
						{ id: "1-1-1", name: "Sub Component 1", status: "error" },
						{ id: "1-1-2", name: "Sub Component 2", status: "warn" },
					],
				},
				{
					id: "1-2",
					name: "Anchor Mooring Winch 02",
					status: "error",
					children: [
						{ id: "1-2-1", name: "Sub Component 3", status: "error" },
						{ id: "1-2-2", name: "Sub Component 4", status: "ok" },
					],
				},
			],
		},
	];

	return (
		<div className="space-y-6">
			<div className="flex items-baseline space-x-4">
				<div className="flex items-center">
					<h1 className="text-2xl font-semibold">Min oversikt</h1>
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

			<div className="grid grid-cols-[2fr_1fr] gap-8">
				<div className="relative rounded-lg bg-white p-4 shadow">
					<div className="flex flex-col">
						<div className="flex items-start justify-between pt-2 pb-8">
							<div className="flex gap-4">
								<Image
									width={24}
									height={24}
									src="/icons/settings.svg"
									alt="Settings"
								/>
								<p className="text-2xl font-bold text-[#0F1912]">
									Utstyrsoversikt
								</p>
							</div>

							<Button
								size="icon"
								onClick={() => {}}
								variant="ghost"
								className="p-0">
								<Ellipsis className="h-10 w-10 text-[#5A615D]" />
							</Button>
						</div>

						<div className="">
							<p className="border-b border-[#E6E7E6] bg-[#F8F9F8] py-6 ps-12 text-sm font-medium text-[#5A615D]">
								STRUKTUR (S1+S2)
							</p>

							<Accordion type="multiple">
								{locations.map((loc) => (
									<AccordionItem
										key={loc.id}
										value={loc.id}
										className="border-b border-[#E6E7E6] hover:bg-[#F8F9F8]">
										<AccordionTrigger className="cursor-pointer !justify-start gap-2 px-2 py-4 hover:no-underline [&>svg]:order-first [&>svg]:mr-2 [&>svg]:h-6 [&>svg]:w-6 [&>svg]:shrink-0 [&>svg]:text-[#5A615D] [&>svg]:transition-transform [&[data-state=open]>svg]:rotate-180">
											<div className="flex w-full items-center justify-between">
												<div className="flex items-center gap-2">
													<Image
														width={24}
														height={24}
														src="/icons/alert-icons/red-exclamation-point.svg"
														alt="Red Exclamation Point"
													/>
													<MapPin className="ms-2h-4 w-4 text-[#5A615D]" />
													<span className="text-sm text-[#0F1912]">
														{loc.name}
													</span>
												</div>
												<ChevronRight className="h-7 w-7 text-[#C1C4C2]" />
											</div>
										</AccordionTrigger>

										<AccordionContent className="pb-2">
											{(loc.children ?? []).length === 0 ? (
												<div className="px-10 py-2 text-sm text-[#5A615D]">
													Ingen enheter
												</div>
											) : (
												<div className="space-y-1">
													{loc.children!.map((child) => (
														<Accordion
															key={child.id}
															type="multiple"
															className="mx-2 pl-10">
															<AccordionItem
																value={child.id}
																className="border-0 hover:bg-[#F8F9F8]">
																<AccordionTrigger className="cursor-pointer !justify-start gap-2 py-4 hover:no-underline [&>svg]:order-first [&>svg]:mr-2 [&>svg]:h-6 [&>svg]:w-6 [&>svg]:shrink-0 [&>svg]:text-[#5A615D] [&>svg]:transition-transform [&[data-state=open]>svg]:rotate-180">
																	<div className="flex w-full items-center justify-between">
																		<div className="flex items-center gap-2">
																			<Image
																				width={24}
																				height={24}
																				src={`/icons/alert-icons/${child.status === "error" ? "red" : child.status === "warn" ? "yelllow" : "green"}-exclamation-point.svg`}
																				alt="Status Icon"
																			/>
																			<Settings className="h-4 w-4 text-[#5A615D]" />
																			<span className="text-sm text-[#0F1912]">
																				{child.name}
																			</span>
																		</div>
																		<ChevronRight className="h-7 w-7 text-[#C1C4C2]" />
																	</div>
																</AccordionTrigger>

																<AccordionContent className="pb-2">
																	{(child.children ?? []).length === 0 ? (
																		<div className="px-10 py-2 text-sm text-[#5A615D]">
																			Ingen enheter
																		</div>
																	) : (
																		<div className="space-y-1">
																			{child.children!.map((subChild) => (
																				<div
																					key={subChild.id}
																					className="mx-2 flex items-center justify-between rounded-md px-2 py-4 hover:bg-[#F8F9F8]">
																					<div className="flex items-center gap-2 pl-12">
																						<Image
																							width={24}
																							height={24}
																							src={`/icons/alert-icons/${subChild.status === "error" ? "red" : subChild.status === "warn" ? "yelllow" : "green"}-exclamation-point.svg`}
																							alt="Status Icon"
																						/>
																						<Settings className="h-4 w-4 text-[#5A615D]" />
																						<span className="text-sm text-[#0F1912]">
																							{subChild.name}
																						</span>
																					</div>
																					<ChevronRight className="h-7 w-7 text-[#C1C4C2]" />
																				</div>
																			))}
																		</div>
																	)}
																</AccordionContent>
															</AccordionItem>
														</Accordion>
													))}
												</div>
											)}
										</AccordionContent>
									</AccordionItem>
								))}
							</Accordion>
						</div>
					</div>
					<div className="absolute bottom-0 left-0 mt-6 flex w-full items-center divide-x divide-[#E6E7E6] border-t border-[#E6E7E6] p-6 text-sm text-[#5A615D]">
						<div className="flex items-center gap-2 pr-6">
							<MapPin className="h-4 w-4" />
							S2
						</div>
						<div className="flex items-center gap-2 px-6">
							<Settings className="h-4 w-4" />
							Utstyr/Equipment
						</div>
						<div className="flex items-center gap-2 pl-6">
							<Settings className="h-4 w-4" />
							Utstyr/Equipment subkategori
						</div>
					</div>
				</div>

				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-4">
						<div className="mb-5 flex items-center gap-4">
							<Image
								width={24}
								height={24}
								src="/icons/search.svg"
								alt="Search"
							/>
							<p className="text-2xl font-bold text-[#0F1912]">Inspeksjon</p>
							<Separator className="my-3 h-[1px] w-full bg-[#C1C4C2]" />
						</div>
						<div className="grid gap-4">
							<div className="flex items-center justify-between rounded-lg bg-white p-4 shadow hover:bg-[#F8F9F8]">
								<div className="flex items-center">
									<div className="me-2 flex items-center gap-4">
										<Image
											width={24}
											height={24}
											src="/icons/alert-icons/red-exclamation-point.svg"
											alt="Red Exclamation Point"
										/>
										<span className="text-2xl font-bold">28</span>
									</div>
									<p className="text-sm font-medium text-[#5A615D]">
										Underkjente inspeksjoner
									</p>
								</div>
								<ChevronRight className="h-7 w-7 text-[#C1C4C2]" />
							</div>
							<div className="flex items-center justify-between rounded-lg bg-white p-4 shadow hover:bg-[#F8F9F8]">
								<div className="flex items-center">
									<div className="me-2 flex items-center gap-4">
										<Image
											width={24}
											height={24}
											src="/icons/alert-icons/yelllow-exclamation-point.svg"
											alt="Yellow Exclamation Point"
										/>
										<span className="text-2xl font-bold">28</span>
									</div>
									<p className="text-sm font-medium text-[#5A615D]">
										Bestått med anmerkninger
									</p>
								</div>
								<ChevronRight className="h-7 w-7 text-[#C1C4C2]" />
							</div>
							<div className="flex items-center justify-between rounded-lg bg-white p-4 shadow hover:bg-[#F8F9F8]">
								<div className="flex items-center">
									<div className="me-2 flex items-center gap-4">
										<Image
											width={24}
											height={24}
											src="/icons/alert-icons/time-yellow.svg"
											alt="Time Yellow"
										/>
										<span className="text-2xl font-bold">28</span>
									</div>
									<p className="text-sm font-medium text-[#5A615D]">
										Forfalte inspeksjoner
									</p>
								</div>
								<ChevronRight className="h-7 w-7 text-[#C1C4C2]" />
							</div>
							<div className="flex items-center justify-between rounded-lg bg-white p-4 shadow hover:bg-[#F8F9F8]">
								<div className="flex items-center">
									<div className="me-2 flex items-center gap-4">
										<Image
											width={24}
											height={24}
											src="/icons/alert-icons/time-aquamarine.svg"
											alt="Time Aquamarine"
										/>
										<span className="text-2xl font-bold">28</span>
									</div>
									<p className="text-sm font-medium text-[#5A615D]">
										Planlagte inspeksjoner
									</p>
								</div>
								<ChevronRight className="h-7 w-7 text-[#C1C4C2]" />
							</div>
						</div>
					</div>

					<div className="flex flex-col gap-4">
						<div className="my-5 flex items-center gap-4">
							<Image
								width={24}
								height={24}
								src="/icons/reload.svg"
								alt="Reload"
							/>
							<p className="text-2xl font-bold text-[#0F1912]">Slangebytte</p>
							<Separator className="my-3 h-[1px] w-full bg-[#C1C4C2]" />
						</div>
						<div className="grid gap-4">
							<div className="flex items-center justify-between rounded-lg bg-white p-4 shadow hover:bg-[#F8F9F8]">
								<div className="flex items-center">
									<div className="me-2 flex items-center gap-4">
										<Image
											width={24}
											height={24}
											src="/icons/alert-icons/time-yellow.svg"
											alt="Time Yellow"
										/>
										<span className="text-2xl font-bold">28</span>
									</div>
									<p className="text-sm font-medium text-[#5A615D]">
										Forfalte inspeksjoner
									</p>
								</div>
								<ChevronRight className="h-7 w-7 text-[#C1C4C2]" />
							</div>
							<div className="flex items-center justify-between rounded-lg bg-white p-4 shadow hover:bg-[#F8F9F8]">
								<div className="flex items-center">
									<div className="me-2 flex items-center gap-4">
										<Image
											width={24}
											height={24}
											src="/icons/alert-icons/time-aquamarine.svg"
											alt="Time Aquamarine"
										/>
										<span className="text-2xl font-bold">28</span>
									</div>
									<p className="text-sm font-medium text-[#5A615D]">
										Planlagte inspeksjoner
									</p>
								</div>
								<ChevronRight className="h-7 w-7 text-[#C1C4C2]" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default HoseOverview;
