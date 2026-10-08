"use client";

/**
 * "Hvem er ansvarlig(e)" — user autocomplete + chip list for the KSU wizard.
 *
 * Reused across all four creation options and the admin surface. Doesn't
 * own any form state — just reads from and writes to the wizard controller.
 *
 * Per product spec, the surface deliberately does NOT render "Hvem er kunden"
 * or "Kunder knyttet til KSU" sections — those UI blocks are out of scope.
 */

import * as React from "react";

import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useSearchUsers } from "@/hooks/useAssortmentQueries";
import type { AssortmentWizardController } from "@/hooks/useAssortmentWizard";
import type { UserSearchResult } from "@/types/assortment.types";
import { Search, X } from "lucide-react";

interface Props {
	wizard: AssortmentWizardController;
}

export function AnsvarligeSection({ wizard }: Props) {
	const [query, setQuery] = React.useState("");
	const [open, setOpen] = React.useState(false);
	const { results, isSearching } = useSearchUsers(query);

	// Keep track of user details we've seen so chips can render the name/email
	// without a separate round-trip. We only have access to users via the
	// search endpoint, so this cache is the FE's memory of "we've seen this user".
	const [userDetails, setUserDetails] = React.useState<
		Record<number, UserSearchResult>
	>({});
	React.useEffect(() => {
		if (!results.length) return;
		setUserDetails((prev) => {
			const next = { ...prev };
			for (const u of results) next[u.userId] = u;
			return next;
		});
	}, [results]);

	const selectedUsers = wizard.formData.users;
	const selectedIds = new Set(selectedUsers.map((u) => u.userId));

	const handleAdd = (user: UserSearchResult) => {
		wizard.addUser(user.userId, false);
		setQuery("");
		setOpen(false);
	};

	return (
		<div className="space-y-4">
			<div>
				<h3 className="text-base font-semibold text-[#0F1912]">
					Hvem er ansvarlig(e)?
				</h3>
				<p className="mt-1 text-sm text-[#5A615D]">
					Søk opp og legg til én eller flere ansvarlige for denne KSUen.
				</p>
			</div>

			<div className="relative max-w-md">
				<label
					htmlFor="ksu-user-search"
					className="mb-1 block text-sm text-[#0F1912]">
					Legg til ansvarlig(e)
				</label>
				<Search className="pointer-events-none absolute top-[34px] left-3 h-4 w-4 text-[#8A8F8C]" />
				<Input
					id="ksu-user-search"
					value={query}
					placeholder="Søk etter person ..."
					onChange={(e) => {
						setQuery(e.target.value);
						setOpen(true);
					}}
					onFocus={() => query.length >= 2 && setOpen(true)}
					className="pl-9"
				/>
				{query && (
					<button
						type="button"
						onClick={() => {
							setQuery("");
							setOpen(false);
						}}
						aria-label="Clear search"
						className="absolute top-[34px] right-3 text-[#8A8F8C] hover:text-[#0F1912]">
						<X className="h-4 w-4" />
					</button>
				)}

				{open && query.length >= 2 && (
					<div className="absolute top-full right-0 left-0 z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-[#E5E7E6] bg-white shadow-md">
						{isSearching ? (
							<div className="px-3 py-2 text-sm text-[#5A615D]">Søker ...</div>
						) : results.length === 0 ? (
							<div className="px-3 py-2 text-sm text-[#5A615D]">
								Ingen treff for &ldquo;{query}&rdquo;
							</div>
						) : (
							<ul>
								{results.map((u) => {
									const already = selectedIds.has(u.userId);
									const displayName =
										formatUserName(u) || `Bruker ${u.userId}`;
									return (
										<li key={u.userId}>
											<button
												type="button"
												disabled={already}
												onClick={() => handleAdd(u)}
												className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm hover:bg-[#F3F4F3] disabled:opacity-50 disabled:hover:bg-transparent">
												<span className="font-medium text-[#0F1912]">
													{displayName}
													{already && (
														<span className="ml-2 text-xs text-[#5A615D]">
															(allerede lagt til)
														</span>
													)}
												</span>
												{u.email && (
													<span className="text-xs text-[#5A615D]">
														{u.email}
													</span>
												)}
											</button>
										</li>
									);
								})}
							</ul>
						)}
					</div>
				)}
			</div>

			{selectedUsers.length > 0 && (
				<div className="space-y-2">
					<h4 className="text-sm font-medium text-[#0F1912]">
						Lagt til ({selectedUsers.length})
					</h4>
					<ul className="space-y-2">
						{selectedUsers.map((u) => {
							const details = userDetails[u.userId];
							const name = formatUserName(details) || `Bruker ${u.userId}`;
							return (
								<li
									key={u.userId}
									className="flex items-center justify-between gap-3 rounded-md border border-[#E5E7E6] bg-white px-3 py-2">
									<div className="flex flex-col">
										<span className="text-sm font-medium text-[#0F1912]">
											{name}
										</span>
										{details?.email && (
											<span className="text-xs text-[#5A615D]">
												{details.email}
											</span>
										)}
										{details?.phone && (
											<span className="text-xs text-[#5A615D]">
												{details.phone}
											</span>
										)}
									</div>
									<div className="flex items-center gap-2">
										<Select
											value={u.canAdminister ? "admin" : "role"}
											onValueChange={(v) =>
												wizard.setUserRole(u.userId, v === "admin")
											}>
											<SelectTrigger className="h-9 w-[150px] bg-white text-sm">
												<SelectValue placeholder="Velg rolle ..." />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="role">Velg rolle ...</SelectItem>
												<SelectItem value="admin">Administrator</SelectItem>
											</SelectContent>
										</Select>
										<button
											type="button"
											onClick={() => wizard.removeUser(u.userId)}
											aria-label={`Fjern ${name}`}
											className="rounded p-1 text-[#5A615D] hover:bg-[#F3F4F3] hover:text-[#0F1912]">
											<X className="h-4 w-4" />
										</button>
									</div>
								</li>
							);
						})}
					</ul>
				</div>
			)}
		</div>
	);
}

function formatUserName(u: UserSearchResult | undefined): string {
	if (!u) return "";
	return [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
}
