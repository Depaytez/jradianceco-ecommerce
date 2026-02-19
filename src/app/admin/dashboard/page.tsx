/**
 * Admin Dashboard Home Page
 * 
 * Overview of key metrics and quick access to admin features.
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminSidePanel from "@/components/AdminSidePanel";
import { getSalesStats, getActivityLogs, checkPermission } from "../actions";
import { ShoppingBag, DollarSign, TrendingUp, Users, Package, Clock } from "lucide-react";

export default function AdminDashboard() {
  const [role, setRole] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    
    // Get user role
    const hasAgentAccess = await checkPermission("agent");
    if (hasAgentAccess) {
      const perms = await checkPermission("chief_admin");
      setRole(perms ? "chief_admin" : "admin");
    }

    // Load stats
    const statsResult = await getSalesStats("week");
    if (statsResult.success) setStats(statsResult.data);

    // Load recent activity
    const logsResult = await getActivityLogs(5);
    if (logsResult.success) setRecentLogs(logsResult.data || []);

    setLoading(false);
  }

  return (
    <div className="space-y-8">
      <AdminSidePanel />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-radiance-charcoalTextColor">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back! Here's what's happening with your store.
        </p>
        {role && (
          <p className="text-sm text-radiance-goldColor mt-2 font-medium">
            Role: {role.replace("_", " ").toUpperCase()}
          </p>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-radiance-goldColor mx-auto"></div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/admin/sales-log" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue (Week)</p>
                  <p className="text-2xl font-bold text-radiance-goldColor">
                    ₦{stats?.totalRevenue.toLocaleString() || "0"}
                  </p>
                </div>
                <DollarSign size={40} className="text-green-500" />
              </div>
            </Link>

            <Link href="/admin/orders" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
                </div>
                <ShoppingBag size={40} className="text-blue-500" />
              </div>
            </Link>

            <Link href="/admin/orders" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.completedOrders || 0}</p>
                </div>
                <Package size={40} className="text-green-500" />
              </div>
            </Link>

            <Link href="/admin/users" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.totalOrders ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%
                  </p>
                </div>
                <TrendingUp size={40} className="text-purple-500" />
              </div>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/admin/catalog" className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <Package size={24} className="text-blue-500 mb-2" />
                <span className="text-sm font-medium">Manage Products</span>
              </Link>
              <Link href="/admin/orders" className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <ShoppingBag size={24} className="text-green-500 mb-2" />
                <span className="text-sm font-medium">View Orders</span>
              </Link>
              <Link href="/admin/users" className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <Users size={24} className="text-purple-500 mb-2" />
                <span className="text-sm font-medium">User Manager</span>
              </Link>
              <Link href="/admin/audit-log" className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <Clock size={24} className="text-orange-500 mb-2" />
                <span className="text-sm font-medium">Audit Logs</span>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Recent Activity</h2>
              <Link href="/admin/audit-log" className="text-sm text-radiance-goldColor hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {recentLogs.length > 0 ? (
                recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{log.action}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {log.profiles?.email || `Admin ${log.admin_id.slice(0, 8)}`}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
