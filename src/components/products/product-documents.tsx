"use client";

import { Separator } from "@/components/ui/separator";
import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";

export type ProductDocument = { title: string; url: string };

export function ProductDocuments({
	documents,
}: {
	documents?: ProductDocument[];
}) {
	const t = useTranslations("Product");

	return (
		<section className="mt-8">
			<h2 className="pb-5 text-sm font-medium text-gray-500">
				{t("documentsTitle")}
			</h2>
			<Separator />

			{documents ? (
				<ul className="mt-4 space-y-4">
					{documents!.map((doc) => (
						<li
							key={doc.url}
							className="flex items-start gap-3">
							<FileText className="mt-0.5 h-5 w-5 text-green-900" />
							<a
								href={doc.url}
								target="_blank"
								rel="noopener noreferrer"
								className="text-green-900 hover:underline">
								{doc.title}
							</a>
						</li>
					))}
				</ul>
			) : (
				<p className="mt-4 text-sm text-gray-500">
					{t("noDocumentsAvailable")}
				</p>
			)}
		</section>
	);
}
