"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { OrderSummary } from "@/components/checkout/order-summary";

export default function CheckoutPage() {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  // In a real app, these values would come from your cart state
  const orderDetails = {
    subtotal: 99.99,
    shipping: 9.99,
    tax: 10.00,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <CheckoutForm 
            isLoading={isLoading}
            onSubmit={handleSubmit}
          />
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <OrderSummary {...orderDetails} />
        </div>
      </div>
    </div>
  );
}