"use client";

import React, { useRef } from "react";
import { useEffect, useState, useMemo } from "react";

import CustomerNumberSwitcher from "@/components/customer-profile/customer-number-switcher";
import { NoResults } from "@/components/empty-search-result";
import CategoryNavigationMenu from "@/components/layouts/NavigationMenu/NavigationMenu";
import { ProductItem } from "@/components/products/product-item-search";
import SearchAside from "@/components/search-aside";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AuthDialog from "@/components/ui/dialogs/auth-dialog";
import { FeedbackDialog } from "@/components/ui/dialogs/feedback-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { PriceDisplay } from "@/components/ui/price-display";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER } from "@/constants/checkout";
import { useProfile } from "@/contexts/ProfileContext";
import { useClickOutside } from "@/hooks/useClickOutside";
import { profileKeys } from "@/hooks/useGetProfileData";
import { useInstantSearch } from "@/hooks/useInstantSearch";
import { useOrderSummary } from "@/hooks/useOrderSummary";
import { useRouter } from "@/i18n/navigation";
import { useAppContext } from "@/lib/appContext";
import { useCategories } from "@/lib/CategoriesProvider";
import { buildCategoryPath, findCategoryByGroupId } from "@/lib/category-utils";
import { useSearchStore } from "@/lib/searchStore";
import axiosClient from "@/services/axiosClient";
import { getProductVariations } from "@/services/product.service";
import { Category } from "@/types/categories.types";
import { IProductSearch } from "@/types/search.types";
import { ProfileUser } from "@/types/user.types";
import { useQueryClient } from "@tanstack/react-query";
import {
	BookOpen,
	ChevronDown,
	ChevronUp,
	FileText,
	LogOut,
	MessageSquareText,
	Plus,
	Search,
	ShoppingCart,
	User,
	UserIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

export default function Header({ profile }: { profile: ProfileUser | null }) {
	const {
		categories,
		loading,
		error,
		refetch: refetchCategories,
	} = useCategories();
	const queryClient = useQueryClient();

	const currentLocale = useLocale();
	const t = useTranslations();
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// Check if user came from alle-kategorier page
	const [fromAlleKategorier, setFromAlleKategorier] = useState(false);

	useEffect(() => {
		// Check if currently on alle-kategorier page
		if (pathname?.includes("/alle-kategorier")) {
			setFromAlleKategorier(true);
			return;
		}

		// Check sessionStorage for flag (set when navigating from alle-kategorier to category)
		const flag = sessionStorage.getItem("fromCategoriesPage");
		if (flag === "true") {
			// Check if we're on a category page (not subcategory/segment)
			// Path structure: /[locale]/[category] = 2 segments, /[locale]/[category]/[subcategory] = 3 segments
			const pathSegments = pathname?.split("/").filter(Boolean) || [];
			const isCategoryPage = pathSegments.length === 2; // Only locale and category

			if (isCategoryPage) {
				setFromAlleKategorier(true);
			} else {
				// Clear flag when navigating deeper (subcategory/segment)
				sessionStorage.removeItem("fromCategoriesPage");
				setFromAlleKategorier(false);
			}
		} else {
			setFromAlleKategorier(false);
		}
	}, [pathname]);

	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [isModalIdOpen, setIsModalIdOpen] = useState<string | null>(null);
	const [variations, setVariations] = useState<Record<string, any>>({});
	const { sumAfterDiscount } = useOrderSummary();
	const { cartItems, isAuthOpen, setIsAuthOpen } = useAppContext();

	const missingDefaultVariables = useMemo(() => {
		if (!profile) return false;
		return (
			!profile.defaultWarehouseNumber ||
			!profile.defaultCompanyNumber ||
			!profile.defaultCustomerNumber
		);
	}, [profile]);

	const {
		query: searchQuery,
		setQuery: setSearchQuery,
		data: searchData,
		isLoading: isSearchLoading,
		isFetching: isSearchFetching,
		clearSearch,
	} = useInstantSearch({ minQueryLength: 1 });

	const [urlQueryForDisplay, setUrlQueryForDisplay] = useState<string>("");
	const [isInputFocused, setIsInputFocused] = useState(false);
	const isUserEditingRef = useRef(false);

	useEffect(() => {
		const urlQuery = searchParams.get("query");
		if (urlQuery) {
			setUrlQueryForDisplay(urlQuery);
			if (!isUserEditingRef.current && searchQuery !== urlQuery) {
				/* empty */
			}
			justNavigatedRef.current = false;
		} else {
			setUrlQueryForDisplay("");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams]);
	const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const justNavigatedRef = useRef(false);
	const { shouldFocus, resetFocus } = useSearchStore();

	const searchCategories = useMemo(() => {
		if (!searchData?.categories || !categories) return [];

		return searchData.categories.map((searchCategory) => {
			// Find the category in the category tree using categoryNumber (which matches groupId)
			const { categoryNumber } = searchCategory;
			const foundCategory = categoryNumber
				? findCategoryByGroupId(categories, categoryNumber)
				: null;

			// Build URL path from category tree if found
			let urlPath: string[] | null = null;
			if (foundCategory && categories) {
				urlPath = buildCategoryPath(categories, foundCategory);
			}

			// Use category name from found category, or fallback to API name
			const displayName = foundCategory?.name || searchCategory.name;

			return {
				id: categoryNumber || searchCategory.name,
				name: displayName,
				count: parseInt(searchCategory.productVariantCount) || 0,
				slug: urlPath || searchCategory.slug || [], // Use path from category tree, fallback to API slug
			};
		});
	}, [searchData?.categories, categories]);



	useEffect(() => {
		if (shouldFocus) {
			inputRef.current?.focus();
			resetFocus();
		}
	}, [shouldFocus, resetFocus]);

	const searchRef = useClickOutside<HTMLDivElement>(() => {
		if (justNavigatedRef.current) {
			justNavigatedRef.current = false;
			setIsSearchOpen(false);
			return;
		}
		const urlQuery = searchParams.get("query");
		const isOnSearchPage = pathname.includes("/search");
		if (!urlQuery && !isOnSearchPage) {
			clearSearch();
		}
		setIsSearchOpen(false);
	});

	useEffect(() => {
		setVariations({});
		setIsModalIdOpen(null);
	}, [searchQuery]);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		const queryToSearch = searchQuery.trim() || urlQueryForDisplay.trim();
		if (queryToSearch) {
			const firstProduct = searchData?.productRes?.[0];
			if (firstProduct?.redirect && firstProduct?.itemNumberMatch) {
				justNavigatedRef.current = true;
				let redirectPath = firstProduct.redirect.trim();

				if (!redirectPath.startsWith("/")) {
					redirectPath = `/${redirectPath}`;
				}

				try {
					const url = new URL(redirectPath, window.location.origin);
					url.searchParams.set("itemNumber", queryToSearch);
					redirectPath = url.pathname + url.search;
				} catch {
					const separator = redirectPath.includes("?") ? "&" : "?";
					redirectPath = `${redirectPath}${separator}itemNumber=${encodeURIComponent(queryToSearch)}`;
				}
				router.push(redirectPath);
				setSearchQuery("");
				inputRef.current?.blur();
				setIsInputFocused(false);
				setIsSearchOpen(false);
				return;
			}
			if (firstProduct?.redirect && firstProduct?.sapNumberMatch) {
				justNavigatedRef.current = true;
				let redirectPath = firstProduct.redirect.trim();

				if (!redirectPath.startsWith("/")) {
					redirectPath = `/${redirectPath}`;
				}

				try {
					const url = new URL(redirectPath, window.location.origin);
					url.searchParams.set("sapNumber", queryToSearch);
					redirectPath = url.pathname + url.search;
				} catch {
					const separator = redirectPath.includes("?") ? "&" : "?";
					redirectPath = `${redirectPath}${separator}sapNumber=${encodeURIComponent(queryToSearch)}`;
				}
				router.push(redirectPath);
				setSearchQuery("");
				inputRef.current?.blur();
				setIsInputFocused(false);
				setIsSearchOpen(false);
				return;
			}
			justNavigatedRef.current = true;
			router.push(`/search?query=${encodeURIComponent(queryToSearch)}`);
			setSearchQuery("");
			inputRef.current?.blur();
			setIsInputFocused(false);
		}
		setIsSearchOpen(false);
	};

	const handleLanguageChange = (locale: string) => {
		const pathWithoutLocale = pathname.replace(/^\/(en|no)/, "") || "/";
		router.replace(pathWithoutLocale, { locale });
	};

	const handlePick = (href: string) => {
		router.push(href);
		clearSearch();
		setIsSearchOpen(false);
	};

	const handleLogout = async () => {
		try {
			await axiosClient.post("/logout");
		} catch (error) {
			console.error("Logout API failed", error);
		}
		queryClient.setQueryData(profileKeys.detail(), null);
		queryClient.invalidateQueries({ queryKey: profileKeys.all });
		queryClient.removeQueries({ queryKey: profileKeys.all });
		setIsAuthOpen(false);
		router.push("/");
	};

	const isHoseManagementCustomer =
		profile?.defaultCustomerNumber ===
		SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER;

	// Access flags for services shown under "Tjenester" in the profile dropdown
	const hasHoseManagementAccess = !!profile;
	const hasTessEdiAccess =
		!!profile &&
		profile.role === "admin" &&
		profile.defaultCustomerNumber !== SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER;

	return (
		<header
			className={`bg-background relative z-50 h-[182px] w-full border-t ${isHoseManagementCustomer ? "flex flex-col justify-end pb-[50px]" : ""}`}>
			<div className="container m-auto flex h-16 items-center justify-between">
				<div className="flex items-center gap-4">
					<Link
						href="/"
						className="flex items-center gap-4">
						<Image
							src="/icons/TESSLogo.svg"
							alt="Logo"
							width={144}
							height={144}
						/>
					</Link>
					<div className="flex items-center gap-8">
						{!isHoseManagementCustomer && (
							<Button
								variant="ghost"
								className={`text-md mb-2 rounded-none px-0 pb-2 hover:bg-transparent ${
									!pathname.includes("/profile") &&
									(pathname === "/" ||
										pathname.startsWith("/en") ||
										pathname.startsWith("/no"))
										? "rounded-none border-b-2 border-[#003D1A] font-bold"
										: "font-normal text-[#5A615D] hover:rounded-none hover:border-b-2 hover:border-[#003D1A]"
								}`}
								onClick={() => router.push("/")}>
								E-handel
							</Button>
						)}
						{profile && missingDefaultVariables && (
							<CustomerNumberSwitcher
								profile={profile}
								forceOpen
								blockUntilComplete
								hideTrigger
							/>
						)}
						<Button
							variant="ghost"
							className={`text-md mb-2 px-0 pb-2 hover:bg-transparent ${
								pathname.includes("/profile")
									? "rounded-none border-b-2 border-[#003D1A] font-bold"
									: "font-normal text-[#5A615D] hover:rounded-none hover:border-b-2 hover:border-[#003D1A]"
							}`}
							onClick={() =>
								profile ? router.push("/profile") : setIsAuthOpen(true)
							}>
							{t("Home.myProfile")}
						</Button>
					</div>
				</div>
				{profile && (
					<div className="flex items-center gap-2 rounded-md bg-[#F0FCF2] px-3 py-1.5">
						<Button
							variant="ghost"
							className="text-sm font-medium text-[#003D1A] hover:bg-transparent">
							<MessageSquareText className="h-4 w-4" /> Vær med på utviklingen
						</Button>
						<Button
							variant="outlineGrey"
							onClick={() => setIsFeedbackDialogOpen(true)}>
							<Plus className="h-4 w-4" /> Gi tilbakemelding
						</Button>
					</div>
				)}
			</div>
			<div className="container m-auto mb-1 flex h-16 items-center justify-between">
				<div className="flex items-center gap-2">
					{!isHoseManagementCustomer && (
						<div className="relative hidden md:flex">
							<div className="h-[50px] w-[max-content] overflow-hidden rounded-r-lg border border-gray-300 bg-white">
								<form
									onSubmit={handleSearch}
									className="flex items-center">
									<div
										className="relative min-w-[400px] flex-1"
										ref={isModalIdOpen ? null : searchRef}>
										<Input
											type="search"
											placeholder={
												isInputFocused
													? t("Common.searchProducts")
													: urlQueryForDisplay || t("Common.searchProducts")
											}
											className="h-[50px] !rounded-none !border-0 !border-none bg-transparent px-4 text-[#5A615D] focus-visible:ring-0 focus-visible:ring-offset-0"
											value={searchQuery}
											ref={inputRef}
											onChange={(e) => {
												isUserEditingRef.current = true;
												setSearchQuery(e.target.value);
											}}
											onFocus={() => {
												setIsInputFocused(true);
												isUserEditingRef.current = true;
												if (
													urlQueryForDisplay &&
													searchQuery === urlQueryForDisplay
												) {
													setSearchQuery("");
												}
											}}
											onBlur={() => {
												setIsInputFocused(false);
												setTimeout(() => {
													isUserEditingRef.current = false;
												}, 200);
											}}
										/>
										{searchQuery && (
											<div className="animate-in fade-in-0 zoom-in-95 fixed top-34 left-1/2 z-[11] grid max-h-[80vh] w-[80vw] -translate-x-1/2 grid-cols-3 gap-4 overflow-y-auto bg-white p-4 shadow-lg duration-200">
												<div className="col-span-1 space-y-4 pr-4">
													<SearchAside
														suggestions={
															(searchData?.suggestions ??
																[]) as unknown as string[]
														}
														categories={searchCategories}
														query={searchQuery}
														onPick={handlePick}
													/>
												</div>
												<div className="col-span-2">
													<div className="mb-3 flex items-center justify-between">
														<h3 className="text-lg font-semibold">
															{t("Search.resultsTitle", {
																default: "Dine treff",
															})}
														</h3>
													</div>

													{isSearchLoading ? (
														<div className="flex items-center justify-center py-8">
															<div className="h-6 w-6 animate-spin rounded-full border-b-2 border-green-600"></div>
														</div>
													) : searchData?.productRes?.length ? (
														searchData.productRes.map(
															(product: IProductSearch) => {
																return (
																	<ProductItem
																		key={product.productNumber}
																		product={product}
																		currentLocale={currentLocale}
																		setSearchQuery={setSearchQuery}
																		isModalIdOpen={isModalIdOpen}
																		setIsModalIdOpen={setIsModalIdOpen}
																		getProductVariations={getProductVariations}
																		setVariations={setVariations}
																		variations={variations}
																		searchQuery={searchQuery}
																	/>
																);
															},
														)
													) : searchData ? (
														<NoResults query={searchQuery} />
													) : (
														<div className="flex items-center justify-center py-8">
															<span className="text-gray-500">
																Skriv for å søke...
															</span>
														</div>
													)}
												</div>
											</div>
										)}
									</div>
									<div className="max-w-[175px] border-l border-gray-300">
										<div className="flex h-[50px] w-full max-w-[175px] min-w-[175px] items-center gap-2 bg-gray-100 px-4">
											<BookOpen className="h-5 w-5 flex-shrink-0 text-[#003D1A]" />
											<span className="truncate text-sm font-medium text-[#0F1912]">
												TESS katalog
											</span>
										</div>
									</div>
									<Button
										type="submit"
										variant="greenSolid"
										className="h-[50px] rounded-l-none rounded-r-lg border-0 px-5">
										<Search className="h-5 w-5 text-white" />
									</Button>
								</form>
							</div>
						</div>
					)}
				</div>
				<div className="flex items-center">
					{profile && (
						<Button
							variant="ghost"
							className="relative hover:bg-transparent"
							onClick={() => router.push("/cart")}>
							<div className="relative mr-2 flex items-center">
								<ShoppingCart className="h-5 w-5" />
								<Badge className="absolute -top-2.5 -right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#005522] p-0 text-xs">
									{(cartItems?.cart?.length || 0) +
										(cartItems?.cartKit?.length || 0)}
								</Badge>
							</div>
							{(cartItems?.cart?.length || 0) +
								(cartItems?.cartKit?.length || 0) >
							0 ? (
								<PriceDisplay amount={sumAfterDiscount} />
							) : (
								""
							)}
							<span className="sr-only">Cart</span>
						</Button>
					)}
					{profile ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="gap-1 px-0 font-medium text-[#1A211C] hover:bg-transparent">
									<UserIcon />
									{profile.firstName ?? "Profile"}
									<ChevronDown className="ml-1 h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align="end"
								className="rounded-b-lg">
								<div className="px-2 py-3">
									<div className="text-[14px] font-medium">
										{profile.firstName}
									</div>
									<div className="text-[14px]">{profile.email}</div>
								</div>
								{!isHoseManagementCustomer && (
									<>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											className="text-gray-700"
											onClick={() => router.push("/profile")}>
											Gå til din side
										</DropdownMenuItem>
										<DropdownMenuItem className="text-gray-700">
											Endre innstillinger
										</DropdownMenuItem>
										<CustomerNumberSwitcher profile={profile} />
										{(hasHoseManagementAccess || hasTessEdiAccess) && (
											<>
												<DropdownMenuSeparator />
												<DropdownMenuLabel className="text-sm font-semibold text-gray-700">
													Tjenester
												</DropdownMenuLabel>
												{hasHoseManagementAccess && (
													<DropdownMenuItem
														className="text-gray-700"
														onClick={() =>
															router.push("/profile?tab=hose-orders")
														}>
														Hose management
													</DropdownMenuItem>
												)}
												{hasTessEdiAccess && (
													<DropdownMenuItem
														className="text-gray-700"
														onClick={() =>
															router.push("/profile?tab=tess-edi")
														}>
														TESS EDI
													</DropdownMenuItem>
												)}
												<DropdownMenuSeparator />
											</>
										)}
										<DropdownMenuItem
											onClick={handleLogout}
											className="text-red-700">
											<LogOut className="mr-2 h-4 w-4 text-red-700" />
											Logg ut
										</DropdownMenuItem>
									</>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<div className="flex items-center gap-4 rounded-md bg-[#F0FCF2] px-3 py-1.5">
							<div className="flex items-center gap-2">
								<MessageSquareText className="h-4 w-4 text-[#003D1A]" />
								<span className="text-sm font-medium text-[#003D1A]">
									Du er besøkende
								</span>
							</div>
							<Button
								variant="outlineGrey"
								onClick={() => setIsAuthOpen(true)}>
								<User className="h-4 w-4" />
								<span className="text-sm">Logg inn</span>
							</Button>
						</div>
					)}

					<Sheet
						open={isSearchOpen}
						onOpenChange={setIsSearchOpen}>
						<SheetTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="md:hidden">
								<Search className="h-5 w-5" />
								<span className="sr-only">Search</span>
							</Button>
						</SheetTrigger>
						<SheetContent
							side="top"
							className="h-auto">
							<form
								onSubmit={handleSearch}
								className="pt-6">
								<div className="relative">
									<Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
									<Input
										type="search"
										placeholder={
											isInputFocused
												? t("Common.searchProducts")
												: urlQueryForDisplay || t("Common.searchProducts")
										}
										className="bg-background w-full pl-8"
										value={searchQuery}
										onChange={(e) => {
											isUserEditingRef.current = true;
											setSearchQuery(e.target.value);
										}}
										onFocus={() => {
											setIsInputFocused(true);
											isUserEditingRef.current = true;
											if (
												urlQueryForDisplay &&
												searchQuery === urlQueryForDisplay
											) {
												setSearchQuery("");
											}
										}}
										onBlur={() => {
											setIsInputFocused(false);
											setTimeout(() => {
												isUserEditingRef.current = false;
											}, 200);
										}}
										autoFocus
									/>
								</div>
							</form>
						</SheetContent>
					</Sheet>
				</div>
			</div>

			{!isHoseManagementCustomer && !fromAlleKategorier && (
				<div className="border-t">
					<div className="m-auto flex h-12 w-full items-center justify-between gap-4">
						<CategoryNavigationMenu
							categories={categories ?? []}
							loading={loading}
							selectedAssortment={profile?.defaultAssortmentNumber ?? ""}
						/>
					</div>
				</div>
			)}

			<AuthDialog
				isOpen={isAuthOpen}
				onOpenChange={setIsAuthOpen}
			/>
			<FeedbackDialog
				open={isFeedbackDialogOpen}
				onOpenChange={setIsFeedbackDialogOpen}
			/>
		</header>
	);
}
