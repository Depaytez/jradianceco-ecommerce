/**
 * Order History Page
 * 
 * Customer can view their order history and track order status.
 * Access: Authenticated users only
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { getUserOrders, getOrderItems } from "@/utils/supabase/services";
import { ShoppingBag, Package, Clock, Truck, CheckCircle, XCircle, ChevronDown } from "lucide-react";
import type { Order as OrderType, OrderItem, OrderStatus } from "@/types";

type Order = OrderType & { items?: OrderItem[] };

function OrderHistoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useUser();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(
    searchParams.get("order")
  );

  useEffect(() => {
    if (!user) {
      router.push("/shop/auth?redirect=/shop/history");
      return;
    }
    loadOrders();
  }, [user, router]);

  useEffect(() => {
    if (selectedOrder) {
      setExpandedOrder(selectedOrder);
    }
  }, [selectedOrder]);

  async function loadOrders() {
    if (!user) return;
    setLoading(true);
    const userOrders = await getUserOrders(user.id);
    
    // Load items for each order
    const ordersWithItems = await Promise.all(
      userOrders.map(async (order) => {
        const items = await getOrderItems(order.id);
        return { ...order, items };
      })
    );
    
    setOrders(ordersWithItems);
    setLoading(false);
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "pending": return <Clock size={20} className="text-yellow-500" />;
      case "confirmed": return <CheckCircle size={20} className="text-blue-500" />;
      case "shipped": return <Truck size={20} className="text-purple-500" />;
      case "delivered": return <Package size={20} className="text-green-500" />;
      case "cancelled": return <XCircle size={20} className="text-red-500" />;
      case "returned": return <XCircle size={20} className="text-orange-500" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "returned": return "bg-orange-100 text-orange-800";
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case "pending": return "Pending Confirmation";
      case "confirmed": return "Confirmed";
      case "shipped": return "Shipped";
      case "delivered": return "Delivered";
      case "cancelled": return "Cancelled";
      case "returned": return "Returned";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-radiance-goldColor mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-radiance-creamBackgroundColor py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-radiance-charcoalTextColor">Order History</h1>
            <p className="text-gray-600 mt-1">Track and manage your orders</p>
          </div>
          <ShoppingBag className="text-radiance-goldColor" size={32} />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-radiance-goldColor mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <button
              onClick={() => router.push("/shop")}
              className="bg-radiance-goldColor text-white px-8 py-3 rounded-xl font-bold hover:bg-radiance-charcoalTextColor transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Order Header */}
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(order.status)}
                      <div>
                        <p className="font-bold text-gray-900">{order.order_number}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="font-bold text-radiance-goldColor">
                          ₦{order.total_amount.toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                      <ChevronDown
                        size={20}
                        className={`text-gray-400 transition-transform ${
                          expandedOrder === order.id ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Order Details (Expanded) */}
                {expandedOrder === order.id && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <div className="space-y-4">
                      {/* Order Items */}
                      <div>
                        <h3 className="font-bold text-gray-900 mb-3">Order Items</h3>
                        <div className="space-y-2">
                          {order.items?.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between items-center p-3 bg-white rounded-lg"
                            >
                              <div>
                                <p className="font-medium text-gray-900">{item.product_name}</p>
                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                              </div>
                              <p className="font-medium text-radiance-goldColor">
                                ₦{item.total_price.toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Subtotal</span>
                          <span>₦{(order.total_amount - order.tax).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Tax</span>
                          <span>₦{order.tax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold text-gray-900 mt-2 pt-2 border-t border-gray-200">
                          <span>Total Paid</span>
                          <span className="text-radiance-goldColor">₦{order.total_amount.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Payment & Delivery Info */}
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="p-4 bg-white rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Payment Status</p>
                          <p className={`font-bold ${
                            order.payment_status === "completed" ? "text-green-600" :
                            order.payment_status === "pending" ? "text-yellow-600" :
                            "text-red-600"
                          }`}>
                            {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                          </p>
                        </div>
                        <div className="p-4 bg-white rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">
                            {order.estimated_delivery_date ? "Estimated Delivery" : "Order Date"}
                          </p>
                          <p className="font-bold text-gray-900">
                            {order.estimated_delivery_date
                              ? new Date(order.estimated_delivery_date).toLocaleDateString()
                              : new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Status Timeline */}
                      <div className="mt-6">
                        <h3 className="font-bold text-gray-900 mb-4">Order Timeline</h3>
                        <div className="flex items-center justify-between">
                          {(["pending", "confirmed", "shipped", "delivered"] as OrderStatus[]).map((status, index) => {
                            const statusOrder = ["pending", "confirmed", "shipped", "delivered"];
                            const currentIndex = statusOrder.indexOf(order.status);
                            const isCompleted = index <= currentIndex;
                            const isCurrent = index === currentIndex;

                            return (
                              <div key={status} className="flex flex-col items-center">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    isCompleted
                                      ? isCurrent
                                        ? "bg-radiance-goldColor text-white"
                                        : "bg-green-500 text-white"
                                      : "bg-gray-200 text-gray-400"
                                  }`}
                                >
                                  {getStatusIcon(status)}
                                </div>
                                <p className="text-xs text-gray-500 mt-2 capitalize">{status}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderHistoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-radiance-goldColor mx-auto"></div>
      </div>
    }>
      <OrderHistoryContent />
    </Suspense>
  );
}
