"use client";

import { useState } from "react";

import { FeedbackDialog } from "@/components/ui/dialogs/feedback-dialog";
import { ThumbsDown } from "lucide-react";

export function FeedbackSideTab() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className="fixed right-0 top-1/2 z-50 flex -translate-y-1/2 cursor-pointer flex-col items-center gap-1.5 rounded-l-md border-[3px] border-r-0 border-transparent bg-[#F0F5FF] px-1.5 py-1.5 shadow-md transition-colors hover:bg-[#E5EDFF] active:border-[#E5EDFF] active:bg-white md:gap-2.5 md:rounded-l-lg md:px-2.5 md:py-2.5"
				aria-label="Gi tilbakemelding"
			>
				<ThumbsDown className="h-4 w-4 text-[#362F78] md:h-5 md:w-5" />
				<span
					className="block text-xs font-bold tracking-wide whitespace-nowrap text-[#362F78] md:text-sm"
					style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
				>
					TILBAKEMELDING
				</span>
			</button>
			<FeedbackDialog open={isOpen} onOpenChange={setIsOpen} />
		</>
	);
}
