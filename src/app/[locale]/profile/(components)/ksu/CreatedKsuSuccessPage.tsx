"use client";

/**
 * Shown right after `POST /assortment/create` succeeds. Lives on the same
 * profile tab as the create page — routed via `?tab=ksu-create&created=X`.
 *
 * Reads the created assortment through `GET /assortment/:number` so the
 * display always reflects the authoritative BE state (counts, timestamps,
 * admin list) rather than echoing what we sent.
 */

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "@/i18n/navigation";
import {
	getAssortmentByNumber,
	type AssortmentDetail,
} from "@/services/assortment.service";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, ExternalLink, Pencil } from "lucide-react";

interface Props {
	assortmentNumber: string;
}

export function CreatedKsuSuccessPage({ assortmentNumber }: Props) {
	const router = useRouter();

	const { data, isLoading } = useQuery({
		queryKey: ["assortment-detail", assortmentNumber],
		queryFn: () => getAssortmentByNumber(assortmentNumber),
		enabled: Boolean(assortmentNumber),
		staleTime: 60 * 1000,
	});

	return (
		<div className="space-y-5">
			<div className="rounded-md border border-[#E5E7E6] bg-white px-6 py-5">
				<div className="flex items-center gap-2 text-[#1C6D2C]">
					<CheckCircle2 className="h-5 w-5" />
					<h2 className="text-lg font-semibold">KSU-et er oppdatert</h2>
				</div>
				<p className="mt-1 text-sm text-[#5A615D]">
					Alle endringer er lagret. Du kan administrere kategorier og eventuelt
					produkter.
				</p>

				<div className="mt-5 rounded-md border border-[#E5E7E6] bg-[#F8F9F8] p-4">
					{isLoading ? (
						<SummarySkeleton />
					) : data ? (
						<SummaryCard detail={data} />
					) : (
						<p className="text-sm text-[#5A615D]">
							Kunne ikke laste KSU-detaljer.
						</p>
					)}
				</div>

				<div className="mt-5 rounded-md border border-[#C6E7CD] bg-[#EFF9F1] p-4 text-sm">
					<p className="font-semibold text-[#1C6D2C]">
						Neste steg: Legg til varer
					</p>
					<p className="mt-1 text-[#0F1912]">
						Du kan nå gå til Tessix.no og legge til varer i utvalget. For å
						endre kategorier eller struktur, gå til &ldquo;Administrer
						KSU&rdquo; i menyen.
					</p>
				</div>

				<div className="mt-5 flex items-center gap-2">
					<Button
						variant="outline"
						onClick={() => router.push("/profile?tab=ksu-create")}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Tilbake
					</Button>
					<Button
						variant="outline"
						asChild>
						<a
							href="https://tessix.no"
							target="_blank"
							rel="noopener noreferrer">
							<ExternalLink className="mr-2 h-4 w-4" />
							Åpne i tessix.no
						</a>
					</Button>
				</div>
			</div>
		</div>
	);
}

function SummaryCard({ detail }: { detail: AssortmentDetail }) {
	return (
		<dl className="grid grid-cols-[160px_1fr] gap-y-2 text-sm">
			<dt className="text-[#5A615D]">KSU:</dt>
			<dd className="flex items-center gap-2 font-semibold text-[#0F1912]">
				{detail.assortmentName}
				<button
					type="button"
					aria-label="Edit KSU name"
					className="text-[#5A615D] hover:text-[#0F1912]">
					<Pencil className="h-3.5 w-3.5" />
				</button>
			</dd>
			<dt className="text-[#5A615D]">Beskrivelse:</dt>
			<dd className="text-[#0F1912]">
				{detail.assortmentDescription || "—"}
			</dd>
			<dt className="text-[#5A615D]">Antall kategorier:</dt>
			<dd className="font-semibold text-[#0F1912]">
				{detail.categoryCount ?? "—"}
			</dd>
			<dt className="text-[#5A615D]">Antall produkter:</dt>
			<dd className="font-semibold text-[#0F1912]">
				{detail.productCount != null
					? detail.productCount.toLocaleString()
					: "—"}
			</dd>
			<dt className="text-[#5A615D]">Basert på:</dt>
			<dd className="text-[#0F1912]">
				{detail.sourceAssortmentName ?? "Ingen tidligere KSU (nytt utvalg)"}
			</dd>
			<dt className="text-[#5A615D]">Administrator for KSU:</dt>
			<dd className="text-[#0F1912]">
				{detail.administrators && detail.administrators.length > 0 ? (
					<ul className="space-y-0.5">
						{detail.administrators.map((a) => (
							<li
								key={a.userId}
								className="font-semibold">
								{a.name}
							</li>
						))}
					</ul>
				) : (
					"—"
				)}
			</dd>
			<dt className="text-[#5A615D]">Opprettet av:</dt>
			<dd className="font-semibold text-[#0F1912]">
				{detail.createdByName ?? "—"}
			</dd>
			<dt className="text-[#5A615D]">Sist oppdatert:</dt>
			<dd className="font-semibold text-[#0F1912]">
				{detail.updatedAt ? formatDateTime(detail.updatedAt) : "—"}
			</dd>
		</dl>
	);
}

function SummarySkeleton() {
	return (
		<div className="space-y-2">
			{[0, 1, 2, 3, 4, 5].map((i) => (
				<div
					key={i}
					className="grid grid-cols-[160px_1fr] gap-y-2">
					<Skeleton className="h-4 w-28" />
					<Skeleton className="h-4 w-48" />
				</div>
			))}
		</div>
	);
}

function formatDateTime(raw: string): string {
	const d = new Date(raw);
	if (Number.isNaN(d.getTime())) return raw;
	const day = String(d.getUTCDate()).padStart(2, "0");
	const months = [
		"januar",
		"februar",
		"mars",
		"april",
		"mai",
		"juni",
		"juli",
		"august",
		"september",
		"oktober",
		"november",
		"desember",
	];
	const month = months[d.getUTCMonth()];
	const year = d.getUTCFullYear();
	const hh = String(d.getUTCHours()).padStart(2, "0");
	const mm = String(d.getUTCMinutes()).padStart(2, "0");
	return `${day}. ${month} ${year} - kl. ${hh}:${mm}`;
}
