"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CheckoutSteps() {
	const [openStep, setOpenStep] = useState(1);

	const StepHeader = ({ step, title }: { step: number; title: string }) => (
		<button
			type="button"
			onClick={() => setOpenStep(step)}
			className="flex w-full items-center gap-4 border-b p-4 text-left">
			<div className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-sm font-medium text-white">
				{step}
			</div>
			<h2 className="font-medium">{title}</h2>
		</button>
	);

	return (
		<div className="w-full space-y-4">
			{/* Express Checkout */}
			<div className="space-y-2 rounded-md border bg-white p-4">
				<h2 className="text-lg font-semibold">Express Checkout</h2>
				<div className="flex gap-4">
					<Button className="w-[275px] bg-yellow-400 text-lg font-semibold text-black">
						PayPal
					</Button>
					<Button className="w-[275px] bg-[#5a31f4] text-lg font-semibold text-white">
						Shop Pay
					</Button>
				</div>
			</div>

			<div className="overflow-hidden rounded-md border bg-white">
				<StepHeader
					step={1}
					title="Enter Your Email"
				/>
				{openStep === 1 && (
					<div className="space-y-4 p-4">
						<p className="text-sm">
							Already have an account?{" "}
							<a
								href="#"
								className="underline">
								Log In
							</a>
						</p>
						<Input placeholder="Email Address*" />
						<p className="text-muted-foreground text-xs">
							By providing your email, you agree to our Privacy Policy and
							Terms.
						</p>
						<Button
							className="w-full bg-gray-400 text-white"
							disabled>
							Continue to Shipping
						</Button>
						<div className="flex items-start gap-2 text-sm">
							<input
								type="checkbox"
								id="newsletter"
							/>
							<label htmlFor="newsletter">
								Join our newsletter and receive 20% your first full price
								purchase.
							</label>
						</div>
					</div>
				)}
			</div>

			<div className="overflow-hidden rounded-md border bg-white">
				<StepHeader
					step={2}
					title="Shipping"
				/>
				{openStep === 2 && (
					<div className="space-y-4 p-4">
						<p className="text-muted-foreground text-sm">
							Shipping form placeholder
						</p>
						<Button
							className="w-full"
							disabled>
							Continue to Payment
						</Button>
					</div>
				)}
			</div>

			<div className="overflow-hidden rounded-md border bg-white">
				<StepHeader
					step={3}
					title="Payment Method"
				/>
				{openStep === 3 && (
					<div className="space-y-4 p-4">
						<p className="text-muted-foreground text-sm">
							Create a password for easy order review and faster checkout next
							time you shop.
						</p>
						<Input
							type="password"
							placeholder="Password (Optional)"
						/>
						<Button
							className="w-full bg-gray-300 text-white"
							disabled>
							Place Order
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
