"use client";

import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Maximize2, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

type AngleHelpDrawerProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const ANGLE_OPTIONS = [
	{ value: "0", height: 38 },
	{ value: "90", height: 40 },
	{ value: "180", height: 59 },
	{ value: "270", height: 40 },
] as const;

export function AngleHelpDrawer({ open, onOpenChange }: AngleHelpDrawerProps) {
	const t = useTranslations("HoseConfigurator.step2.angleDrawer");

	return (
		<Sheet
			open={open}
			onOpenChange={onOpenChange}>
			<SheetContent
				side="right"
				className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-[440px] [&>button]:hidden">
				<SheetHeader className="shrink-0 space-y-0 border-b border-[#E8EAE9] px-5 py-4 text-left">
					<div className="flex items-center justify-between gap-3">
						<SheetTitle className="text-base leading-snug font-normal text-[#0F1912]">
							{t("title")}
						</SheetTitle>
						<div className="flex shrink-0 items-center gap-0.5">
							<button
								type="button"
								aria-label={t("expand")}
								className="rounded p-1.5 text-[#0F1912] hover:bg-[#F3F4F3]">
								<Maximize2 className="h-4 w-4" />
							</button>
							<button
								type="button"
								aria-label={t("close")}
								onClick={() => onOpenChange(false)}
								className="rounded p-1.5 text-[#0F1912] hover:bg-[#F3F4F3]">
								<X className="h-4 w-4" />
							</button>
						</div>
					</div>
				</SheetHeader>

				<div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
					<section>
						<h3 className="mb-6 text-base font-bold text-[#0F1912]">
							{t("rotationTitle")}
						</h3>
						<div className="flex flex-col items-center gap-8">
							{ANGLE_OPTIONS.map(({ value, height }) => (
								<div
									key={value}
									className="flex w-full flex-col items-center">
									<div className="relative flex w-full max-w-[280px] items-center justify-center gap-2">
										<span className="w-3 shrink-0 text-center text-sm font-bold text-[#0F1912]">
											1
										</span>
										<Image
											src={`/icons/angle/${value}.svg`}
											alt={`V = ${value}°`}
											width={164}
											height={height}
											className="h-auto w-full max-w-[220px]"
										/>
										<span className="w-3 shrink-0 text-center text-sm font-bold text-[#0F1912]">
											2
										</span>
									</div>
									<p className="mt-2 text-sm font-bold text-[#0F1912]">
										V = {value}°
									</p>
								</div>
							))}
						</div>
					</section>

					<section className="mt-10">
						<h3 className="mb-3 text-base font-bold text-[#0F1912]">
							{t("exampleTitle")}
						</h3>
						<p className="mb-6 text-sm leading-relaxed text-[#0F1912]">
							{t("exampleText")}
						</p>
						<div className="flex justify-center">
							<Image
								src="/icons/angle/example.svg"
								alt="270°"
								width={214}
								height={214}
								className="h-auto w-full max-w-[240px]"
							/>
						</div>
					</section>
				</div>

				<div className="shrink-0 border-t border-[#E8EAE9] bg-[#F3F4F3] px-5 py-4">
					<Button
						type="button"
						variant="outlineGreen"
						onClick={() => onOpenChange(false)}
						className="h-10 gap-2 bg-white px-5">
						<X className="h-4 w-4" />
						{t("cancel")}
					</Button>
				</div>
			</SheetContent>
		</Sheet>
	);
}
