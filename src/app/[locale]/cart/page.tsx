"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Minus, Plus, Trash } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/providers/CartProvider";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import React from "react";
import ProductVariantTable from "@/components/checkout/product-variant-table";
import { getCart, removeFromCart } from "@/services/carts.service";
import { CartLine } from "@/types/carts.types";
import CartSkeleton from "./loading";

const AnimatedTableRow = ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) => {
	return (
		<TableRow className={isOpen ? 'border-b' : 'border-none'}>
			<TableCell colSpan={5} className="p-0">
				<div className="grid">
					<div 
						className={`
							grid-rows-[0fr]
							grid
							transition-[grid-template-rows] duration-300 ease-out
							${isOpen && 'grid-rows-[1fr]'}
						`}>
						<div className="overflow-hidden">
							<div 
								className={`
									bg-muted px-6 py-4 text-sm text-muted-foreground
									min-h-0
									transform-gpu
									${isOpen 
										? 'opacity-100 scale-y-100' 
										: 'opacity-0 scale-y-95'
									}
									transition-all duration-300 ease-out
								`}>
								{children}
							</div>
						</div>
					</div>
				</div>
			</TableCell>
		</TableRow>
	);
};

export default function CartPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = React.useState(true);
	const [cartItems, setCartItems] = React.useState<CartLine[]>([]);

	React.useEffect(() => {
		const fetchCart = async () => {
			try {
				setIsLoading(true);
				const items = await getCart(1); // TODO: Replace with actual user ID
				setCartItems(items);
			} catch (error) {
				console.error('Error fetching cart:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchCart();
	}, []);

	const subtotal = cartItems.reduce(
		(acc, item) => acc + (item.price || 0) * item.quantity,
		0,
	);

	const handleCheckout = () => {
		router.push("/checkout");
	};

	if (isLoading) {
		return <CartSkeleton />;
	}

	return (
		<main className="container min-h-screen py-10">
			<div className="grid grid-cols-1 gap-10 md:grid-cols-3">
				{/* Cart Items */}
				<div className="md:col-span-2 space-y-6">
					<h1 className="text-2xl font-semibold">Your Cart ({cartItems.length})</h1>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Product</TableHead>
								<TableHead>Price</TableHead>
								<TableHead>Quantity</TableHead>
								<TableHead>Total</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{!isLoading && cartItems.map((item, idx) => {
								const [isOpen, setIsOpen] = React.useState(false);	

								return (
									<React.Fragment key={idx}>
										<TableRow 
											onClick={() => setIsOpen(!isOpen)} 
											className="cursor-pointer hover:bg-muted/50 transition-colors">
											<TableCell>
												<div className="flex items-center gap-4">
													<div className="relative h-16 w-16 rounded bg-muted">
														{item.media_url ? (
															<Image
																src={item.media_url}
																alt={item.product_name || ''}
																fill
																className="object-contain"
															/>
														) : (
															<div className="h-full w-full bg-gray-200" />
														)}
													</div>
													<span className="font-medium">{item.product_name}</span>
												</div>
											</TableCell>
											<TableCell className="text-muted-foreground">
												${(item.price || 0).toFixed(2)}
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<Button 
														size="icon" 
														variant="outline"
														onClick={(e) => {
															e.stopPropagation();
															// Add decrease quantity logic here
														}}>
														<Minus className="h-4 w-4" />
													</Button>
													<span className="w-6 text-center">{item.quantity}</span>
													<Button 
														size="icon" 
														variant="outline"
														onClick={(e) => {
															e.stopPropagation();
															// Add increase quantity logic here
														}}>
														<Plus className="h-4 w-4" />
													</Button>
												</div>
											</TableCell>
											<TableCell>
												${((item.price || 0) * item.quantity).toFixed(2)}
											</TableCell>
											<TableCell className="text-right">
												<Button
													size="icon"
													variant="ghost"
													onClick={async (e) => {
														e.stopPropagation();
														await removeFromCart(1, Number(item.item_number));
														setCartItems((prevItems) => prevItems.filter((i) => i.item_number !== item.item_number));
													}}>
													<Trash className="h-4 w-4 text-muted-foreground" />
												</Button>
											</TableCell>
										</TableRow>
										<AnimatedTableRow isOpen={isOpen}>
											<ProductVariantTable
												variants={item.variants || []}
												productNumber={item.product_number}
											/>
										</AnimatedTableRow>
									</React.Fragment>
								)})
							}
						</TableBody>
					</Table>
				</div>

				{/* Order Summary */}
				<div className="space-y-6">
					<div className="rounded-xl border bg-card p-6 shadow">
						<h2 className="text-xl font-semibold">Order Summary</h2>
						<div className="mt-4 space-y-4 text-sm">
							<div className="flex justify-between">
								<span>Subtotal</span>
								<span>${subtotal.toFixed(2)}</span>
							</div>
							<div className="flex justify-between">
								<span>Shipping</span>
								<span>Calculated at checkout</span>
							</div>
						</div>
						<Button
							className="mt-6 w-full"
							disabled={cartItems.length === 0 || isLoading}
							onClick={handleCheckout}>
							{isLoading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								'Continue to Checkout'
							)}
						</Button>
					</div>

					{/* Related Products */}
					<div className="rounded-xl border bg-card p-6 shadow">
						<h2 className="text-lg font-semibold mb-4">Related Products</h2>
						<div className="grid grid-cols-3 gap-4">
							{[
								{ src: "/images/helmet.jpg", name: "Helmet", price: "$12.00" },
								{ src: "/images/gloves.jpg", name: "Gloves", price: "$24.50" },
								{ src: "/images/welding.jpg", name: "Welding Mask", price: "$18.00" },
							].map((product, index) => (
								<div key={index} className="text-center">
									<div className="relative h-24 w-full rounded bg-muted">
										<Image
											src={product.src}
											alt={product.name}
											fill
											className="object-contain"
										/>
									</div>
									<p className="mt-2 text-sm">{product.name}</p>
									<p className="text-muted-foreground text-sm">{product.price}</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
