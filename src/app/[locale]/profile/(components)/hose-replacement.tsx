"use client";

import { useMemo, useState } from "react";

import { NotificationCard } from "@/components/ui/notification-card";
import { useGetAssets } from "@/hooks/useGetAssets";
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

const HoseReplacement = () => {
	const t = useTranslations("HoseReplacement");
	const [notificationCard, setNotificationCard] = useState(true);
	const [selectedLocation, setSelectedLocation] = useState<string>("");
	const [selectedS1Code] = useState<string | undefined>(undefined);

	const { loading, s1Codes = [] } = useGetAssets(
		"",
		selectedS1Code,
		undefined,
		{
			initAssets: false,
			initS1Codes: true,
		},
	);
	const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
		{
			"Floatel Endurance": true,
		},
	);

	const toggleGroup = (name: string) =>
		setExpandedGroups((prev) => ({ ...prev, [name]: !prev[name] }));

	const s1Groups: Group[] = useMemo(() => {
		return (s1Codes || [])
			.filter((s1) => s1.S1Code && s1.S1Name)
			.map((s1: any) => {
				const s1Name = String(s1.S1Name ?? s1.S1Code ?? "S1");
				const rows: ReplacementData[] = Array.isArray(s1.S2)
					? s1.S2.map((s2: any, idx: number) => ({
							orderId: String(s2.S2Id ?? s2.S2Code ?? idx),
							structure: String(s2.S2Name ?? s2.S2Code ?? "S2"),
							"2025": 0,
							"2026": 0,
							"2027": 0,
							"2028": 0,
							total: 0,
						}))
					: [];

				if (rows.length > 0) {
					const totalRow: ReplacementData = {
						orderId: `total_${s1Name}`,
						structure: `${s1Name} Total`,
						"2025": rows.reduce((a, r) => a + r["2025"], 0),
						"2026": rows.reduce((a, r) => a + r["2026"], 0),
						"2027": rows.reduce((a, r) => a + r["2027"], 0),
						"2028": rows.reduce((a, r) => a + r["2028"], 0),
						total: rows.reduce((a, r) => a + r.total, 0),
					};
					rows.push(totalRow);
				}

				return { name: s1Name, rows } as Group;
			});
	}, [s1Codes]);

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
					<h1 className="text-2xl font-semibold">{t("title")}</h1>
				</div>
			</div>

			<div className="rounded-lg border border-[#C1C4C2] bg-white">
				<div className="p-6">
					{notificationCard && (
						<NotificationCard
							className="bg-[#FDFDEA]"
							icon={<CircleAlert className="h-4 w-4" />}
							title={t("notificationTitle")}
							message={t("notificationMessage")}
							onClose={() => setNotificationCard(false)}
						/>
					)}

					<div className="mt-4">
						<div className="grid [grid-template-columns:3fr_1fr_1fr_1fr_1fr_1fr] items-center rounded-t-lg border-b border-[#E7E9E8] bg-[#F8F9F8] p-4 text-xs font-medium text-[#5A615D]">
							<div className="ps-6">{t("structure")}</div>
							<div className="flex items-center gap-1">
								2025
								<Image
									src="/icons/toggle-caret.svg"
									alt="Chevron down"
									width={8}
									height={8}
									loading="eager"
								/>
							</div>
							<div className="flex items-center gap-1">
								2026
								<Image
									src="/icons/toggle-caret.svg"
									alt="Chevron down"
									width={8}
									height={8}
									loading="eager"
								/>
							</div>
							<div className="flex items-center gap-1">
								2027
								<Image
									src="/icons/toggle-caret.svg"
									alt="Chevron down"
									width={8}
									height={8}
									loading="eager"
								/>
							</div>
							<div className="flex items-center gap-1">
								2028
								<Image
									src="/icons/toggle-caret.svg"
									alt="Chevron down"
									width={8}
									height={8}
									loading="eager"
								/>
							</div>
							<div>{t("total")}</div>
						</div>

						<div className="divide-y divide-[#E7E9E8]">
							{loading ? (
								<div className="space-y-1 p-2">
									{[...Array(5)].map((_, i) => (
										<div
											key={i}
											className="grid animate-pulse [grid-template-columns:3fr_1fr_1fr_1fr_1fr_1fr] items-center gap-2 px-4 py-3">
											<div className="flex items-center gap-2">
												<div className="h-4 w-4 rounded bg-[#EDEFEF]" />
												<div className="h-4 w-48 rounded bg-[#EDEFEF]" />
											</div>
											<div className="h-4 w-10 rounded bg-[#EDEFEF]" />
											<div className="h-4 w-10 rounded bg-[#EDEFEF]" />
											<div className="h-4 w-10 rounded bg-[#EDEFEF]" />
											<div className="h-4 w-10 rounded bg-[#EDEFEF]" />
											<div className="h-4 w-12 rounded bg-[#EDEFEF]" />
										</div>
									))}
								</div>
							) : (
								(s1Groups.length > 0 ? s1Groups : [])
									.filter(
										(g) => !selectedLocation || g.name === selectedLocation,
									)
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
																	<span className="text-sm">
																		{row.structure}
																	</span>
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
																<div className="text-[#0F1912]">
																	{row.total}
																</div>
															</div>
														))}

														{group.rows.length > 0 && (
															<div className="grid [grid-template-columns:3fr_1fr_1fr_1fr_1fr_1fr] items-center border-t border-[#E7E9E8] py-3 pr-4 text-sm text-[#0F1912]">
																{(() => {
																	const total =
																		group.rows[group.rows.length - 1];
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
																<div className="ps-18">
																	{t("estimatedCosts")}
																</div>
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
									})
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default HoseReplacement;
