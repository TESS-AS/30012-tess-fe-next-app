"use client";

import type React from "react";
import { useEffect, useState } from "react";

import ProductVariantTable from "@/components/checkout/product-variant-table";
import CustomerNumberSwitcher from "@/components/customer-profile/customer-number-switcher";
import CategoryNavigationMenu from "@/components/layouts/NavigationMenu/NavigationMenu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AuthDialog from "@/components/ui/dialogs/auth-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalTitle,
} from "@/components/ui/modal";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import { useSearch } from "@/hooks/useProductSearch";
import { useRouter } from "@/i18n/navigation";
import { useAppContext } from "@/lib/appContext";
import axiosClient from "@/services/axiosClient";
import { getCart } from "@/services/carts.service";
import { getProductVariations } from "@/services/product.service";
import { CartLine } from "@/types/carts.types";
import { Category } from "@/types/categories.types";
import { IProductSearch, ISuggestions } from "@/types/search.types";
import { Search, ShoppingCart, ShoppingCartIcon, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { loadCategoryTree } from "@/services/categories.service";
import { ProductItem } from "@/components/products/product-item-search";

export default function Header({ categories }: { categories: Category[] }) {
	const currentLocale = useLocale();
	const t = useTranslations();
	const router = useRouter();
	const { data: session, status } = useSession() as {
		data: any;
		status: "loading" | "authenticated" | "unauthenticated";
	};
	const { data: profile, isLoading: isProfileLoading } = useGetProfileData();
	const [searchQuery, setSearchQuery] = useState("");
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [isAuthOpen, setIsAuthOpen] = useState(false);
	const [isModalIdOpen, setIsModalIdOpen] = useState<string | null>(null);
	const [variations, setVariations] = useState<Record<string, any>>({});
	const { data, attributeResults, isLoading } = useSearch(searchQuery);
	const { cartItems } = useAppContext();

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
		<header className="bg-background w-full border-b">
			<div className="container m-auto flex h-16 items-center justify-between">
				<Link
					href="/"
					className="flex items-center gap-2">
					<Image
						src="/icons/TESSLogo.svg"
						alt="Logo"
						width={120}
						height={120}
					/>
				</Link>
				<form
					onSubmit={handleSearch}
					className="hidden w-[650px] px-4 md:flex">
					<div
						className="relative w-full"
						ref={isModalIdOpen ? null : searchRef}>
						<Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
						<Input
							type="search"
							placeholder={t("Common.searchProducts")}
							className="bg-background w-[650px] border-green-600 pl-8"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
						{searchQuery && data && (
							<div className="fixed top-16 left-1/2 z-[11] grid max-h-[80vh] w-[80vw] -translate-x-1/2 grid-cols-3 gap-4 overflow-y-auto border-t bg-white p-4 shadow-lg">
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
											  (r) => r.productNumber === product.productNumber
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

				<div className="flex items-center gap-2">
					{profile && <CustomerNumberSwitcher profile={profile} />}
					{status === "authenticated" && session?.user ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="px-3 font-medium">
									{session.user.name?.split(" ")[0] ?? "Profile"}
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<div className="flex items-center gap-3 px-3 py-2">
									<Avatar className="h-9 w-9">
										<AvatarImage
											src={session.user.image ?? ""}
											alt={session.user.name ?? "User"}
										/>
										<AvatarFallback>
											{session.user.name
												?.split(" ")
												.map((n: string) => n[0])
												.join("")}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 overflow-hidden">
										<div className="leading-none font-medium">
											{session.user.name}
										</div>
										<div className="text-muted-foreground max-w-[160px] truncate text-sm">
											{session.user.email}
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
							size="icon"
							onClick={() => setIsAuthOpen(true)}>
							<User className="h-5 w-5" />
						</Button>
					)}

					<Button
						variant="ghost"
						size="icon"
						className="relative"
						onClick={() => router.push("/cart")}>
						<ShoppingCart className="h-5 w-5" />
						<Badge className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0">
							{cartItems?.length}
						</Badge>
						<span className="sr-only">Cart</span>
					</Button>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="hidden md:flex">
								<Image
									src={`/icons/${currentLocale === "en" ? "en" : "no"}.svg`}
									alt="Language"
									width={20}
									height={20}
								/>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => handleLanguageChange("en")}>
								<div className="flex items-center gap-2">
									<Image
										src="/icons/en.svg"
										alt="English"
										width={20}
										height={20}
									/>
									English
								</div>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => handleLanguageChange("no")}>
								<div className="flex items-center gap-2">
									<Image
										src="/icons/no.svg"
										alt="Norwegian"
										width={20}
										height={20}
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
		</header>
	);
}
