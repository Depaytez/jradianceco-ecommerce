/**
 * Orders Manager Page
 * 
 * Admin can view all orders and update order status.
 * Access: Admin, Chief Admin, Agent
 */

"use client";

import { useState, useEffect } from "react";
import { getAllOrders, updateOrderStatus, checkPermission } from "../actions";
import { ShoppingBag, Package, CheckCircle, Clock, Truck, XCircle } from "lucide-react";

type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "returned";

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: OrderStatus;
  payment_status: string;
  created_at: string;
  profiles: {
    email: string;
    full_name: string | null;
  } | null;
  order_items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;
}

export default function OrdersManagerPage() {
  const [hasAccess, setHasAccess] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    checkPermissions();
    loadOrders();
  }, []);

  async function checkPermissions() {
    const hasPermission = await checkPermission("agent");
    setHasAccess(hasPermission);
  }

  async function loadOrders() {
    setLoading(true);
    const result = await getAllOrders();
    if (result.success && result.data) {
      setOrders(result.data);
    }
    setLoading(false);
  }

  async function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    setActionLoading(orderId);
    const result = await updateOrderStatus(orderId, newStatus);
    setMessage({ type: result.success ? "success" : "error", text: result.message || result.error || "" });
    if (result.success) loadOrders();
    setActionLoading(null);
    setTimeout(() => setMessage(null), 3000);
  }

  const filteredOrders = statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "pending": return <Clock size={16} className="text-yellow-500" />;
      case "confirmed": return <CheckCircle size={16} className="text-blue-500" />;
      case "shipped": return <Truck size={16} className="text-purple-500" />;
      case "delivered": return <Package size={16} className="text-green-500" />;
      case "cancelled": return <XCircle size={16} className="text-red-500" />;
      case "returned": return <XCircle size={16} className="text-orange-500" />;
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

  if (!hasAccess) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
        <p className="text-gray-600 mt-2">You don't have permission to manage orders.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-radiance-charcoalTextColor">Orders Manager</h1>
          <p className="text-gray-600 mt-1">Track and manage all customer orders</p>
        </div>
        <ShoppingBag className="text-radiance-goldColor" size={32} />
      </div>

      {message && (
        <div className={`p-4 rounded-xl ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto">
        {(["all", "pending", "confirmed", "shipped", "delivered", "cancelled", "returned"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              statusFilter === status
                ? "bg-radiance-goldColor text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-radiance-goldColor mx-auto"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">{order.order_number}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.profiles?.full_name || "Guest"}</p>
                        <p className="text-xs text-gray-500">{order.profiles?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.order_items?.length || 0} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-radiance-goldColor">
                        ₦{order.total_amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.payment_status === "completed" ? "bg-green-100 text-green-800" :
                        order.payment_status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        disabled={actionLoading === order.id}
                        className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-radiance-goldColor disabled:opacity-50"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="returned">Returned</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredOrders.length === 0 && !loading && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No orders found</p>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <XCircle size={24} />
              </button>
            </div>
            {/* Order details content */}
          </div>
        </div>
      )}
    </div>
  );
}
