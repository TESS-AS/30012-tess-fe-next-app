"use client";

import type React from "react";
import { useEffect, useState } from "react";

import CustomerNumberSwitcher from "@/components/customer-profile/customer-number-switcher";
import CategoryNavigationMenu from "@/components/layouts/NavigationMenu/NavigationMenu";
import { ProductItem } from "@/components/products/product-item-search";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AuthDialog from "@/components/ui/dialogs/auth-dialog";
import { FeedbackDialog } from "@/components/ui/dialogs/feedback-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import { useSearch } from "@/hooks/useProductSearch";
import { usePunchoutProfile } from "@/hooks/usePunchoutProfile";
import { useRouter } from "@/i18n/navigation";
import { useAppContext } from "@/lib/appContext";
import axiosClient from "@/services/axiosClient";
import { loadCategoryTree } from "@/services/categories.service";
import { getProductVariations } from "@/services/product.service";
import { Category } from "@/types/categories.types";
import { IProductSearch, ISuggestions } from "@/types/search.types";
import { ProfileUser } from "@/types/user.types";
import {
	Building,
	ChevronDown,
	Hotel,
	MessageSquareText,
	Search,
	ShoppingCart,
	User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";

export default function Header({ categories }: { categories: Category[] }) {
	const currentLocale = useLocale();
	const t = useTranslations();
	const router = useRouter();

	const [searchQuery, setSearchQuery] = useState("");
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [isAuthOpen, setIsAuthOpen] = useState(false);
	const [isModalIdOpen, setIsModalIdOpen] = useState<string | null>(null);
	const [variations, setVariations] = useState<Record<string, any>>({});
	const { data, attributeResults, isLoading } = useSearch(searchQuery);
	const { cartItems, totalPrice } = useAppContext();
	const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);

	const [profile, setProfile] = useState<ProfileUser | null>(null);
	const [, setIsLoading] = useState(true);

	const { data: ssoProfile, isLoading: isSSOLoading } = useGetProfileData();
	const { data: punchoutProfile, isLoading: isPunchoutLoading } =
		usePunchoutProfile();

	useEffect(() => {
		if (punchoutProfile?.punchout === true) {
			setProfile(punchoutProfile);
			setIsLoading(isPunchoutLoading);
		} else if (ssoProfile) {
			setProfile(ssoProfile);
			setIsLoading(isSSOLoading);
		}
	}, [ssoProfile, punchoutProfile, isSSOLoading, isPunchoutLoading]);

	const searchRef = useClickOutside<HTMLDivElement>(() => {
		setSearchQuery("");
		setIsSearchOpen(false);
	});

	useEffect(() => {
		setVariations({});
		setIsModalIdOpen(null);
	}, [searchQuery]);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
		}
		setIsSearchOpen(false);
		setSearchQuery("");
	};

	const handleLanguageChange = (locale: string) => {
		router.replace("/", { locale });
	};

	const handleLogout = async () => {
		try {
			await axiosClient.post("/logout");
		} catch (error) {
			console.error("Logout API failed", error);
		}
		await signOut();
	};

	return (
		<header className="bg-background h-[182px] w-full border-t">
			<div className="container m-auto flex h-16 items-center justify-between">
				<div className="flex items-center gap-6">
					<Button
						variant="ghost"
						className="mb-2 rounded-none border-b border-[#013d1a] px-0 pb-0 text-sm font-medium hover:bg-transparent">
						E-handel{" "}
						<Badge className="-mb-1.5 rounded-[6px_6px_0_6px] bg-[#003D1A] text-xs text-white">
							Beta
						</Badge>
					</Button>
					<Button
						variant="ghost"
						className="px-0 text-sm font-medium hover:bg-transparent">
						THM KundeWEB
					</Button>
				</div>
				{profile && <div className="flex items-center gap-2 rounded-md bg-[#FDFDEA] px-3 py-1.5">
					<Button
						variant="ghost"
						className="text-sm font-medium text-[#003D1A] hover:bg-transparent">
						<MessageSquareText className="h-4 w-4" /> Vær med på utviklingen
					</Button>
					<Button
						variant="darkGreen"
						className="text-xs"
						onClick={() => setIsFeedbackDialogOpen(true)}>
						Gi tilbakemelding
					</Button>
				</div>}
			</div>
			<div className="container m-auto mb-1 flex h-16 items-center justify-between">
				<div className="flex items-center gap-2">
					<Link
						href="/"
						className="flex items-center gap-2">
						<Image
							src="/icons/TESSLogo.svg"
							alt="Logo"
							width={144}
							height={144}
						/>
					</Link>
					<form
						onSubmit={handleSearch}
						className="hidden h-[50px] w-[537px] px-4 md:flex">
						<div
							className="relative w-[537px]"
							ref={isModalIdOpen ? null : searchRef}>
							<Search className="text-muted-foreground absolute top-4.5 left-2.5 h-4 w-4" />
							<Input
								type="search"
								placeholder={t("Common.searchProducts")}
								className="bg-background color-[#5A615D] h-[50px] w-[537px] border-[#001E00] pl-8"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
							<Button
								variant="default"
								className="absolute top-[7px] right-[7px] text-xs font-medium">
								Søk
							</Button>
							{searchQuery && data && (
								<div className="fixed top-33 left-1/2 z-[11] grid max-h-[80vh] w-[80vw] -translate-x-1/2 grid-cols-3 gap-4 overflow-y-auto border-t bg-white p-4 shadow-lg">
									<div className="col-span-1 border-r border-gray-200 pr-4">
										<h4 className="mb-2 text-sm font-semibold">
											{t("Search.suggestions")}
										</h4>
										{data.searchSuggestions?.length ? (
											data.searchSuggestions.map(
												(s: ISuggestions, idx: number) => (
													<Link
														key={idx}
														href={`/search?query=${encodeURIComponent(s.keyword)}`}
														onClick={() => {
															setSearchQuery("");
															setIsSearchOpen(false);
														}}
														className="block rounded-md p-2 text-sm hover:bg-gray-100">
														{s.keyword}
													</Link>
												),
											)
										) : (
											<p className="text-sm text-green-600">
												{t("Search.noSuggestions")}
											</p>
										)}
									</div>

									<div className="col-span-2">
										{data.productRes?.length ? (
											data.productRes.map((product: IProductSearch) => {
												const attr = attributeResults.find(
													(r) => r.productNumber === product.productNumber,
												);
												return (
													<ProductItem
														key={product.productNumber}
														product={product}
														attr={attr}
														currentLocale={currentLocale}
														loadCategoryTree={loadCategoryTree}
														setSearchQuery={setSearchQuery}
														isModalIdOpen={isModalIdOpen}
														setIsModalIdOpen={setIsModalIdOpen}
														getProductVariations={getProductVariations}
														setVariations={setVariations}
														variations={variations}
													/>
												);
											})
										) : (
											<p className="text-opacity-30 text-sm text-green-600">
												{t("Search.noProductsFound")}
											</p>
										)}
									</div>
								</div>
							)}
						</div>
					</form>
				</div>
				<div className="flex items-center">
					{profile && <CustomerNumberSwitcher profile={profile} />}
					<Button
						variant="ghost"
						className="relative hover:bg-transparent"
						onClick={() => router.push("/cart")}>
						<div className="relative mr-2 flex items-center">
							<ShoppingCart className="h-5 w-5" />
							<Badge className="absolute -top-2.5 -right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#005522] p-0 text-xs">
								{cartItems?.length}
							</Badge>
						</div>
						{cartItems?.length > 0 ? `${totalPrice.toFixed(2)},-` : ""}
						<span className="sr-only">Cart</span>
					</Button>
					{profile ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="gap-1 px-0 font-medium text-[#1A211C] hover:bg-transparent">
									<Building />
									{profile.firstName ?? "Profile"}
									<ChevronDown className="ml-1 h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<div className="flex items-center gap-3 px-3 py-2">
									<Avatar className="h-9 w-9">
										<AvatarImage alt={profile.firstName ?? "User"} />
										<AvatarFallback>
											{profile.firstName
												?.split(" ")
												.map((n: string) => n[0])
												.join("")}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 overflow-hidden">
										<div className="leading-none font-medium">
											{profile.firstName}
										</div>
										<div className="text-muted-foreground max-w-[160px] truncate text-sm">
											{profile.email}
										</div>
									</div>
								</div>
								<DropdownMenuItem onClick={() => router.push("/profile")}>
									My Profile
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => router.push("/wishlist")}>
									Wishlist
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={handleLogout}
									className="text-green-600">
									Log out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<Button
							variant="ghost"
							className="hover:bg-transparent"
							onClick={() => setIsAuthOpen(true)}>
							<User className="h-5 w-5" />
						</Button>
					)}

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								className="hidden hover:bg-transparent md:flex">
								<div className="flex items-center gap-1">
									<Image
										src={`/icons/${currentLocale === "en" ? "en" : "Flagg"}.svg`}
										alt="Language"
										width={22}
										height={22}
									/>
									<ChevronDown className="h-4 w-4" />
								</div>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => handleLanguageChange("en")}>
								<div className="flex items-center gap-2">
									<Image
										src="/icons/en.svg"
										alt="English"
										width={22}
										height={22}
									/>
									English
								</div>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => handleLanguageChange("no")}>
								<div className="flex items-center gap-2">
									<Image
										src="/icons/Flagg.svg"
										alt="Norwegian"
										width={22}
										height={22}
									/>
									Norsk
								</div>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
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
										placeholder={t("Common.searchProducts")}
										className="bg-background w-full pl-8"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										autoFocus
									/>
								</div>
							</form>
						</SheetContent>
					</Sheet>
				</div>
			</div>

			<div className="border-t">
				<div className="container m-auto flex h-12 w-full items-center justify-between gap-4">
					<CategoryNavigationMenu categories={categories} />
				</div>
			</div>

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
