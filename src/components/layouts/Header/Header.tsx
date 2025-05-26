"use client";

import type React from "react";
import { useEffect, useState } from "react";

import ProductVariantTable from "@/components/checkout/product-variant-table";
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
import { useSearch } from "@/hooks/useProductSearch";
import { useRouter } from "@/i18n/navigation";
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

export default function Header({ categories }: { categories: Category[] }) {
	const currentLocale = useLocale();
	const t = useTranslations();
	const router = useRouter();
	const { data: session, status } = useSession() as {
		data: any;
		status: "loading" | "authenticated" | "unauthenticated";
	};
	const [searchQuery, setSearchQuery] = useState("");
	// Reset variations when search query changes
	useEffect(() => {
		setVariations({});
		setIsModalIdOpen(null);
	}, [searchQuery]);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [isAuthOpen, setIsAuthOpen] = useState(false);
	const [isModalIdOpen, setIsModalIdOpen] = useState<string | null>(null);
	const [cart, setCart] = useState<CartLine[]>([]);
	const [variations, setVariations] = useState<Record<string, any>>({});

	const { data, isLoading } = useSearch(searchQuery);

	const searchRef = useClickOutside<HTMLDivElement>(() => {
		setSearchQuery("");
		setIsSearchOpen(false);
	});

	const fetchCart = async () => {
		const cart = await getCart();
		setCart(cart);
	};

	useEffect(() => {
		fetchCart();
	}, []);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setIsSearchOpen(false);
		setIsModalIdOpen(null);
	};

	const handleLanguageChange = (locale: string) => {
		router.replace("/", { locale });
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
							placeholder="Search products..."
							className={"bg-background w-[650px] border-green-600 pl-8"}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
						{searchQuery && data && (
							<div className="absolute top-full left-0 z-50 z-[999] mt-2 grid max-h-[400px] w-[650px] grid-cols-3 gap-4 overflow-y-auto rounded-md bg-white p-4 shadow-lg">
								<div className="col-span-1">
									<h4 className="mb-2 text-sm font-semibold">
										{t("Search.suggestions")}
									</h4>
									{data.searchSuggestions?.length ? (
										data.searchSuggestions.map(
											(s: ISuggestions, idx: number) => (
												<Link
													key={idx}
													href={`/search?query=${encodeURIComponent(s.keyword)}`}
													className="block rounded-md p-2 text-sm hover:bg-gray-100"
													onClick={() => {
														setSearchQuery("");
														setIsSearchOpen(false);
														setIsModalIdOpen(null);
													}}>
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
										data.productRes.map((product: IProductSearch) => (
											<div key={product.productNumber}>
												<div className="flex w-full items-center justify-between gap-4 rounded-md p-3 hover:bg-gray-100">
													<Link
														className="flex flex-[0.8] items-center justify-between gap-4"
														href={`/product/product/${product.productNumber}`}
														onClick={() => setSearchQuery("")}>
														<div className="flex flex-col justify-center">
															<span className="text-base font-medium">
																{product.productName}
															</span>
															<span className="text-muted-foreground text-sm">
																{product.productNumber}
															</span>
														</div>
													</Link>
													<div className="flex items-center gap-6">
														<Button
															variant="outline"
															size="sm"
															onClick={async (e) => {
																e.preventDefault();
																setIsModalIdOpen(product.productNumber);
																const productVariations =
																	await getProductVariations(
																		product.productNumber,
																		"L01",
																		"01",
																	);
																console.log(
																	productVariations,
																	"productVariations",
																);
																setVariations((prev) => ({
																	...prev,
																	[product.productNumber]: productVariations,
																}));
															}}>
															<ShoppingCartIcon className="h-2 w-2" />
														</Button>
														<div className="flex h-16 w-16 min-w-16 items-center justify-center overflow-hidden rounded-md">
															{product.media ? (
																<Image
																	src={product.media}
																	alt={product.productName}
																	width={64}
																	height={64}
																	className="max-h-16 max-w-16 object-contain"
																/>
															) : (
																<div className="h-32 w-32 rounded bg-gray-300" />
															)}
														</div>
													</div>
												</div>
												<Modal
													open={isModalIdOpen === product.productNumber}
													onOpenChange={(open) => {
														if (!open) {
															setIsModalIdOpen(null);
															setVariations((prev) => ({
																...prev,
																[product.productNumber]: [],
															}));
														}
													}}>
													<ModalContent className="sm:max-w-[900px]">
														<ModalHeader>
															<ModalTitle>
																Product Variants - {product.productName}
															</ModalTitle>
														</ModalHeader>
														<div className="max-h-[70vh] overflow-y-auto px-1">
															<ProductVariantTable
																variants={variations[product.productNumber]}
																productNumber={product.productNumber}
															/>
														</div>
													</ModalContent>
												</Modal>
											</div>
										))
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
									onClick={() => signOut()}
									className="text-green-600">
									Log out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<Button
							variant="ghost"
							size="icon"
							onClick={() => {
								router.replace("?auth=login", { scroll: false });
								setIsAuthOpen(true);
							}}>
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
							{cart?.length}
						</Badge>
						<span className="sr-only">Cart</span>
					</Button>
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
										placeholder="Search products..."
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
