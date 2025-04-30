"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const countries = [
  { value: "no", label: "Norway" },
  { value: "se", label: "Sweden" },
  { value: "dk", label: "Denmark" },
];

const paymentMethods = [
  { value: "card", label: "Credit Card" },
  { value: "paypal", label: "Paypal" },
  { value: "invoice", label: "Invoice" },
];

interface CheckoutFormProps {
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export function CheckoutForm({ isLoading, onSubmit }: CheckoutFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Shipping Information */}
      <div className="rounded-lg border p-6">
        <h2 className="mb-4 text-lg font-semibold">Shipping Information</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            name="firstName"
            placeholder="First Name"
            required
          />
          <Input
            name="lastName"
            placeholder="Last Name"
            required
          />
          <Input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="md:col-span-2"
          />
          <Input
            name="phone"
            type="tel"
            placeholder="Phone Number"
            required
            className="md:col-span-2"
          />
          <Input
            name="address"
            placeholder="Address"
            required
            className="md:col-span-2"
          />
          <Input
            name="city"
            placeholder="City"
            required
          />
          <Input
            name="postalCode"
            placeholder="Postal Code"
            required
          />
          <Select
            name="country"
            options={countries}
            placeholder="Select Country"
            required
            className="md:col-span-2"
          />
        </div>
      </div>

      {/* Payment Method */}
      <div className="rounded-lg border p-6">
        <h2 className="mb-4 text-lg font-semibold">Payment Method</h2>
        <Tabs defaultValue="card">
          <TabsList className="mb-4">
            {paymentMethods.map((method) => (
              <TabsTrigger key={method.value} value={method.value}>
                {method.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="card" className="space-y-4">
            <Input
              name="cardNumber"
              placeholder="Card Number"
              required
            />
            <div className="grid gap-4 md:grid-cols-3">
              <Input
                name="expiryDate"
                placeholder="MM/YY"
                required
              />
              <Input
                name="cvv"
                placeholder="CVV"
                required
              />
            </div>
          </TabsContent>

          <TabsContent value="paypal">
            <p className="text-muted-foreground">
              You will be redirected to Paypal to complete your payment.
            </p>
          </TabsContent>

          <TabsContent value="invoice">
            <p className="text-muted-foreground">
              Invoice will be sent to your email address after order confirmation.
            </p>
          </TabsContent>
        </Tabs>
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Place Order"}
      </button>
    </form>
  );
}
