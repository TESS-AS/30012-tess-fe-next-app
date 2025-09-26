import { useMemo, useState } from "react";

type Quad = { class: number; count: number; color: string; percentage: number };

const toRad = (deg: number) => (deg * Math.PI) / 180;
const polar = (cx: number, cy: number, r: number, aDeg: number) => ({
	x: cx + r * Math.cos(toRad(aDeg)),
	y: cy + r * Math.sin(toRad(aDeg)),
});

// Sector path (filled from center)
function sectorPath(
	cx: number,
	cy: number,
	r: number,
	startDeg: number,
	endDeg: number,
) {
	const largeArc = endDeg - startDeg > 180 ? 1 : 0;
	const p1 = polar(cx, cy, r, startDeg);
	const p2 = polar(cx, cy, r, endDeg);
	return [
		`M ${cx} ${cy}`,
		`L ${p1.x} ${p1.y}`,
		`A ${r} ${r} 0 ${largeArc} 1 ${p2.x} ${p2.y}`,
		"Z",
	].join(" ");
}

export function RiskPieChartFilled({
	data,
	tooltipSuffix = "slanger i risikoklasse",
}: {
	data: Quad[];
	tooltipSuffix?: string;
}) {
	const [hovered, setHovered] = useState<number | null>(null);

	const size = 420;
	const cx = size / 2;
	const cy = size / 2;
	const r = 200;

	const slices = useMemo(() => {
		return data.map((d, i) => {
			const start = -90 + i * 90;
			const end = start + 90;
			const mid = (start + end) / 2;
			const labelPos = polar(cx, cy, r * 0.55, mid);
			const tipPos = polar(cx, cy, r * 0.8, mid);
			return { d, start, end, mid, labelPos, tipPos };
		});
	}, [data]);

	const hoveredSlice = slices.find((s) => s.d.class === hovered);

	return (
		<div className="relative mx-auto mt-8 w-full max-w-[420px]">
			{hoveredSlice && (
				<div
					className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg bg-black/90 px-4 py-2 text-sm text-white shadow-lg"
					style={{
						left: `${(hoveredSlice.tipPos.x / size) * 100}%`,
						top: `${(hoveredSlice.tipPos.y / size) * 100}%`,
					}}>
					{hoveredSlice.d.count} {tooltipSuffix} {hoveredSlice.d.class}
				</div>
			)}

			<svg
				viewBox={`0 0 ${size} ${size}`}
				className="w-full">
				<circle
					cx={cx}
					cy={cy}
					r={r + 8}
					fill="#F8F9F8"
				/>

				{slices.map((s) => (
					<path
						key={s.d.class}
						d={sectorPath(cx, cy, r, s.start, s.end)}
						fill={s.d.color}
						className={`cursor-pointer transition-opacity ${
							hovered !== null && hovered !== s.d.class ? "opacity-50" : ""
						}`}
						onMouseEnter={() => setHovered(s.d.class)}
						onMouseLeave={() => setHovered(null)}
					/>
				))}

				<line
					x1={cx}
					y1={cy - r}
					x2={cx}
					y2={cy + r}
					stroke="white"
					strokeWidth={8}
					strokeLinecap="round"
					opacity={0.95}
				/>
				<line
					x1={cx - r}
					y1={cy}
					x2={cx + r}
					y2={cy}
					stroke="white"
					strokeWidth={8}
					strokeLinecap="round"
					opacity={0.95}
				/>

				{slices.map((s) => (
					<g
						key={`label-${s.d.class}`}
						className={`select-none ${
							hovered !== null && hovered !== s.d.class ? "opacity-50" : ""
						}`}
						onMouseEnter={() => setHovered(s.d.class)}
						onMouseLeave={() => setHovered(null)}>
						<text
							x={s.labelPos.x}
							y={s.labelPos.y - 6}
							textAnchor="middle"
							className="fill-white text-[22px] font-semibold"
							style={{
								paintOrder: "stroke",
								stroke: "rgba(0,0,0,0.25)",
								strokeWidth: 1,
							}}>
							{`RK ${s.d.class}`}
						</text>
						<text
							x={s.labelPos.x}
							y={s.labelPos.y + 18}
							textAnchor="middle"
							className="fill-white text-[16px]"
							style={{
								paintOrder: "stroke",
								stroke: "rgba(0,0,0,0.25)",
								strokeWidth: 1,
							}}>
							{`${s.d.percentage}%`}
						</text>
					</g>
				))}
			</svg>
		</div>
	);
}
