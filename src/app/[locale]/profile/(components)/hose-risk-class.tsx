import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

type RiskClass = {
	class: number;
	count: number;
	color: string;
	percentage: number;
};

const RiskClassCard = ({
	rk,
	count,
	color,
}: {
	rk: number;
	count: number;
	color: string;
}) => (
	<div className="group relative flex cursor-pointer items-center justify-between rounded-lg bg-white p-4 pl-12 shadow-sm ring-1 ring-[#E6E7E6] transition-all hover:translate-x-0.5 hover:shadow-md">
		<div className="flex items-center gap-3">
			<div className="text-sm">
				<div className="flex items-center gap-2 font-medium text-[#5A615D]">
					Risikoklasse
					<div
						className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold text-white transition-transform group-hover:scale-110"
						style={{ background: color }}
						aria-label={`RK ${rk}`}>
						{rk}
					</div>
				</div>
				<div className="text-2xl font-bold text-[#0F1912]">{count}</div>
			</div>
		</div>
		<ChevronRight className="h-8 w-8 text-[#C1C4C2] transition-transform group-hover:translate-x-1" />
	</div>
);

const HoseRiskClass = () => {
	const [hovered, setHovered] = useState<number | null>(null);

	const riskClasses: RiskClass[] = [
		{ class: 5, count: 0, color: "#3B2E68", percentage: 25 },
		{ class: 4, count: 25, color: "#5B3E90", percentage: 25 },
		{ class: 3, count: 25, color: "#7C61B0", percentage: 25 },
		{ class: 2, count: 25, color: "#9D84D0", percentage: 25 },
		{ class: 1, count: 0, color: "#C3B2EA", percentage: 0 },
		{ class: 0, count: 0, color: "#E8E1F8", percentage: 0 },
	];

	const quadrantData = useMemo(() => riskClasses.slice(0, 4), [riskClasses]);

	const gradient = useMemo(() => {
		const stops: string[] = [];
		let acc = 0;
		quadrantData.forEach((r) => {
			const next = acc + r.percentage;
			stops.push(`${r.color} ${acc}% ${next}%`);
			acc = next;
		});
		if (acc < 100) stops.push(`#F3F4F6 ${acc}% 100%`);
		return `conic-gradient(${stops.join(", ")})`;
	}, [quadrantData]);

	const idxOf = (rk: number) => quadrantData.findIndex((r) => r.class === rk);

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
				<div className="rounded-lg bg-white p-6 shadow-md ring-1 ring-[#E6E7E6]">
					<div className="flex items-start justify-between">
						<div className="flex flex-col">
							<div className="flex space-y-1">
								<h1 className="text-2xl font-semibold">Kritikalitet</h1>
								<h2 className="text-lg font-medium">
									Prosent av (S1) TESS Princess IMO: 789548
								</h2>
							</div>
							<p className="text-sm text-[#009640]">
								31 Nov – 31 Dec
								<Button
									size="icon"
									variant="ghost"
									className="p-0">
									<ChevronDown className="h-10 w-10 text-[#5A615D]" />
								</Button>
							</p>
						</div>
						<Button
							size="icon"
							variant="ghost"
							className="p-0">
							<MoreHorizontal className="h-10 w-10 text-[#5A615D]" />
						</Button>
					</div>

					<div className="relative mx-auto mt-8 aspect-square w-full max-w-[420px]">
						<div className="absolute inset-0 rounded-full bg-[#F8F9F8] ring-8 ring-[#F8F9F8]" />

						<div
							className="absolute inset-0 rounded-full"
							style={{ background: gradient }}
						/>

						<div className="pointer-events-none absolute inset-0">
							<div className="absolute top-0 left-1/2 h-full w-[2px] -translate-x-1/2 bg-white/95 shadow-[0_0_2px_rgba(0,0,0,0.08)]" />
							<div className="absolute top-1/2 left-0 h-[2px] w-full -translate-y-1/2 bg-white/95 shadow-[0_0_2px_rgba(0,0,0,0.08)]" />
						</div>

						<div className="absolute top-1/2 left-1/2 h-[60%] w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-inner" />

						{quadrantData.map((r, i) => (
							<button
								key={r.class}
								type="button"
								className={[
									"absolute top-1/2 left-1/2 h-1/2 w-1/2 origin-bottom-right -translate-x-full -translate-y-full rounded-tr-[999px]",
									"transition outline-none",
									hovered !== null && hovered !== r.class ? "opacity-50" : "",
								].join(" ")}
								style={{
									transform: `translate(-100%, -100%) rotate(${i * 90}deg)`,
								}}
								aria-label={`RK ${r.class} – ${r.count}`}
								onMouseEnter={() => setHovered(r.class)}
								onMouseLeave={() => setHovered(null)}
							/>
						))}

						{hovered !== null && (
							<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[140%] rounded-lg bg-black/90 px-4 py-2 text-sm text-white shadow-lg">
								{riskClasses.find((r) => r.class === hovered)?.count} slanger i{" "}
								risikoklasse {hovered}
							</div>
						)}
					</div>

					<div className="mt-8 flex flex-wrap items-center justify-center gap-4">
						{quadrantData.map((risk) => (
							<div
								key={risk.class}
								onMouseEnter={() => setHovered(risk.class)}
								onMouseLeave={() => setHovered(null)}
								className={`flex cursor-pointer items-center gap-2 transition-opacity ${hovered !== null && hovered !== risk.class ? "opacity-50" : ""}`}>
								<span
									className="inline-block h-3 w-3 rounded-full ring-1 ring-black/5"
									style={{ background: risk.color }}
								/>
								<span className="text-sm text-[#5A615D]">RK {risk.class}</span>
							</div>
						))}
					</div>

					<p className="mt-4 text-center text-sm text-[#5A615D]">
						RK = Risikoklasse
					</p>
				</div>

				<div className="space-y-3">
					{riskClasses.map((risk, index) => (
						<div key={risk.class}>
							{index > 0 && index % 2 === 0 && (
								<div className="mb-3 h-px w-full bg-[#E6E7E6]" />
							)}
							<RiskClassCard
								rk={risk.class}
								count={risk.count}
								color={risk.color}
							/>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default HoseRiskClass;
