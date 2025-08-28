"use client";

import { useState } from "react";

import { CheckCircle, Info } from "lucide-react";
import { useTranslations } from "next-intl";

export default function FaqPage() {
	const t = useTranslations("Faq");
	const [feedback, setFeedback] = useState<"yes" | "no" | null>(null);
	const [text, setText] = useState("");
	const [contactMe, setContactMe] = useState<boolean | null>(null);
	const [submitted, setSubmitted] = useState(false);

	const handleSubmit = () => {
		// TODO: send feedback to API here
		console.log({ text, contactMe });
		setSubmitted(true);
	};

	const faqItems = [
		{
			q: t("questions.openingHours"),
			a: t.rich("answers.openingHours", {
				link: (chunks) => (
					<a
						href="https://ny.tess.no/servicesenter/"
						target="_blank"
						rel="noopener noreferrer"
						className="text-green-700 underline">
						{chunks}
					</a>
				),
			}),
		},
		{
			q: t("questions.delivery"),
			a: t.rich("answers.delivery", {
				link: (chunks) => (
					<a
						href="https://ny.tess.no/kontakt/"
						target="_blank"
						rel="noopener noreferrer"
						className="text-green-700 underline">
						{chunks}
					</a>
				),
			}),
		},
		{ q: t("questions.forgotPassword"), a: t("answers.forgotPassword") },
		{ q: t("questions.addToOrder"), a: t("answers.addToOrder") },
		{ q: t("questions.notFound"), a: t("answers.notFound") },
		{
			q: t("questions.missingProduct"),
			a: t("answers.missingProduct"),
		},
		{
			q: t("questions.contactErrors"),
			a: t.rich("answers.contactErrors", {
				email: (chunks) => (
					<a
						href="mailto:netthandel@tess.no"
						className="text-green-700 underline">
						{chunks}
					</a>
				),
			}),
		},
		{
			q: t("questions.specificProduct"),
			a: t.rich("answers.specificProduct", {
				link: (chunks) => (
					<a
						href="https://ny.tess.no/servicesenter/"
						target="_blank"
						rel="noopener noreferrer"
						className="text-green-700 underline">
						{chunks}
					</a>
				),
			}),
		},
	];

	return (
		<div className="container mx-auto px-6 py-12">
			<h1 className="mb-10 border-b border-gray-200 pb-5 text-4xl font-bold">
				{t("title")}
			</h1>

			<div className="grid gap-8 md:grid-cols-2">
				<div className="space-y-6">
					{faqItems.slice(0, 5).map((item, idx) => (
						<div
							key={idx}
							className="flex items-start gap-3">
							<Info className="mt-1 h-5 w-5 text-green-900" />
							<div>
								<p className="font-semibold">{item.q}</p>
								<p className="text-sm font-light text-gray-500">{item.a}</p>
							</div>
						</div>
					))}
				</div>

				<div className="space-y-6">
					{faqItems.slice(5).map((item, idx) => (
						<div
							key={idx}
							className="flex items-start gap-3">
							<Info className="mt-1 h-5 w-5 text-green-900" />
							<div>
								<p className="font-semibold">{item.q}</p>
								<p className="text-sm font-light text-gray-500">{item.a}</p>
							</div>
						</div>
					))}
				</div>
			</div>

			<div className="mt-12 border-t pt-6">
				<div className="flex items-center gap-4">
					<p className="text-gray-700">{t("feedback.question")}</p>

					<div className="inline-flex overflow-hidden rounded-md border border-gray-300">
						<button
							onClick={() => feedback === null && setFeedback("yes")}
							disabled={feedback !== null}
							className={`min-w-[100px] px-4 py-2 text-sm font-medium transition-colors ${
								feedback === "yes"
									? "bg-gray-100 font-semibold text-green-700"
									: "bg-white text-black hover:bg-gray-50"
							} ${feedback !== null ? "cursor-not-allowed opacity-70" : ""}`}>
							{t("feedback.yes")}
						</button>

						<button
							onClick={() => feedback === null && setFeedback("no")}
							disabled={feedback !== null}
							className={`min-w-[100px] border-l border-gray-300 px-4 py-2 text-sm font-medium transition-colors ${
								feedback === "no"
									? "bg-gray-100 font-semibold text-red-600"
									: "bg-white text-black hover:bg-gray-50"
							} ${feedback !== null ? "cursor-not-allowed opacity-70" : ""}`}>
							{t("feedback.no")}
						</button>
					</div>
				</div>

				{feedback === "yes" && (
					<div className="mt-6 flex items-center gap-2 text-green-700">
						<CheckCircle className="h-5 w-5" />
						<span>
							{t("feedback.thanks")}
							<br />
							<span className="text-gray-800">{t("feedback.closing")}</span>
						</span>
					</div>
				)}

				{feedback === "no" && !submitted && (
					<div className="mt-6 space-y-4">
						<p className="text-gray-700">{t("feedback.helpText")}</p>

						<div>
							<label className="mb-1 block text-sm font-medium text-gray-700">
								{t("feedback.whatWereYouLookingFor")}
							</label>
							<textarea
								value={text}
								onChange={(e) => setText(e.target.value)}
								className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-green-700 focus:ring-green-700"
								rows={3}
								placeholder={t("feedback.placeholder")}
							/>
						</div>

						<div className="mb-2 flex items-center gap-4">
							<p className="text-sm text-gray-700">
								{t("feedback.contactQuestion")}
							</p>
							<div className="inline-flex overflow-hidden rounded-md border border-gray-300">
								<button
									onClick={() => setContactMe(true)}
									className={`min-w-[100px] px-4 py-2 text-sm font-medium transition-colors ${
										contactMe === true
											? "bg-gray-100 font-semibold text-green-700"
											: "bg-white text-black hover:bg-gray-50"
									}`}>
									{t("feedback.yes")}
								</button>
								<button
									onClick={() => setContactMe(false)}
									className={`min-w-[100px] border-l border-gray-300 px-4 py-2 text-sm font-medium transition-colors ${
										contactMe === false
											? "bg-gray-100 font-semibold text-red-600"
											: "bg-white text-black hover:bg-gray-50"
									}`}>
									{t("feedback.no")}
								</button>
							</div>
						</div>

						<button
							onClick={handleSubmit}
							className="rounded bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800">
							{t("feedback.send")}
						</button>
					</div>
				)}

				{feedback === "no" && submitted && (
					<div className="mt-6 flex items-center gap-2 text-green-700">
						<CheckCircle className="h-5 w-5" />
						<span>{t("feedback.submittedMessage")}</span>
					</div>
				)}
			</div>
		</div>
	);
}
