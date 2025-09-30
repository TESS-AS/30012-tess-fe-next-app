"use client";

import { useState } from "react";

//
import { NotificationCard } from "@/components/ui/notification-card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	ChevronDown,
	ChevronRight,
	CircleAlert,
	MapPin,
	Settings,
	X,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

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

type Group = {
	name: string;
	rows: ReplacementData[];
	estimatedCost?: string;
};

const groups: Group[] = [
	{
		name: "Floatel Endurance",
		rows: [
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
				structure: "Anchor Mooring Winch 02",
				"2025": 12,
				"2026": 4,
				"2027": 0,
				"2028": 0,
				total: 16,
			},
			{
				orderId: "total_fe",
				structure: "Floatel Endurance Total",
				"2025": 1195,
				"2026": 1002,
				"2027": 104,
				"2028": 44,
				total: 2345,
			},
		],
		estimatedCost: "14.500,-",
	},
	{ name: "Floatel Reliance", rows: [] },
	{ name: "Floatel Superior", rows: [] },
	{ name: "Floatel Triumph", rows: [] },
	{ name: "Floatel Victory", rows: [] },
];

const mockLocations = [
	"Floatel Endurance",
	"Floatel Reliance",
	"Floatel Superior",
	"Floatel Triumph",
	"Floatel Victory",
];

const HoseReplacement = () => {
	const t = useTranslations();
	const [notificationCard, setNotificationCard] = useState(true);
	const [selectedLocation, setSelectedLocation] = useState<string>("");
	const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
		{
			"Floatel Endurance": true,
		},
	);

	const toggleGroup = (name: string) =>
		setExpandedGroups((prev) => ({ ...prev, [name]: !prev[name] }));

	const renderYearCell = (value: number) => (
		<button
			type="button"
			className="inline-flex cursor-pointer items-center text-[#009640] hover:opacity-80">
			{value}
			<ChevronRight className="h-4 w-4" />
		</button>
	);

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
					{notificationCard && (
						<NotificationCard
							className="bg-[#FDFDEA]"
							icon={<CircleAlert className="h-4 w-4" />}
							title={t("Cart.outOfStock")}
							message={t("Cart.outOfStockMessage")}
							onClose={() => setNotificationCard(false)}
						/>
					)}

					<div className="mt-4">
						<div className="grid [grid-template-columns:3fr_1fr_1fr_1fr_1fr_1fr] items-center rounded-t-lg border-b border-[#E7E9E8] bg-[#F8F9F8] p-4 text-xs font-medium text-[#5A615D]">
							<div className="ps-6">STRUKTUR (S1+S2)</div>
							<div className="flex items-center gap-1">
								2025
								<Image
									src="/icons/toggle-caret.svg"
									alt="Chevron down"
									width={8}
									height={8}
								/>
							</div>
							<div className="flex items-center gap-1">
								2026
								<Image
									src="/icons/toggle-caret.svg"
									alt="Chevron down"
									width={8}
									height={8}
								/>
							</div>
							<div className="flex items-center gap-1">
								2027
								<Image
									src="/icons/toggle-caret.svg"
									alt="Chevron down"
									width={8}
									height={8}
								/>
							</div>
							<div className="flex items-center gap-1">
								2028
								<Image
									src="/icons/toggle-caret.svg"
									alt="Chevron down"
									width={8}
									height={8}
								/>
							</div>
							<div>TOTAL</div>
						</div>

						<div className="divide-y divide-[#E7E9E8]">
							{groups
								.filter((g) => !selectedLocation || g.name === selectedLocation)
								.map((group) => {
									const isOpen = !!expandedGroups[group.name];
									return (
										<div key={group.name}>
											<button
												onClick={() => toggleGroup(group.name)}
												className="grid w-full [grid-template-columns:3fr_1fr_1fr_1fr_1fr_1fr] items-center gap-2 px-4 py-3 text-left text-sm hover:bg-[#F8F9F8]">
												<div className="flex cursor-pointer items-center gap-2 text-[#0F1912]">
													<ChevronDown
														className={`${isOpen ? "rotate-180" : ""} h-4 w-4 transition-transform`}
													/>
													<MapPin className="h-4 w-4 text-[#5A615D]" />
													{group.name}
												</div>
												<div />
												<div />
												<div />
												<div />
												<div />
											</button>

											{isOpen && (
												<div>
													{group.rows.slice(0, -1).map((row) => (
														<div
															key={row.orderId}
															className="grid [grid-template-columns:3fr_1fr_1fr_1fr_1fr_1fr] items-center border-t border-[#E7E9E8] py-3 pr-4">
															<div className="flex items-center gap-2 ps-18 text-[#0F1912]">
																<Settings className="h-5 w-5 text-[#5A615D]" />
																<span className="text-sm">{row.structure}</span>
															</div>
															<div className="text-[#0F1912]">
																{renderYearCell(row["2025"])}
															</div>
															<div className="text-[#0F1912]">
																{renderYearCell(row["2026"])}
															</div>
															<div className="text-[#0F1912]">
																{renderYearCell(row["2027"])}
															</div>
															<div className="text-[#0F1912]">
																{renderYearCell(row["2028"])}
															</div>
															<div className="text-[#0F1912]">{row.total}</div>
														</div>
													))}

													{group.rows.length > 0 && (
														<div className="grid [grid-template-columns:3fr_1fr_1fr_1fr_1fr_1fr] items-center border-t border-[#E7E9E8] py-3 pr-4 text-sm text-[#0F1912]">
															{(() => {
																const total = group.rows[group.rows.length - 1];
																return (
																	<>
																		<div className="ps-18">
																			{total.structure}
																		</div>
																		<div>{total["2025"]}</div>
																		<div>{total["2026"]}</div>
																		<div>{total["2027"]}</div>
																		<div>{total["2028"]}</div>
																		<div>{total.total}</div>
																	</>
																);
															})()}
														</div>
													)}

													{group.estimatedCost && (
														<div className="grid [grid-template-columns:3fr_1fr_1fr_1fr_1fr_1fr] items-center border-t border-[#003D1A] bg-[#F0FCF2] py-3 pr-4 text-sm text-[#0F1912]">
															<div className="ps-18">Estimerte kostnader</div>
															<div>{group.estimatedCost}</div>
															<div>{group.estimatedCost}</div>
															<div>{group.estimatedCost}</div>
															<div>{group.estimatedCost}</div>
															<div>{group.estimatedCost}</div>
														</div>
													)}
												</div>
											)}
										</div>
									);
								})}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default HoseReplacement;
