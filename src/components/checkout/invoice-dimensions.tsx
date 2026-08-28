"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDimensionLabels } from "@/hooks/useDimensionLabels";
import { searchDimensions } from "@/services/dimensions.service";
import type { SearchDimensionResponse } from "@/types/dimensions.types";
import type { Order } from "@/types/orders.types";
import debounce from "lodash/debounce";
import { ChevronDown, Folder, Info, Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";

// Progressive-disclosure delay: 250ms per PBI spec.
const DISCLOSE_DELAY_MS = 250;

// Character cap for freetext / custom-add entries (carried over from the old
// component).
const MAX_LEN = 35;

const EXAMPLE_HINT_LEVEL_1 = "Eksempel: Internt kostnadssted som skal belastes";

interface Props {
	orderData: Order;
	setOrderData: (updater: (prev: Order) => Order) => void;
}

interface LevelConfig {
	label: string;
	/** true = OMNI-search (call /dimension/dimensionSearch), false = freetext. */
	omni: boolean;
}

interface LevelValue {
	name: string;
	/** BE dimensionId when the value was picked from the OMNI list; undefined
	 *  for custom-add or freetext entries so downstream levels don't try to
	 *  filter by a bogus parentId. */
	id?: number;
}

function writeToOrder(
	updater: (prev: Order) => Order,
	setOrderData: (u: (prev: Order) => Order) => void,
	level: number,
	name: string,
) {
	setOrderData((prev) => {
		const next = updater(prev);
		if (level === 0) {
			next.salesOrderHeader.customersOrderReference = name;
		} else if (level === 1) {
			next.salesOrderHeader.customerReference = name;
		} else if (level === 2) {
			next.salesOrderLines = next.salesOrderLines.map((line) => ({
				...line,
				accountPart3: name,
			}));
		}
		return next;
	});
}

export function InvoiceDimensions({ orderData, setOrderData }: Props) {
	const t = useTranslations("Checkout.dimensions");

	const [enabled, setEnabled] = useState(false);
	const { levels } = useDimensionLabels({
		fallback: [t("dimension1"), t("dimension2"), t("dimension3")],
	});
	const [values, setValues] = useState<LevelValue[]>([
		{ name: "" },
		{ name: "" },
		{ name: "" },
	]);
	const [visibleLevels, setVisibleLevels] = useState(0);
	const [openLevel, setOpenLevel] = useState<number | null>(null);
	const [results, setResults] = useState<SearchDimensionResponse[]>([]);
	const [searchTerms, setSearchTerms] = useState<string[]>(["", "", ""]);
	const [isLoadingResults, setIsLoadingResults] = useState(false);

	const inputRefs = useRef<Array<HTMLInputElement | null>>([null, null, null]);
	const wrapperRef = useRef<HTMLDivElement | null>(null);

	// Close the dropdown when clicking outside the whole component.
	useEffect(() => {
		function onDocClick(e: MouseEvent) {
			if (
				wrapperRef.current &&
				!wrapperRef.current.contains(e.target as Node)
			) {
				setOpenLevel(null);
			}
		}
		document.addEventListener("mousedown", onDocClick);
		return () => document.removeEventListener("mousedown", onDocClick);
	}, []);

	const runSearch = useCallback(
		async (level: number, term: string) => {
			setIsLoadingResults(true);
			try {
				const parentId =
					level > 0 && values[level - 1]?.id
						? String(values[level - 1].id)
						: undefined;
				const res = await searchDimensions(level + 1, term || undefined, parentId);
				setResults(res || []);
			} catch {
				setResults([]);
			} finally {
				setIsLoadingResults(false);
			}
		},
		[values],
	);

	// Debounced live-search — one instance shared across levels since only one
	// dropdown is open at a time.
	const debouncedSearch = useRef(
		debounce((level: number, term: string, exec: (l: number, t: string) => void) => {
			exec(level, term);
		}, 200),
	).current;

	const openLevelDropdown = (level: number) => {
		if (!levels[level]?.omni) return;
		setOpenLevel(level);
		runSearch(level, searchTerms[level] || "");
	};

	const handleEnableToggle = (checked: boolean) => {
		setEnabled(checked);
		if (checked) {
			setVisibleLevels(1);
			setTimeout(() => {
				inputRefs.current[0]?.focus();
				openLevelDropdown(0);
			}, DISCLOSE_DELAY_MS);
		} else {
			setValues([{ name: "" }, { name: "" }, { name: "" }]);
			setSearchTerms(["", "", ""]);
			setVisibleLevels(0);
			setOpenLevel(null);
			writeToOrder((p) => p, setOrderData, 0, "");
			writeToOrder((p) => p, setOrderData, 1, "");
			writeToOrder((p) => p, setOrderData, 2, "");
		}
	};

	const discloseNextLevel = (level: number) => {
		if (level >= 2) return;
		setTimeout(() => {
			setVisibleLevels((v) => Math.max(v, level + 2));
			inputRefs.current[level + 1]?.focus();
			openLevelDropdown(level + 1);
		}, DISCLOSE_DELAY_MS);
	};

	const commitValue = (level: number, name: string, id?: number) => {
		if (!name) return;
		const trimmed = name.slice(0, MAX_LEN);
		setValues((prev) => {
			const next = [...prev];
			next[level] = { name: trimmed, id };
			// Cascade-clear downstream levels since their parentId may have changed.
			for (let i = level + 1; i < 3; i++) next[i] = { name: "" };
			return next;
		});
		setSearchTerms((prev) => {
			const next = [...prev];
			next[level] = trimmed;
			for (let i = level + 1; i < 3; i++) next[i] = "";
			return next;
		});
		writeToOrder((p) => p, setOrderData, level, trimmed);
		// Clear downstream order-data too so the invoice doesn't keep stale
		// selections from before the parent change.
		for (let i = level + 1; i < 3; i++) {
			writeToOrder((p) => p, setOrderData, i, "");
		}
		setOpenLevel(null);
		discloseNextLevel(level);
	};

	const clearLevel = (level: number) => {
		setValues((prev) => {
			const next = [...prev];
			for (let i = level; i < 3; i++) next[i] = { name: "" };
			return next;
		});
		setSearchTerms((prev) => {
			const next = [...prev];
			for (let i = level; i < 3; i++) next[i] = "";
			return next;
		});
		for (let i = level; i < 3; i++) {
			writeToOrder((p) => p, setOrderData, i, "");
		}
		setVisibleLevels(level + 1);
		setOpenLevel(null);
		setTimeout(() => inputRefs.current[level]?.focus(), 0);
	};

	const handleInputChange = (level: number, val: string) => {
		const trimmed = val.slice(0, MAX_LEN);
		setSearchTerms((prev) => {
			const next = [...prev];
			next[level] = trimmed;
			return next;
		});
		if (levels[level]?.omni) {
			debouncedSearch(level, trimmed, runSearch);
			setOpenLevel(level);
		}
	};

	const handleInputKeyDown = (
		level: number,
		e: React.KeyboardEvent<HTMLInputElement>,
	) => {
		if (e.key === "Enter") {
			e.preventDefault();
			const term = searchTerms[level] || "";
			if (!term) return;
			if (levels[level]?.omni) {
				// Prefer exact match, else create-custom.
				const exact = results.find(
					(r) => r.dimensionName.toLowerCase() === term.toLowerCase(),
				);
				if (exact) commitValue(level, exact.dimensionName, exact.dimensionId);
				else commitValue(level, term);
			} else {
				commitValue(level, term);
			}
		} else if (e.key === "Escape") {
			setOpenLevel(null);
		}
	};

	const showCustomAddCTA = (level: number) => {
		if (!levels[level]?.omni) return false;
		const term = searchTerms[level]?.trim();
		if (!term) return false;
		return !results.some(
			(r) => r.dimensionName.toLowerCase() === term.toLowerCase(),
		);
	};

	const renderLevel = (level: number) => {
		const config = levels[level];
		if (!config) return null;
		const value = values[level];
		const isOpen = openLevel === level;
		const hasValue = !!value.name;
		const disabled = level > 0 && !values[level - 1]?.name;

		return (
			<div className="relative">
				<Label className="mb-1 block text-sm text-gray-700">
					{config.label || `Nivå ${level + 1}`}
				</Label>
				<div
					className={`flex items-center rounded-md border bg-white px-3 ${
						disabled
							? "border-gray-200 bg-gray-50"
							: isOpen
								? "border-[#009640]"
								: "border-gray-300"
					}`}
					style={{ height: 42 }}>
					<Folder className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
					<Input
						ref={(el) => {
							inputRefs.current[level] = el;
						}}
						type="text"
						value={hasValue ? value.name : searchTerms[level]}
						disabled={disabled}
						placeholder={`Velg nivå ${level + 1}`}
						maxLength={MAX_LEN}
						onChange={(e) => handleInputChange(level, e.target.value)}
						onKeyDown={(e) => handleInputKeyDown(level, e)}
						onFocus={() => {
							if (!hasValue) openLevelDropdown(level);
						}}
						className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
					/>
					{hasValue ? (
						<button
							type="button"
							aria-label="Clear"
							onClick={() => clearLevel(level)}
							className="ml-2 shrink-0 text-gray-500 hover:text-gray-800">
							<X className="h-4 w-4" />
						</button>
					) : config.omni ? (
						<button
							type="button"
							aria-label="Toggle"
							onClick={() =>
								isOpen ? setOpenLevel(null) : openLevelDropdown(level)
							}
							className="ml-2 shrink-0 text-gray-500 hover:text-gray-800">
							<ChevronDown
								className={`h-4 w-4 transition-transform ${
									isOpen ? "rotate-180" : ""
								}`}
							/>
						</button>
					) : null}
				</div>

				{isOpen && config.omni && !hasValue && (
					<div className="absolute left-0 right-0 z-40 mt-1 max-h-[220px] overflow-auto rounded-md border border-gray-200 bg-white shadow-md">
						{isLoadingResults ? (
							<div className="p-3 text-sm text-gray-500">Søker …</div>
						) : results.length > 0 ? (
							<ul>
								{results.map((r) => (
									<li key={`${r.dimensionId}-${r.dimensionName}`}>
										<button
											type="button"
											onClick={() =>
												commitValue(level, r.dimensionName, r.dimensionId)
											}
											className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100">
											{r.dimensionName}
										</button>
									</li>
								))}
								{showCustomAddCTA(level) && (
									<li className="border-t border-gray-100">
										<button
											type="button"
											onClick={() =>
												commitValue(level, searchTerms[level].trim())
											}
											className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#009640] hover:bg-gray-100">
											<Plus className="h-4 w-4" />
											Legg til &ldquo;{searchTerms[level].trim()}&rdquo;
										</button>
									</li>
								)}
							</ul>
						) : (
							<div>
								{showCustomAddCTA(level) ? (
									<button
										type="button"
										onClick={() =>
											commitValue(level, searchTerms[level].trim())
										}
										className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#009640] hover:bg-gray-100">
										<Plus className="h-4 w-4" />
										Legg til &ldquo;{searchTerms[level].trim()}&rdquo;
									</button>
								) : (
									<div className="p-3 text-sm text-gray-500">
										Ingen resultater funnet
									</div>
								)}
							</div>
						)}
					</div>
				)}
			</div>
		);
	};

	// The Order type carries current values that other flows (edit-payment
	// modal, punchout flows) may have pre-populated. Reflect those so the user
	// sees their prior choices without re-selecting.
	useEffect(() => {
		const dim1 = orderData.salesOrderHeader.customersOrderReference || "";
		const dim2 = orderData.salesOrderHeader.customerReference || "";
		const dim3 = orderData.salesOrderLines?.[0]?.accountPart3 || "";
		const hasAny = !!(dim1 || dim2 || dim3);
		if (hasAny && !enabled) {
			setEnabled(true);
			setValues([{ name: dim1 }, { name: dim2 }, { name: dim3 }]);
			setSearchTerms([dim1, dim2, dim3]);
			setVisibleLevels(dim3 ? 3 : dim2 ? 2 : 1);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div
			ref={wrapperRef}
			className="space-y-4">
			<div className="flex items-start gap-3">
				<Checkbox
					id="add-dimensions"
					checked={enabled}
					onCheckedChange={(v) => handleEnableToggle(!!v)}
					className="mt-0.5"
				/>
				<div className="flex flex-col gap-0.5 leading-tight">
					<Label
						htmlFor="add-dimensions"
						className="cursor-pointer text-sm font-medium leading-tight">
						Legg til dimensjoner
					</Label>
					<p className="text-xs leading-tight text-gray-500">
						Du kan legge til opptil 3 nivåer
					</p>
				</div>
			</div>

			{enabled && visibleLevels >= 1 && (
				<div className="space-y-3">
					{renderLevel(0)}
					<p className="text-xs text-gray-500">{EXAMPLE_HINT_LEVEL_1}</p>
					{visibleLevels >= 2 && renderLevel(1)}
					{visibleLevels >= 3 && renderLevel(2)}
				</div>
			)}

			{enabled && (
				<div className="flex items-start gap-2 rounded-md bg-[#F0FCF2] p-4 text-sm">
					<Info className="mt-0.5 h-4 w-4 shrink-0 text-[#009640]" />
					<div>
						<p className="font-semibold">Usikker?</p>
						<p className="text-gray-700">
							Spør din økonomiansvarlige eller ring oss på{" "}
							<a
								href="tel:+4732844030"
								className="text-[#009640] hover:underline">
								+47 32 84 40 30
							</a>
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
