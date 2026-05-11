"use client";

import React, { useRef } from "react";
import { useEffect, useState, useMemo } from "react";

import CustomerNumberSwitcher from "@/components/customer-profile/customer-number-switcher";
import { NoResults } from "@/components/empty-search-result";
import { MobileMenu } from "@/components/layouts/Header/MobileMenu";
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
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER } from "@/constants/checkout";
import { useProfile } from "@/contexts/ProfileContext";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useGetAssortments } from "@/hooks/useGetAssortments";
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
	ArrowLeft,
	BookOpen,
	ChevronDown,
	ChevronRight,
	ChevronUp,
	FileText,
	LogOut,
	Menu,
	MessageSquareText,
	X,
	Plus,
	PlusIcon,
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

	const headerRef = useRef<HTMLElement>(null);
	const topBarRef = useRef<HTMLDivElement>(null);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);

	useEffect(() => {
		setIsMobileMenuOpen(false);
		setIsMobileProfileOpen(false);
	}, [pathname]);
	const [isModalIdOpen, setIsModalIdOpen] = useState<string | null>(null);
	const [variations, setVariations] = useState<Record<string, any>>({});
	const { sumAfterDiscount } = useOrderSummary();
	const { cartItems, isAuthOpen, setIsAuthOpen } = useAppContext();

	const missingDefaultVariables = useMemo(() => {
		if (!profile) return false;
		return (
			!profile.defaultWarehouseNumber ||
			!profile.defaultCompanyNumber ||
			!profile.defaultCustomerNumber ||
			!profile.defaultAssortmentNumber
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
	const [selectedAssortment, setSelectedAssortment] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [isAssortmentDropdownOpen, setIsAssortmentDropdownOpen] =
		useState(false);

	const { assortments } = useGetAssortments(!!profile);

	useEffect(() => {
		if (
			assortments.length &&
			!selectedAssortment &&
			profile?.defaultAssortmentNumber
		) {
			const match = assortments.find(
				(a: any) => a.assortmentnumber === profile.defaultAssortmentNumber,
			);
			if (match) {
				setSelectedAssortment(match.assortmentnumber);
			}
		}
	}, [assortments, selectedAssortment, profile]);

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
			if (firstProduct?.redirect) {
				justNavigatedRef.current = true;
				let redirectPath = firstProduct.redirect.trim();

				if (!redirectPath.startsWith("/")) {
					redirectPath = `/${redirectPath}`;
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

	const handleAssortmentChange = async (assortmentNumber: string) => {
		if (!profile || isSaving) return;

		setIsSaving(true);
		try {
			await axiosClient.post("/user/defaultVariables", {
				companyNumber: profile.defaultCompanyNumber,
				customerNumber: profile.defaultCustomerNumber,
				warehouseNumber: profile.defaultWarehouseNumber,
				assortmentNumber: assortmentNumber,
			});
			setSelectedAssortment(assortmentNumber);

			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: ["productPrice"],
					refetchType: "active",
				}),
				queryClient.invalidateQueries({
					queryKey: ["product"],
					refetchType: "active",
				}),
				queryClient.invalidateQueries({
					queryKey: ["products"],
					refetchType: "active",
				}),
				refetchCategories(),
			]);

			setIsAssortmentDropdownOpen(false);
		} catch (err) {
			console.error("Failed to update default assortment", err);
		} finally {
			setIsSaving(false);
		}
	};

	const getSelectedAssortmentName = () => {
		if (!selectedAssortment || !assortments.length) return "";
		const match = assortments.find(
			(a: any) => a.assortmentnumber === selectedAssortment,
		);
		return match?.nameNo || "";
	};

	const assortmentDropdownRef = useRef<HTMLDivElement>(null);
	const mobileAssortmentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node;
			const isOutsideDesktop =
				assortmentDropdownRef.current &&
				!assortmentDropdownRef.current.contains(target);
			const isOutsideMobile =
				!mobileAssortmentRef.current ||
				!mobileAssortmentRef.current.contains(target);
			if (isOutsideDesktop && isOutsideMobile) {
				setIsAssortmentDropdownOpen(false);
			}
		};

		if (isAssortmentDropdownOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isAssortmentDropdownOpen]);

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
			ref={headerRef}
			className={`bg-background relative z-50 flex w-full flex-col border-t ${isHoseManagementCustomer ? "max-h-[80px] flex-row" : "lg:h-[130px] lg:justify-end"}`}>
			<div
				ref={topBarRef}
				className="flex h-16 w-full items-center justify-between border-b border-[#c1c4c2] px-4 lg:container lg:mx-auto lg:border-b-0 lg:px-0">
				<div className="flex items-center lg:-ml-2">
					<div className="flex items-center gap-4">
						<Link
							href="/"
							className="flex items-center gap-4">
							<Image
								src="/icons/TESSLogo.svg"
								alt="Logo"
								width={144}
								height={144}
								className="h-auto w-[96px] lg:w-[144px]"
								loading="eager"
							/>
						</Link>
						<div className="flex items-center gap-8">
							{profile && missingDefaultVariables && (
								<CustomerNumberSwitcher
									profile={profile}
									forceOpen
									blockUntilComplete
									hideTrigger
								/>
							)}
							{isHoseManagementCustomer && (
								<span className="text-md font-normal text-[#0F1912]">
									Hose management
								</span>
							)}
						</div>
					</div>
					<div className="flex items-center gap-2">
						{!isHoseManagementCustomer && (
							<div
								className="relative hidden lg:flex"
								ref={assortmentDropdownRef}>
								<div className="h-[50px] w-[max-content] overflow-hidden rounded-r-lg border border-gray-300 bg-white">
									<form
										onSubmit={handleSearch}
										className="flex items-center">
										<div
											className="relative min-w-[350px] flex-1"
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
																			getProductVariations={
																				getProductVariations
																			}
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
										{profile && assortments.length > 0 && (
											<div className="max-w-[240px] border-l border-gray-300">
												<Button
													type="button"
													variant="ghost"
													className="flex h-[50px] w-full max-w-[240px] min-w-[240px] items-center justify-between gap-2 rounded-none bg-gray-100 px-4 text-[#0F1912]"
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														setIsAssortmentDropdownOpen(
															!isAssortmentDropdownOpen,
														);
													}}
													disabled={isSaving}>
													<BookOpen className="h-5 w-5 flex-shrink-0 text-[#003D1A]" />
													<span className="truncate text-sm font-medium">
														{getSelectedAssortmentName() ||
															t("CustomerSwitcher.selectAssortmentPlaceholder")}
													</span>
													{isAssortmentDropdownOpen ? (
														<ChevronUp className="h-4 w-4 flex-shrink-0" />
													) : (
														<ChevronDown className="h-4 w-4 flex-shrink-0" />
													)}
												</Button>
											</div>
										)}
										<Button
											type="submit"
											variant="greenSolid"
											className="h-[50px] rounded-l-none rounded-r-lg border-0 px-5">
											<Search className="h-5 w-5 text-white" />
										</Button>
									</form>
								</div>
								{profile &&
									assortments.length > 0 &&
									isAssortmentDropdownOpen && (
										<div className="absolute top-[50px] right-0 z-[9999] max-h-[260px] w-[300px] max-w-[400px] overflow-y-auto rounded-b-lg bg-white py-2 shadow-lg">
											<TooltipProvider>
												{assortments.map((a: any) => (
													<Tooltip key={a.assortmentnumber}>
														<TooltipTrigger asChild>
															<button
																type="button"
																onClick={(e) => {
																	e.preventDefault();
																	e.stopPropagation();
																	handleAssortmentChange(a.assortmentnumber);
																}}
																className="flex w-full items-center gap-2 px-4 py-2 text-left transition-colors hover:bg-gray-50">
																<div className="flex h-5 w-5 min-w-[20px] shrink-0 items-center justify-center">
																	{selectedAssortment === a.assortmentnumber ? (
																		<div className="h-4 w-4 rounded-full border-2 border-[#009640] bg-white" />
																	) : (
																		<div className="h-4 w-4 rounded-full border-2 border-gray-300" />
																	)}
																</div>
																<span className="text-sm font-medium break-words text-[#0F1912]">
																	{a.nameNo}
																	{/* ({a.assortmentnumber}) */}
																</span>
															</button>
														</TooltipTrigger>
														{a.assortmentname.length > 30 && (
															<TooltipContent
																side="right"
																className="max-w-[300px]">
																<p className="break-words">
																	{a.assortmentname}
																</p>
															</TooltipContent>
														)}
													</Tooltip>
												))}
											</TooltipProvider>
										</div>
									)}
							</div>
						)}
					</div>
				</div>
				<div className="flex items-center gap-2">
					{profile && (
						<Button
							variant="ghost"
							className="relative px-4 hover:bg-transparent"
							onClick={() => router.push("/cart")}>
							<div className="relative flex items-center">
								<ShoppingCart className="h-5 w-5" />
								<Badge className="absolute -top-2.5 -right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#005522] p-0 text-xs">
									{(cartItems?.cart?.length || 0) +
										(cartItems?.cartKit?.length || 0)}
								</Badge>
							</div>
							<span className="hidden md:inline">
								{(cartItems?.cart?.length || 0) +
									(cartItems?.cartKit?.length || 0) >
								0 ? (
									<PriceDisplay amount={sumAfterDiscount} />
								) : (
									""
								)}
							</span>
							<span className="sr-only">Cart</span>
						</Button>
					)}
					{profile ? (
						<>
							{/* Desktop profile dropdown */}
							<div className="hidden lg:block">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											className="gap-1 px-0 font-medium text-[#1A211C] hover:bg-transparent">
											{profile.logo &&
											profile.logo !== "missing url" &&
											/^(https?:)?\/\//.test(profile.logo) ? (
												<Image
													src={profile.logo}
													alt={profile.firstName ?? "Profile"}
													width={20}
													height={20}
													className="h-5 w-5 rounded-full object-contain"
													loading="eager"
												/>
											) : (
												<UserIcon />
											)}
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
												<DropdownMenuItem
													className="text-gray-700"
													onClick={() => router.push("/profile?tab=settings")}>
													Innstillinger
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
							</div>
							{/* Mobile profile trigger */}
							<button
								type="button"
								onClick={() => {
									setIsMobileProfileOpen(!isMobileProfileOpen);
									setIsMobileMenuOpen(false);
								}}
								className="flex items-center gap-1 py-2 pr-0 pl-4 lg:hidden">
								{profile.logo &&
								profile.logo !== "missing url" &&
								/^(https?:)?\/\//.test(profile.logo) ? (
									<Image
										src={profile.logo}
										alt={profile.firstName ?? "Profile"}
										width={16}
										height={16}
										className="h-4 w-4 rounded-full object-contain"
										loading="eager"
									/>
								) : (
									<UserIcon className="h-4 w-4" />
								)}
								<span className="max-w-[120px] truncate text-sm font-medium text-[#0F1912]">
									{profile.firstName ?? "Profile"}
								</span>
							</button>
						</>
					) : (
						<div className="flex items-center gap-4 rounded-md bg-[#F0FCF2] px-3 py-1.5">
							<div className="flex items-center gap-2">
								<MessageSquareText className="h-4 w-4 text-[#003D1A]" />
								<span className="text-sm font-medium text-[#003D1A]">
									Du er besøkende
								</span>
							</div>
							{/* show this button when Bli tess kunde is ready */}
							{/* {<Button
								variant="outlineGrey"
								onClick={() => setIsAuthOpen(true)}>
								<PlusIcon className="h-4 w-4" />
								<span className="text-sm">Bli ny TESS kunde</span>
							</Button>} */}
							<Button
								variant="outlineGrey"
								onClick={() => setIsAuthOpen(true)}>
								<User className="h-4 w-4" />
								<span className="text-sm">Logg inn</span>
							</Button>
						</div>
					)}
				</div>
			</div>

			{!isHoseManagementCustomer && !fromAlleKategorier && (
				<div className="hidden border-t lg:block">
					<div className="container mx-auto flex h-12 w-full items-center justify-between gap-4">
						<CategoryNavigationMenu
							categories={categories ?? []}
							loading={loading}
							selectedAssortment={selectedAssortment}
						/>
					</div>
				</div>
			)}

			{!isHoseManagementCustomer && (
				<div className="flex h-[45px] items-center justify-between border-b border-[#c1c4c2] lg:hidden">
					<button
						type="button"
						onClick={() => setIsSearchOpen(true)}
						className="flex h-[44px] items-center gap-2 px-4">
						<Search className="h-4 w-4 text-[#0F1912]" />
						<span className="hidden text-sm font-medium text-[#0F1912] md:inline">
							Søk
						</span>
					</button>
					<button
						type="button"
						onClick={() => {
							setIsMobileMenuOpen(!isMobileMenuOpen);
							setIsMobileProfileOpen(false);
						}}
						className="flex h-[44px] items-center gap-2 px-4">
						{isMobileMenuOpen ? (
							<>
								<X className="h-4 w-4 text-[#0F1912]" />
								<span className="text-sm font-medium text-[#0F1912]">Lukk</span>
							</>
						) : (
							<>
								<Menu className="h-4 w-4 text-[#0F1912]" />
								<span className="text-sm font-medium text-[#0F1912]">Meny</span>
							</>
						)}
					</button>
				</div>
			)}

			{isMobileMenuOpen && (
				<>
					<div
						className="fixed inset-x-0 bottom-0 z-40 cursor-pointer bg-[#0F1912]/25 lg:hidden"
						onClick={() => setIsMobileMenuOpen(false)}
						style={{
							top: headerRef.current
								? `${headerRef.current.getBoundingClientRect().bottom}px`
								: undefined,
						}}
					/>
					<div
						className="fixed inset-x-0 z-50 max-h-[80vh] min-h-[200px] overflow-y-auto bg-white lg:hidden"
						style={{
							top: headerRef.current
								? `${headerRef.current.getBoundingClientRect().bottom}px`
								: undefined,
						}}>
						<MobileMenu
							categories={categories ?? []}
							loading={loading}
							onClose={() => setIsMobileMenuOpen(false)}
						/>
					</div>
				</>
			)}

			{isMobileProfileOpen && profile && (
				<>
					<div
						className="fixed inset-x-0 bottom-0 z-40 cursor-pointer bg-[#0F1912]/25 lg:hidden"
						onClick={() => setIsMobileProfileOpen(false)}
						style={{
							top: topBarRef.current
								? `${topBarRef.current.getBoundingClientRect().bottom}px`
								: undefined,
						}}
					/>
					<div
						className="fixed inset-x-0 z-50 max-h-[80vh] overflow-y-auto bg-white lg:hidden"
						style={{
							top: topBarRef.current
								? `${topBarRef.current.getBoundingClientRect().bottom}px`
								: undefined,
						}}>
						{/* User info */}
						<div className="border-b border-[#c1c4c2] px-4 py-4">
							<div className="text-sm font-bold text-[#0F1912]">
								{profile.firstName}
							</div>
							<div className="text-sm text-[#2D3530]">{profile.email}</div>
						</div>
						{!isHoseManagementCustomer && (
							<nav className="bg-white">
								{/* E-handel section */}
								<div className="border-b border-[#c1c4c2] px-4 py-3 text-sm font-bold text-[#0F1912]">
									E-handel
								</div>
								<button
									type="button"
									onClick={() => {
										router.push("/profile");
										setIsMobileProfileOpen(false);
									}}
									className="flex min-h-[53px] w-full items-center justify-between px-4 text-left text-sm text-[#2D3530]">
									Min oversikt
									<ChevronRight className="h-4 w-4 shrink-0 text-[#2D3530]" />
								</button>
								<button
									type="button"
									onClick={() => {
										router.push("/profile?tab=settings");
										setIsMobileProfileOpen(false);
									}}
									className="flex min-h-[53px] w-full items-center justify-between px-4 text-left text-sm text-[#2D3530]">
									Innstillinger
									<ChevronRight className="h-4 w-4 shrink-0 text-[#2D3530]" />
								</button>
								<button
									type="button"
									onClick={() => {
										setIsMobileProfileOpen(false);
									}}
									className="flex min-h-[53px] w-full items-center justify-between px-4 text-left text-sm text-[#2D3530]">
									Velg kjøpsprofil
									<ChevronRight className="h-4 w-4 shrink-0 text-[#2D3530]" />
								</button>
								<button
									type="button"
									onClick={() => {
										setIsFeedbackDialogOpen(true);
										setIsMobileProfileOpen(false);
									}}
									className="flex min-h-[53px] w-full items-center justify-between px-4 text-left text-sm text-[#2D3530]">
									Gi tilbakemelding
									<ChevronRight className="h-4 w-4 shrink-0 text-[#2D3530]" />
								</button>

								{/* Verktøy section */}
								{(hasHoseManagementAccess || hasTessEdiAccess) && (
									<>
										<div className="border-t border-b border-[#c1c4c2] px-4 py-3 text-sm font-bold text-[#0F1912]">
											Verktøy
										</div>
										{hasHoseManagementAccess && (
											<button
												type="button"
												onClick={() => {
													router.push("/profile?tab=hose-orders");
													setIsMobileProfileOpen(false);
												}}
												className="flex min-h-[53px] w-full items-center justify-between px-4 text-left text-sm text-[#2D3530]">
												Hose management
												<ChevronRight className="h-4 w-4 shrink-0 text-[#2D3530]" />
											</button>
										)}
										{hasTessEdiAccess && (
											<button
												type="button"
												onClick={() => {
													router.push("/profile?tab=tess-edi");
													setIsMobileProfileOpen(false);
												}}
												className="flex min-h-[53px] w-full items-center justify-between px-4 text-left text-sm text-[#2D3530]">
												TESS EDI
												<ChevronRight className="h-4 w-4 shrink-0 text-[#2D3530]" />
											</button>
										)}
									</>
								)}

								{/* Logg ut */}
								<button
									type="button"
									onClick={() => {
										handleLogout();
										setIsMobileProfileOpen(false);
									}}
									className="flex min-h-[53px] w-full items-center justify-between border-t border-[#c1c4c2] px-4 text-left text-sm text-red-700">
									<span className="flex items-center gap-2">
										<LogOut className="h-4 w-4" />
										Logg ut
									</span>
									<ChevronRight className="h-4 w-4 shrink-0 text-red-700" />
								</button>
							</nav>
						)}
					</div>
				</>
			)}

			{isSearchOpen && (
				<div className="fixed inset-0 z-[60] flex flex-col bg-white lg:hidden">
					<form
						onSubmit={handleSearch}
						className="flex h-[52px] items-center gap-2 border-b border-[#c1c4c2]">
						<button
							type="button"
							onClick={() => {
								setIsSearchOpen(false);
								clearSearch();
							}}
							className="flex h-[52px] w-[52px] shrink-0 items-center justify-center bg-[#009640] transition-colors hover:bg-[#005522]">
							<ArrowLeft className="h-5 w-5 text-white" />
						</button>
						<Input
							type="search"
							placeholder="Hva leter du etter?"
							className="h-[52px] flex-1 border-0 bg-transparent px-2 text-sm text-[#0F1912] shadow-none focus-visible:ring-0"
							value={searchQuery}
							onChange={(e) => {
								isUserEditingRef.current = true;
								setSearchQuery(e.target.value);
							}}
							onFocus={() => {
								setIsInputFocused(true);
								isUserEditingRef.current = true;
								if (urlQueryForDisplay && searchQuery === urlQueryForDisplay) {
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
						<button
							type="button"
							onClick={() => {
								setIsSearchOpen(false);
								clearSearch();
							}}
							className="flex shrink-0 items-center gap-1 px-4 text-sm font-medium text-[#0F1912]">
							<X className="h-4 w-4" />
							Avbryt
						</button>
					</form>
					{profile && assortments.length > 0 && (
						<div ref={mobileAssortmentRef}>
							<button
								type="button"
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									setIsAssortmentDropdownOpen(!isAssortmentDropdownOpen);
								}}
								disabled={isSaving}
								className="flex h-[44px] w-full items-center justify-center gap-2 bg-[#E8EAE9] text-sm font-medium text-[#0F1912]">
								{getSelectedAssortmentName() ||
									t("CustomerSwitcher.selectAssortmentPlaceholder")}
								{isAssortmentDropdownOpen ? (
									<ChevronUp className="h-4 w-4" />
								) : (
									<ChevronDown className="h-4 w-4" />
								)}
							</button>
							{isAssortmentDropdownOpen && (
								<div className="bg-white">
									{assortments.map((a: any) => (
										<button
											key={a.assortmentnumber}
											type="button"
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												handleAssortmentChange(a.assortmentnumber);
											}}
											className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50">
											<div className="flex h-5 w-5 shrink-0 items-center justify-center">
												{selectedAssortment === a.assortmentnumber ? (
													<div className="h-5 w-5 rounded-full border-[6px] border-[#005522]" />
												) : (
													<div className="h-5 w-5 rounded-full border-2 border-gray-300" />
												)}
											</div>
											<span className="text-sm text-[#0F1912]">{a.nameNo}</span>
										</button>
									))}
								</div>
							)}
						</div>
					)}
					<div className="relative flex-1 overflow-y-auto">
						{isAssortmentDropdownOpen && (
							<div
								className="absolute inset-0 z-10 bg-[#8A8F8C]/60"
								onClick={() => setIsAssortmentDropdownOpen(false)}
							/>
						)}
						{searchQuery && searchData?.productRes?.length ? (
							<div className="p-4">
								{searchData.productRes.map((product: IProductSearch) => (
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
										onClose={() => setIsSearchOpen(false)}
									/>
								))}
							</div>
						) : searchQuery && searchData && !searchData.productRes?.length ? (
							<div className="p-4">
								<NoResults query={searchQuery} />
							</div>
						) : (
							<div className="flex flex-1 items-center justify-center py-20">
								<Search className="h-24 w-24 text-gray-200" />
							</div>
						)}
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
