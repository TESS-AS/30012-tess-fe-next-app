import { useMemo, useState } from "react";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useGetAssets } from "@/hooks/useGetAssets";
import { useHoseInspectionCounts } from "@/hooks/useHoseInspectionCounts";
import { Separator } from "@radix-ui/react-select";
import { ChevronRight, Ellipsis, MapPin, Settings } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

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

interface Props {
	goToHose: (hoseId: string) => void;
}
const HoseOverview = ({ goToHose }: Props) => {
	const [selectedS1Code] = useState<string | undefined>(undefined);

	const { loading, s1Codes = [] } = useGetAssets("", selectedS1Code, {
		initAssets: false,
		initS1Codes: true,
		s2Filter: true,
	});

	const locations: LocationNode[] = useMemo(() => {
		return (s1Codes || [])
			.filter((s1) => s1.S1Code && s1.S1Name)
			.map((s1: any) => ({
				id: String(s1.S1Id ?? s1.S1Code),
				name: String(s1.S1Name ?? s1.S1Code ?? "S1"),
				status: "ok" as Status,
				children: Array.isArray(s1.S2)
					? s1.S2.map((s2: any) => ({
							id: String(s2.S2Id ?? s2.S2Code),
							name: String(s2.S2Name ?? s2.S2Code ?? "S2"),
							status: "ok" as Status,
							children: [],
						}))
					: [],
			}));
	}, [s1Codes]);

	const { counts } = useHoseInspectionCounts(selectedS1Code);

	return (
		<div className="space-y-6">
			<div className="flex items-baseline space-x-4">
				<div className="flex items-center">
					<h1 className="text-2xl font-semibold">Min oversikt</h1>
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
								{loading ? (
									<div className="space-y-2 p-2">
										{[...Array(5)].map((_, i) => (
											<div
												key={i}
												className="animate-pulse rounded-md border border-[#E6E7E6] bg-white p-3">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-3">
														<div className="h-6 w-6 rounded bg-[#EDEFEF]" />
														<div className="h-4 w-52 rounded bg-[#EDEFEF]" />
													</div>
													<div className="h-5 w-5 rounded bg-[#EDEFEF]" />
												</div>
												<div className="mt-3 flex gap-2 pl-9">
													<div className="h-3 w-28 rounded bg-[#F3F4F3]" />
													<div className="h-3 w-20 rounded bg-[#F3F4F3]" />
													<div className="h-3 w-16 rounded bg-[#F3F4F3]" />
												</div>
											</div>
										))}
									</div>
								) : (
									locations.map((loc) => (
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
																					src="/icons/alert-icons/red-exclamation-point.svg"
																					// src={`/icons/alert-icons/${child.status === "error" ? "red" : child.status === "warn" ? "yelllow" : "green"}-exclamation-point.svg`}
																					alt="Status Icon"
																				/>
																				<Settings className="h-4 w-4 text-[#5A615D]" />
																				<span className="text-sm text-[#0F1912]">
																					{child.name}
																				</span>
																			</div>
																			<ChevronRight
																				className="h-7 w-7 cursor-pointer text-[#C1C4C2]"
																				onClick={(e) => {
																					e.stopPropagation();
																					goToHose(child.id);
																				}}
																			/>
																		</div>
																	</AccordionTrigger>

																	<AccordionContent className="pb-2">
																		{(child.children ?? []).length > 0 && (
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
									))
								)}
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
										<span className="text-2xl font-bold">
											{counts.rejected}
										</span>
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
										<span className="text-2xl font-bold">
											{counts.approved}
										</span>
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
										<span className="text-2xl font-bold">{counts.overdue}</span>
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
										<span className="text-2xl font-bold">
											{counts.upcomingInspection}
										</span>
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
										<span className="text-2xl font-bold">
											{counts.replacementDue}
										</span>
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
										<span className="text-2xl font-bold">
											{counts.upcomingReplacement}
										</span>
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
