/**
 * Checkout Page
 * 
 * Customer checkout flow with:
 * - Delivery information form
 * - Payment integration (Paystack)
 * - Order creation
 * 
 * Access: Authenticated users only
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { getCartItems, clearCart, createOrder } from "@/utils/supabase/services";
import { CreditCard, Truck, User, MapPin, Phone, Loader2 } from "lucide-react";
import type { CartItem as CartItemType } from "@/types";

export default function CheckoutPage() {
  const router = useRouter();
  const user = useUser();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    shipping_address: "",
    billing_address: "",
  });

  useEffect(() => {
    if (!user) {
      router.push("/shop/auth?redirect=/shop/checkout");
      return;
    }
    loadCart();
  }, [user, router]);

  async function loadCart() {
    if (!user) return;
    const items = await getCartItems(user.id);
    setCartItems(items);
    setLoading(false);
  }

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product?.discount_price || item.product?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  const tax = subtotal * 0.075; // 7.5% VAT
  const shipping = subtotal > 50000 ? 0 : 2500; // Free shipping above ₦50,000
  const total = subtotal + tax + shipping;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setProcessing(true);

    try {
      // Create order items
      const orderItems = cartItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.product?.discount_price || item.product?.price || 0,
      }));

      // Create order
      const order = await createOrder(user.id, {
        items: orderItems,
        subtotal,
        tax,
        shipping_cost: shipping,
        total_amount: total,
        shipping_address: formData.shipping_address,
        billing_address: formData.billing_address || formData.shipping_address,
      });

      if (!order) {
        alert("Failed to create order. Please try again.");
        setProcessing(false);
        return;
      }

      // Initialize Paystack payment
      initializePayment(order);
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An error occurred during checkout");
      setProcessing(false);
    }
  }

  function initializePayment(order: any) {
    // Check if Paystack is available
    if (typeof window === "undefined" || !(window as any).PaystackPop) {
      alert("Payment gateway not available. Please try again.");
      return;
    }

    const handler = (window as any).PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: user?.email || "",
      amount: total * 100, // Paystack expects amount in kobo
      currency: "NGN",
      ref: `ORD-${Date.now()}`,
      metadata: {
        order_id: order.id,
        custom_fields: [
          {
            display_name: "Customer Name",
            variable_name: "customer_name",
            value: formData.full_name,
          },
          {
            display_name: "Phone Number",
            variable_name: "phone_number",
            value: formData.phone,
          },
        ],
      },
      callback: async (response: any) => {
        // Payment successful
        alert("Payment successful! Your order has been placed.");
        await clearCart(user!.id);
        router.push(`/shop/history?order=${order.id}`);
      },
      onClose: () => {
        alert("Payment cancelled. Please complete your order.");
        setProcessing(false);
      },
    });

    handler.openIframe();
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin mx-auto text-radiance-goldColor" />
          <p className="mt-4 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin mx-auto text-radiance-goldColor" />
          <p className="mt-4 text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Add some items before checkout</p>
          <button
            onClick={() => router.push("/shop")}
            className="bg-radiance-goldColor text-white px-8 py-3 rounded-xl font-bold hover:bg-radiance-charcoalTextColor transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-radiance-creamBackgroundColor py-12">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-radiance-charcoalTextColor mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <User size={20} className="text-radiance-goldColor" />
              Delivery Information
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-radiance-goldColor focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-radiance-goldColor focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Address *
                </label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  <textarea
                    value={formData.shipping_address}
                    onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-radiance-goldColor focus:border-transparent"
                    rows={3}
                    placeholder="Street address, city, state"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Billing Address
                </label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  <textarea
                    value={formData.billing_address}
                    onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-radiance-goldColor focus:border-transparent"
                    rows={3}
                    placeholder="Same as shipping (leave blank)"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full bg-radiance-goldColor text-white py-4 rounded-xl font-bold text-lg hover:bg-radiance-charcoalTextColor transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    Pay ₦{total.toLocaleString()}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Truck size={20} className="text-radiance-goldColor" />
                Order Summary
              </h2>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{item.product?.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-radiance-goldColor">
                      ₦{((item.product?.discount_price || item.product?.price || 0) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 mt-6 pt-6 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (7.5%)</span>
                  <span>₦{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "FREE" : `₦${shipping.toLocaleString()}`}</span>
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-radiance-goldColor">₦{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <div className="flex items-start gap-3">
                <CreditCard size={20} className="text-green-600 mt-0.5" />
                <div>
                  <p className="font-bold text-green-900 text-sm">Secure Payment</p>
                  <p className="text-xs text-green-700 mt-1">
                    Your payment is secured with Paystack. We never store your card details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
