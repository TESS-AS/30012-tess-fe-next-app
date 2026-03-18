import { Button } from "@/components/ui/button";
import type { Category } from "@/types/categories.types";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { STRIPE_COUNT } from "./constants";

function DecorativeStripes() {
	return (
		<div className="relative h-14">
			<div className="absolute right-0 bottom-0 left-0 h-3 bg-[#E8EAE9]" />
			<div className="relative container mx-auto h-full px-4">
				<div className="absolute right-4 bottom-0 flex items-end gap-5">
					{Array.from({ length: STRIPE_COUNT }).map((_, i) => (
						<div
							key={i}
							className="h-10 w-16 bg-[#E8EAE9]"
							style={{ transform: "skewX(-25deg)" }}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

export function DropdownFooter({
	category,
	onClose,
}: {
	category: Category;
	onClose: () => void;
}) {
	return (
		<>
			<div className="mb-6">
				<div className="container mx-auto flex items-center justify-end px-0 pt-5 pb-10">
					<Button
						variant="outlineGrey"
						asChild
						className="px-5 py-2.5">
						<Link
							onClick={onClose}
							href={`/${category.slug}`}>
							Utforsk alt av
							<span className="font-bold">{category.name}</span>
							<ChevronRight className="h-4 w-4" />
						</Link>
					</Button>
				</div>
			</div>
			<DecorativeStripes />
		</>
	);
}
