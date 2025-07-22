"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface FeedbackDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
	const [selectedType, setSelectedType] = React.useState<
		"Ris" | "Ros" | "Forslag" | null
	>(null);
	const [message, setMessage] = React.useState("");

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md rounded-2xl px-6 pt-4 pb-6">
				<DialogHeader>
					<DialogTitle className="text-lg font-semibold">
						Gi oss tilbakemelding
					</DialogTitle>
					<DialogClose className="text-muted-foreground" />
				</DialogHeader>

				<div className="relative h-[150px] w-full overflow-hidden rounded-md">
					<Image
						src="/images/feedback.png"
						alt="Feedback banner"
						fill
						className="object-cover grayscale"
					/>
				</div>

				<div className="text-muted-foreground space-y-1 pt-4 text-sm">
					<p>
						<strong>Ris</strong> viser hvor vi kan forbedre oss.
					</p>
					<p>
						<strong>Ros</strong> hjelper oss å fortsette med det som fungerer.
					</p>
					<p>
						<strong>Forslag</strong> gir oss nye ideer.
					</p>
				</div>

				<div className="space-y-2 pt-4">
					<p className="text-sm font-medium text-black">Type tilbakemelding</p>

					<div className="inline-flex w-full overflow-hidden rounded-md border text-sm font-medium">
						{(["Ris", "Ros", "Forslag"] as const).map((type, index, array) => (
							<button
								key={type}
								onClick={() => setSelectedType(type)}
								className={cn(
									"w-full py-2 text-center transition-colors",
									"border-r last:border-r-0", // border between buttons
									selectedType === type
										? "bg-gray-100 font-semibold"
										: "bg-white hover:bg-gray-50",
									"focus:outline-none",
								)}
								type="button">
								{type}
							</button>
						))}
					</div>
				</div>

				<div className="pt-4">
					<p className="mb-2 text-sm font-medium text-black">
						Din tilbakemelding
					</p>
					<Textarea
						placeholder="Skriv så konkret du kan"
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						className="resize-none text-sm"
						rows={4}
					/>
				</div>

				<Button
					disabled={!selectedType || !message.trim()}
					className="mt-6 w-full bg-green-600 text-white hover:bg-green-700">
					Send tilbakemelding
				</Button>
			</DialogContent>
		</Dialog>
	);
}
