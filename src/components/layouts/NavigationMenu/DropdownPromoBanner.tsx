import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

type DropdownPromoBannerProps = {
	onClose: () => void;
};

export function DropdownPromoBanner({ onClose }: DropdownPromoBannerProps) {
	return (
		<div className="container mx-auto px-0 pt-6 pb-2">
			<div className="flex flex-col items-start justify-between gap-4 rounded-lg bg-[#DCF7E0] px-5 py-4 sm:flex-row sm:items-center">
				<div className="flex min-w-0 items-start gap-3">
					<div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#005522]">
						<Check
							className="h-3.5 w-3.5 text-white"
							strokeWidth={3}
						/>
					</div>
					<div className="min-w-0">
						<p className="text-base font-bold text-[#005522]">
							Bygg din egen slange
						</p>
						<p className="mt-0.5 text-sm leading-snug text-[#005522]">
							Med slangekonfiguratoren velger du selv slange og ende 1 og 2.
							Slik får du en slange som er spesialtilpasset dine behov.
						</p>
					</div>
				</div>
				<Button
					variant="greenSolid"
					asChild
					className="shrink-0 px-4 py-2.5">
					<Link
						href="/hose-configurator"
						onClick={onClose}>
						<ArrowRight className="h-4 w-4" />
						Gå til slangekonfiguratoren
					</Link>
				</Button>
			</div>
		</div>
	);
}
