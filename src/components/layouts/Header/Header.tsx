"use client";

import type React from "react";
import { useEffect, useState } from "react";

import CategoryNavigationMenu from "@/components/layouts/NavigationMenu/NavigationMenu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSearch } from "@/hooks/useProductSearch";
import { useRouter } from "@/i18n/navigation";
import { useStore } from "@/store/store";
import { Category } from "@/types/categories.types";
import { IProductSearch, ISuggestions } from "@/types/search.types";
import { Search, ShoppingCart, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export default function Header({ categories }: { categories: Category[] }) {
	const [searchQuery, setSearchQuery] = useState("");
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const currentLocale = useLocale();
	const { data, isLoading } = useSearch(searchQuery);
	const t = useTranslations();

	const router = useRouter();
	const { setCategories } = useStore();

	useEffect(() => {
		setCategories(categories);
	}, [categories, setCategories]);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setIsSearchOpen(false);
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
					className="hidden w-full max-w-lg px-4 md:flex">
					<div className="relative w-full">
						<Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
						<Input
							type="search"
							placeholder="Search products..."
							className={"bg-background w-[650px] border-green-600 pl-8"}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
						{searchQuery && data && (
							<div className="absolute top-full left-0 z-50 mt-2 grid max-h-[400px] w-[650px] grid-cols-2 gap-4 overflow-y-auto rounded-md bg-white p-4 shadow-lg">
								<div>
									<h4 className="mb-2 text-sm font-semibold">
										{t("search.suggestions")}
									</h4>
									{data.searchSuggestions?.length ? (
										data.searchSuggestions.map(
											(s: ISuggestions, idx: number) => (
												<Link
													key={idx}
													href={`/search?query=${encodeURIComponent(s.keyword)}`}
													className="block rounded-md p-2 text-sm hover:bg-gray-100">
													{s.keyword}
												</Link>
											),
										)
									) : (
										<p className="text-sm text-green-600">
											{t("search.noSuggestions")}
										</p>
									)}
								</div>

								<div>
									{data.productRes?.length ? (
										data.productRes.map((product: IProductSearch) => {
											console.log(product,"product")
											return (
											<Link
												key={product.product_number}
												href={`/product/product/${product.product_number}`}
												className="flex items-center gap-4 rounded-md p-3 hover:bg-gray-100">
												<div className="flex h-16 w-16 min-w-16 items-center justify-center overflow-hidden rounded-md">
													{product.media ? (
														<Image
															src={product.media}
															alt={product.product_name}
															width={64}
															height={64}
															className="max-h-16 max-w-16 object-contain"
														/>
													) : (
														<div className="h-10 w-10 rounded bg-gray-300" />
													)}
												</div>

												<div className="flex flex-col justify-center">
													<span className="text-base font-medium">
														{product.product_name}
													</span>
													<span className="text-muted-foreground text-sm">
														{product.product_number}
													</span>
												</div>
											</Link>
										)})
									) : (
										<p className="text-opacity-30 text-sm text-green-600">
											{t("search.noProductsFound")}
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
					<DropdownMenu>
						<DropdownMenuTrigger
							asChild
							className="hidden md:flex">
							<Button
								variant="ghost"
								size="icon">
								<User className="h-5 w-5" />
								<span className="sr-only">Account</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem asChild>
								<Link href="/account">My Account</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link href="/orders">Orders</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link href="/wishlist">Wishlist</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link href="/logout">Logout</Link>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<Button
						variant="ghost"
						size="icon"
						asChild
						className="relative">
						<Link href="/cart">
							<ShoppingCart className="h-5 w-5" />
							<Badge className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0">
								3
							</Badge>
							<span className="sr-only">Cart</span>
						</Link>
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
		</header>
	);
}
