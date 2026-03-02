"use client";

import { useState } from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { FaqAccordionItem } from "./FaqAccordionItem";
import type { FaqCategory, InfoItem } from "./types";
import { renderWithEmailLinks } from "./utils";

export type { FaqCategory, InfoItem } from "./types";
export { renderWithEmailLinks } from "./utils";

interface InfoPageProps {
	title: string;
	/** FAQ layout: numbered categories with question-mark icons */
	categories?: FaqCategory[];
	/** Simple layout: single accordion list (e.g. Kjopsbetingelser) */
	items?: InfoItem[];
	withFeedback?: boolean;
}

export function InfoPage({
	title,
	categories,
	items,
	withFeedback = false,
}: InfoPageProps) {
	const t = useTranslations("Faq");
	const [feedback, setFeedback] = useState<"yes" | "no" | null>(null);
	const [text, setText] = useState("");
	const [contactMe, setContactMe] = useState<boolean | null>(null);
	const [submitted, setSubmitted] = useState(false);
	// First two questions in category 1 ("Før innlogging og opprettelse") open by default
	const [category1Open, setCategory1Open] = useState<string[]>([
		"cat-1-item-0",
		"cat-1-item-1",
	]);

	const handleSubmit = () => {
		setSubmitted(true);
	};

	const useCategories = categories && categories.length > 0;
	const flatItems = items ?? [];

	return (
		<div className="container mx-auto px-4 py-8 sm:px-6 sm:py-10">
			<h1 className="mb-10 border-b border-[#E5E7E6] pb-4 text-2xl font-bold text-[#0F1912] sm:text-3xl">
				{title}
			</h1>

			{useCategories ? (
			<div className="space-y-10">
				{categories!.map((category) => {
					const isFirstCategory = category.number === 1;
					return (
						<section key={category.number}>
							<h2 className="mb-4 text-lg font-bold text-[#0F1912] sm:text-xl">
								{category.number}. {category.title}
							</h2>
							{isFirstCategory ? (
								<Accordion
									type="multiple"
									value={category1Open}
									onValueChange={setCategory1Open}
									className="w-full">
									{category.items.map((item, idx) => (
										<FaqAccordionItem
											key={idx}
											item={item}
											categoryNumber={category.number}
											index={idx}
										/>
									))}
								</Accordion>
							) : (
								<Accordion type="multiple" className="w-full">
									{category.items.map((item, idx) => (
										<FaqAccordionItem
											key={idx}
											item={item}
											categoryNumber={category.number}
											index={idx}
										/>
									))}
								</Accordion>
							)}
						</section>
					);
				})}
			</div>
			) : (
			<div className="rounded-lg border border-[#E5E7E6] bg-white shadow-sm">
				<Accordion
					type="single"
					collapsible
					className="w-full">
					{flatItems.map((item, idx) => (
						<AccordionItem
							key={idx}
							value={`item-${idx}`}
							className="border-b border-[#E5E7E6] last:border-b-0">
							<AccordionTrigger className="px-5 py-4 text-left text-base font-medium text-[#0F1912] hover:no-underline hover:bg-gray-50/80 data-[state=open]:bg-gray-50/50">
								{item.q}
							</AccordionTrigger>
							<AccordionContent className="whitespace-pre-line px-5 pb-4 pt-0 text-sm font-normal leading-relaxed text-[#5A615D]">
								{renderWithEmailLinks(item.a)}
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</div>
			)}

			{/* Ja/Nei feedback section – commented out for now (no borders; re-enable when needed)
			{withFeedback && (
				<div className="mt-12 rounded-lg border border-[#E5E7E6] bg-white p-6 shadow-sm">
					<div className="flex flex-wrap items-center gap-4">
						<p className="text-base font-medium text-[#0F1912]">
							{t("feedback.question")}
						</p>
						<div className="inline-flex overflow-hidden rounded-md border border-[#C1C4C2]">
							<button
								type="button"
								onClick={() => feedback === null && setFeedback("yes")}
								disabled={feedback !== null}
								className={`min-w-[100px] px-4 py-2.5 text-sm font-medium transition-colors ${
									feedback === "yes"
										? "bg-[#DCF7E0] font-semibold text-[#1C6D2C]"
										: "bg-white text-[#0F1912] hover:bg-gray-50"
								} ${feedback !== null ? "cursor-not-allowed opacity-70" : ""}`}>
								{t("feedback.yes")}
							</button>
							<button
								type="button"
								onClick={() => feedback === null && setFeedback("no")}
								disabled={feedback !== null}
								className={`min-w-[100px] border-l border-[#C1C4C2] px-4 py-2.5 text-sm font-medium transition-colors ${
									feedback === "no"
										? "bg-[#FEE2E2] font-semibold text-[#B91C1C]"
										: "bg-white text-[#0F1912] hover:bg-gray-50"
								} ${feedback !== null ? "cursor-not-allowed opacity-70" : ""}`}>
								{t("feedback.no")}
							</button>
						</div>
					</div>

					{feedback === "yes" && (
						<div className="mt-6 flex items-start gap-2 text-[#1C6D2C]">
							<CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
							<span className="text-sm">
								{t("feedback.thanks")}
								<br />
								<span className="text-[#0F1912]">{t("feedback.closing")}</span>
							</span>
						</div>
					)}

					{feedback === "no" && !submitted && (
						<div className="mt-6 space-y-4">
							<p className="text-sm text-[#5A615D]">{t("feedback.helpText")}</p>
							<div>
								<label className="mb-1 block text-sm font-medium text-[#0F1912]">
									{t("feedback.whatWereYouLookingFor")}
								</label>
								<textarea
									value={text}
									onChange={(e) => setText(e.target.value)}
									className="w-full rounded-md border border-[#C1C4C2] px-3 py-2 text-sm text-[#0F1912] placeholder:text-[#9CA3AF] focus:border-[#1C6D2C] focus:outline-none focus:ring-1 focus:ring-[#1C6D2C]"
									rows={3}
									placeholder={t("feedback.placeholder")}
								/>
							</div>
							<div className="flex flex-wrap items-center gap-4">
								<p className="text-sm text-[#5A615D]">
									{t("feedback.contactQuestion")}
								</p>
								<div className="inline-flex overflow-hidden rounded-md border border-[#C1C4C2]">
									<button
										type="button"
										onClick={() => setContactMe(true)}
										className={`min-w-[100px] px-4 py-2 text-sm font-medium transition-colors ${
											contactMe === true
												? "bg-[#DCF7E0] font-semibold text-[#1C6D2C]"
												: "bg-white text-[#0F1912] hover:bg-gray-50"
										}`}>
										{t("feedback.yes")}
									</button>
									<button
										type="button"
										onClick={() => setContactMe(false)}
										className={`min-w-[100px] border-l border-[#C1C4C2] px-4 py-2 text-sm font-medium transition-colors ${
											contactMe === false
												? "bg-gray-100 font-semibold text-[#5A615D]"
												: "bg-white text-[#0F1912] hover:bg-gray-50"
										}`}>
										{t("feedback.no")}
									</button>
								</div>
							</div>
							<button
								type="button"
								onClick={handleSubmit}
								className="rounded-md bg-[#1C6D2C] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#165a24]">
								{t("feedback.send")}
							</button>
						</div>
					)}

					{feedback === "no" && submitted && (
						<div className="mt-6 flex items-center gap-2 text-[#1C6D2C]">
							<CheckCircle className="h-5 w-5 shrink-0" />
							<span className="text-sm">{t("feedback.submittedMessage")}</span>
						</div>
					)}
				</div>
			)}
			*/}
		</div>
	);
}
