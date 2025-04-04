import React, { useEffect, useState } from "react";

import { useRouter } from "@/i18n/navigation";
import Image from "next/image";

import { loadItem } from "../services/product.service";
import { IProductSearch, ISuggestions } from "../types/search.types";

const SearchBarComponent: React.FC = () => {
	const [products, setProducts] = useState<IProductSearch[]>([]);
	const [suggestions, setSuggestions] = useState<ISuggestions[]>([]);
	const [query, setQuery] = useState<string>("");
	const [isExpanded, setIsExpanded] = useState(false);
	const router = useRouter();
	const [products, setProducts] = useState<IProductSearch[]>([]);
	const [suggestions, setSuggestions] = useState<ISuggestions[]>([]);
	const [query, setQuery] = useState<string>("");
	const [isExpanded, setIsExpanded] = useState(false);
	const router = useRouter();

	useEffect(() => {
		if (query.length === 0) {
			setProducts([]);
			setSuggestions([]);
			return;
		}
	useEffect(() => {
		if (query.length === 0) {
			setProducts([]);
			setSuggestions([]);
			return;
		}

		const fetchData = async () => {
			try {
				const response = await loadItem(query);
				if (response !== false) {
					setProducts(response.productRes);
					setSuggestions(response.searchSuggestions);
					setIsExpanded(true);
				} else {
					setProducts([]);
					setSuggestions([]);
					setIsExpanded(false);
				}
			} catch (error) {
				console.error("Could not fetch results", error);
				setProducts([]);
				setSuggestions([]);
			}
		};
		const fetchData = async () => {
			try {
				const response = await loadItem(query);
				if (response !== false) {
					setProducts(response.productRes);
					setSuggestions(response.searchSuggestions);
					setIsExpanded(true);
				} else {
					setProducts([]);
					setSuggestions([]);
					setIsExpanded(false);
				}
			} catch (error) {
				console.error("Could not fetch results", error);
				setProducts([]);
				setSuggestions([]);
			}
		};

		fetchData();
	}, [query]);
		fetchData();
	}, [query]);

	return (
		<div className="relative w-full max-w-xl">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					router.push(`/searchList/${query || "Slanger"}`);
				}}
				className="w-full">
				<div className="flex w-full">
					<input
						type="search"
						placeholder="Søk etter produkter..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onFocus={() => setIsExpanded(true)}
						onBlur={() => setIsExpanded(false)}
						className="w-full rounded-l-md border border-gray-300 px-3 py-2 shadow-inner focus:ring-2 focus:ring-green-500 focus:outline-none"
					/>
					<button
						onMouseDown={(e) => e.preventDefault()}
						className="flex items-center rounded-r-md border-none bg-green-700 px-4 py-2 transition-colors hover:bg-green-200"
						onClick={() => router.push(`/searchList/${query || "Slanger"}`)}>
						<Image
							src="/icons/Vector.svg"
							className="text-white"
							alt="Søk"
							width={24}
							height={24}
						/>
					</button>
				</div>
			</form>
	return (
		<div className="relative w-full max-w-xl">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					router.push(`/searchList/${query || "Slanger"}`);
				}}
				className="w-full">
				<div className="flex w-full">
					<input
						type="search"
						placeholder="Søk etter produkter..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onFocus={() => setIsExpanded(true)}
						onBlur={() => setIsExpanded(false)}
						className="w-full rounded-l-md border border-gray-300 px-3 py-2 shadow-inner focus:ring-2 focus:ring-green-500 focus:outline-none"
					/>
					<button
						onMouseDown={(e) => e.preventDefault()}
						className="flex items-center rounded-r-md border-none bg-green-700 px-4 py-2 transition-colors hover:bg-green-200"
						onClick={() => router.push(`/searchList/${query || "Slanger"}`)}>
						<Image
							src="/icons/Vector.svg"
							className="text-white"
							alt="Søk"
							width={24}
							height={24}
						/>
					</button>
				</div>
			</form>

			{isExpanded && (
				<div className="absolute top-full left-0 z-10 mt-1 flex max-h-96 w-full overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg">
					<div className="flex-1 border-r border-gray-200 p-3">
						<div className="mb-2 text-center font-bold text-gray-700">
							Søkeforslag
						</div>
						{suggestions.length > 0 ? (
							<ul className="m-0 list-none p-0">
								{suggestions.map((s, index) => (
									<li
										key={index}
										className="border-b border-gray-200 py-2 text-center">
										<button
											onMouseDown={(e) => e.preventDefault()}
											onClick={() =>
												router.push(
													`/searchList/${encodeURIComponent(s.keyword)}`,
												)
											}
											className="w-full rounded-md border-none bg-transparent px-4 py-2 text-left text-green-700 transition-all hover:bg-gray-100 hover:shadow-md">
											{s.keyword}
										</button>
									</li>
								))}
							</ul>
						) : (
							<div className="py-4 text-center text-gray-500">
								Ingen forslag
							</div>
						)}
					</div>
			{isExpanded && (
				<div className="absolute top-full left-0 z-10 mt-1 flex max-h-96 w-full overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg">
					<div className="flex-1 border-r border-gray-200 p-3">
						<div className="mb-2 text-center font-bold text-gray-700">
							Søkeforslag
						</div>
						{suggestions.length > 0 ? (
							<ul className="m-0 list-none p-0">
								{suggestions.map((s, index) => (
									<li
										key={index}
										className="border-b border-gray-200 py-2 text-center">
										<button
											onMouseDown={(e) => e.preventDefault()}
											onClick={() =>
												router.push(
													`/searchList/${encodeURIComponent(s.keyword)}`,
												)
											}
											className="w-full rounded-md border-none bg-transparent px-4 py-2 text-left text-green-700 transition-all hover:bg-gray-100 hover:shadow-md">
											{s.keyword}
										</button>
									</li>
								))}
							</ul>
						) : (
							<div className="py-4 text-center text-gray-500">
								Ingen forslag
							</div>
						)}
					</div>

					<div className="flex-2 p-3">
						{products.length > 0 ? (
							products.map((item, key) => (
								<a
									onMouseDown={(e) => e.preventDefault()}
									key={key}
									href={`/product/${item.product_number}`}
									className="flex items-center justify-between rounded-md border-b border-gray-200 py-3 text-gray-800 transition-all hover:bg-gray-50 hover:shadow-md">
									<div className="flex flex-col">
										<span>{item.product_name}</span>
										<small className="text-gray-500 italic">
											{item.product_number}
										</small>
									</div>
									<Image
										src={item.media}
										alt={item.product_name}
										width={128}
										height={128}
										className="ml-3 object-contain"
									/>
								</a>
							))
						) : (
							<div className="py-4 text-center text-gray-500">
								Ingen produkter funnet
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
					<div className="flex-2 p-3">
						{products.length > 0 ? (
							products.map((item, key) => (
								<a
									onMouseDown={(e) => e.preventDefault()}
									key={key}
									href={`/product/${item.product_number}`}
									className="flex items-center justify-between rounded-md border-b border-gray-200 py-3 text-gray-800 transition-all hover:bg-gray-50 hover:shadow-md">
									<div className="flex flex-col">
										<span>{item.product_name}</span>
										<small className="text-gray-500 italic">
											{item.product_number}
										</small>
									</div>
									<Image
										src={item.media}
										alt={item.product_name}
										width={128}
										height={128}
										className="ml-3 object-contain"
									/>
								</a>
							))
						) : (
							<div className="py-4 text-center text-gray-500">
								Ingen produkter funnet
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default SearchBarComponent;
