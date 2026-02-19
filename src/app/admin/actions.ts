/**
 * Admin Management Actions
 * 
 * Server-side functions for admin operations including:
 * - User management (promote/demote/delete)
 * - Permission management
 * - Product CRUD operations
 * - Order management
 * - Activity logs
 */

"use server";

import { createClient } from "@/utils/supabase/server";
import { createStaticClient } from "@/utils/supabase/static-client";
import type { UserRole, OrderStatus } from "@/types";
import { revalidatePath } from "next/cache";

/* ===========================
   Permission & Access Control
   =========================== */

/**
 * Check if current user has required permission
 */
export async function checkPermission(requiredRole: UserRole): Promise<boolean> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile) return false;

    const roleHierarchy: Record<UserRole, number> = {
      customer: 0,
      agent: 1,
      admin: 2,
      chief_admin: 3,
    };

    return roleHierarchy[profile.role as UserRole] >= roleHierarchy[requiredRole];
  } catch (error) {
    console.error("Error checking permission:", error);
    return false;
  }
}

/**
 * Get current admin's permissions
 */
export async function getAdminPermissions(): Promise<{
  canManageUsers: boolean;
  canManageProducts: boolean;
  canManageOrders: boolean;
  canViewAuditLogs: boolean;
  canViewSalesLogs: boolean;
  canManageAgents: boolean;
  role: UserRole | null;
} | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile) return null;

    const role = profile.role as UserRole;
    const isChiefAdmin = role === "chief_admin";
    const isAdmin = role === "admin" || isChiefAdmin;
    const isAgent = role === "agent" || isAdmin;

    return {
      canManageUsers: isChiefAdmin,
      canManageProducts: isAgent,
      canManageOrders: isAgent,
      canViewAuditLogs: isAgent,
      canViewSalesLogs: isAgent,
      canManageAgents: isChiefAdmin,
      role,
    };
  } catch (error) {
    console.error("Error getting permissions:", error);
    return null;
  }
}

/* ===========================
   User Management (Chief Admin Only)
   =========================== */

/**
 * Get all users with their roles
 */
export async function getAllUsers() {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, is_active, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users", data: null };
  }
}

/**
 * Promote user to higher role
 */
export async function promoteUser(targetUserId: string, newRole: UserRole): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  try {
    const supabase = await createClient();

    // Verify caller is chief_admin
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    if (!currentUser) {
      return { success: false, error: "Not authenticated" };
    }

    const { data: callerProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .single();

    if (callerProfile?.role !== "chief_admin") {
      return { success: false, error: "Only chief admin can promote users" };
    }

    // Update user's role
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", targetUserId);

    if (profileError) throw profileError;

    // Create admin_staff record if promoting to admin/agent
    if (newRole !== "customer") {
      const { error: staffError } = await supabase.from("admin_staff").insert({
        id: targetUserId,
        profile_id: targetUserId,
        staff_id: `STAFF-${Date.now()}`,
        department: "Team",
        position: newRole === "agent" ? "Support Agent" : "Administrator",
        is_active: true,
      });

      if (staffError && staffError.code !== "23505") {
        throw staffError;
      }
    }

    // Log the action
    await supabase.from("admin_activity_logs").insert({
      admin_id: currentUser.id,
      action: "user_promoted",
      resource_type: "user",
      resource_id: targetUserId,
      changes: { new_role: newRole },
    });

    revalidatePath("/admin/users");
    return { success: true, message: `User promoted to ${newRole}` };
  } catch (error) {
    console.error("Error promoting user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to promote user",
    };
  }
}

/**
 * Demote user to customer role
 */
export async function demoteUser(targetUserId: string): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    if (!currentUser) {
      return { success: false, error: "Not authenticated" };
    }

    const { data: callerProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .single();

    if (callerProfile?.role !== "chief_admin") {
      return { success: false, error: "Only chief admin can demote users" };
    }

    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", targetUserId)
      .single();

    const oldRole = targetProfile?.role;

    // Demote to customer
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ role: "customer" })
      .eq("id", targetUserId);

    if (profileError) throw profileError;

    // Remove from admin_staff
    await supabase.from("admin_staff").delete().eq("id", targetUserId);

    // Log the action
    await supabase.from("admin_activity_logs").insert({
      admin_id: currentUser.id,
      action: "user_demoted",
      resource_type: "user",
      resource_id: targetUserId,
      changes: { old_role: oldRole, new_role: "customer" },
    });

    revalidatePath("/admin/users");
    return { success: true, message: "User demoted to customer" };
  } catch (error) {
    console.error("Error demoting user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to demote user",
    };
  }
}

/**
 * Delete user completely (Chief Admin only)
 */
export async function deleteUser(targetUserId: string): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    if (!currentUser) {
      return { success: false, error: "Not authenticated" };
    }

    const { data: callerProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .single();

    if (callerProfile?.role !== "chief_admin") {
      return { success: false, error: "Only chief admin can delete users" };
    }

    // Delete from admin_staff first
    await supabase.from("admin_staff").delete().eq("id", targetUserId);

    // Delete from profiles (cascades to other tables)
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", targetUserId);

    if (error) throw error;

    // Log the action
    await supabase.from("admin_activity_logs").insert({
      admin_id: currentUser.id,
      action: "user_deleted",
      resource_type: "user",
      resource_id: targetUserId,
    });

    revalidatePath("/admin/users");
    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete user",
    };
  }
}

/**
 * Toggle user active status
 */
export async function toggleUserStatus(targetUserId: string): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    if (!currentUser) {
      return { success: false, error: "Not authenticated" };
    }

    const { data: callerProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .single();

    if (callerProfile?.role !== "chief_admin") {
      return { success: false, error: "Only chief admin can toggle user status" };
    }

    // Get current status
    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("is_active")
      .eq("id", targetUserId)
      .single();

    // Toggle status
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: !targetProfile?.is_active })
      .eq("id", targetUserId);

    if (error) throw error;

    // Log the action
    await supabase.from("admin_activity_logs").insert({
      admin_id: currentUser.id,
      action: `user_${targetProfile?.is_active ? "deactivated" : "activated"}`,
      resource_type: "user",
      resource_id: targetUserId,
    });

    revalidatePath("/admin/users");
    return {
      success: true,
      message: `User ${targetProfile?.is_active ? "deactivated" : "activated"}`,
    };
  } catch (error) {
    console.error("Error toggling user status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle user status",
    };
  }
}

/* ===========================
   Product Management
   =========================== */

/**
 * Create a new product
 */
export async function createProduct(productData: {
  name: string;
  slug: string;
  description: string | null;
  category: string;
  price: number;
  discount_price: number | null;
  stock_quantity: number;
  sku: string | null;
  images: string[];
  attributes: Record<string, string | number | boolean | null>;
}): Promise<{
  success: boolean;
  error?: string;
  message?: string;
  productId?: string;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Get admin_staff record
    const { data: adminStaff } = await supabase
      .from("admin_staff")
      .select("id")
      .eq("id", user.id)
      .single();

    const { data, error } = await supabase
      .from("products")
      .insert({
        ...productData,
        created_by: adminStaff?.id || null,
      })
      .select("id")
      .single();

    if (error) throw error;

    // Log the action
    await supabase.from("admin_activity_logs").insert({
      admin_id: user.id,
      action: "product_created",
      resource_type: "product",
      resource_id: data.id,
      changes: { name: productData.name },
    });

    revalidatePath("/admin/catalog");
    revalidatePath("/shop");
    revalidatePath("/sitemap.xml");
    return {
      success: true,
      message: "Product created successfully",
      productId: data.id,
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create product",
    };
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(
  productId: string,
  updates: Partial<typeof createProduct.arguments[0]>
): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { error } = await supabase
      .from("products")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", productId);

    if (error) throw error;

    // Log the action
    await supabase.from("admin_activity_logs").insert({
      admin_id: user.id,
      action: "product_updated",
      resource_type: "product",
      resource_id: productId,
      changes: updates,
    });

    revalidatePath("/admin/catalog");
    revalidatePath("/shop");
    revalidatePath(`/products/${productId}`);
    return { success: true, message: "Product updated successfully" };
  } catch (error) {
    console.error("Error updating product:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update product",
    };
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(productId: string): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) throw error;

    // Log the action
    await supabase.from("admin_activity_logs").insert({
      admin_id: user.id,
      action: "product_deleted",
      resource_type: "product",
      resource_id: productId,
    });

    revalidatePath("/admin/catalog");
    revalidatePath("/shop");
    revalidatePath("/sitemap.xml");
    return { success: true, message: "Product deleted successfully" };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete product",
    };
  }
}

/**
 * Toggle product active status
 */
export async function toggleProductStatus(productId: string): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data: product } = await supabase
      .from("products")
      .select("is_active")
      .eq("id", productId)
      .single();

    const { error } = await supabase
      .from("products")
      .update({ is_active: !product?.is_active })
      .eq("id", productId);

    if (error) throw error;

    // Log the action
    await supabase.from("admin_activity_logs").insert({
      admin_id: user.id,
      action: `product_${product?.is_active ? "deactivated" : "activated"}`,
      resource_type: "product",
      resource_id: productId,
    });

    revalidatePath("/admin/catalog");
    revalidatePath("/shop");
    return {
      success: true,
      message: `Product ${product?.is_active ? "deactivated" : "activated"}`,
    };
  } catch (error) {
    console.error("Error toggling product status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle product status",
    };
  }
}

/* ===========================
   Order Management
   =========================== */

/**
 * Get all orders with items
 */
export async function getAllOrders() {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        profiles (email, full_name),
        order_items (
          *,
          product_id,
          product_name,
          quantity,
          unit_price
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { success: false, error: "Failed to fetch orders", data: null };
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { error } = await supabase
      .from("orders")
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId);

    if (error) throw error;

    // Log the action
    await supabase.from("admin_activity_logs").insert({
      admin_id: user.id,
      action: "order_status_updated",
      resource_type: "order",
      resource_id: orderId,
      changes: { new_status: status },
    });

    revalidatePath("/admin/orders");
    return { success: true, message: `Order status updated to ${status}` };
  } catch (error) {
    console.error("Error updating order status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update order status",
    };
  }
}

/* ===========================
   Activity Logs (Audit Trail)
   =========================== */

/**
 * Get activity logs for audit trail
 */
export async function getActivityLogs(limit: number = 100) {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("admin_activity_logs")
      .select(`
        *,
        admin_staff (
          profile_id,
          position
        ),
        profiles (
          email,
          full_name
        )
      `)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return { success: false, error: "Failed to fetch activity logs", data: null };
  }
}

/* ===========================
   Sales Reports
   =========================== */

/**
 * Get sales statistics and logs
 */
export async function getSalesStats(period: "day" | "week" | "month" | "all" = "all") {
  try {
    const supabase = createStaticClient();

    // Calculate date range
    let dateFilter = "";
    if (period !== "all") {
      const now = new Date();
      let startDate: Date;
      switch (period) {
        case "day":
          startDate = new Date(now.setDate(now.getDate() - 1));
          break;
        case "week":
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "month":
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = new Date(0);
      }
      dateFilter = `created_at >= '${startDate.toISOString()}'`;
    }

    // Get orders
    const { data: orders, error } = await supabase
      .from("orders")
      .select("total_amount, status, created_at")
      .eq("payment_status", "completed");

    if (error) throw error;

    // Calculate statistics
    const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
    const totalOrders = orders?.length || 0;
    const completedOrders = orders?.filter(o => o.status === "delivered").length || 0;

    return {
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        completedOrders,
        orders,
      },
    };
  } catch (error) {
    console.error("Error fetching sales stats:", error);
    return { success: false, error: "Failed to fetch sales statistics", data: null };
  }
}

/* ===========================
   Issues/Bugs Tracking
   =========================== */

/**
 * Get issues/bugs from system
 * Note: This assumes you'll create an issues table or use existing tables
 */
export async function getSystemIssues() {
  try {
    const supabase = createStaticClient();
    
    // For now, return empty array - you can create an issues table later
    // This is a placeholder for future implementation
    return { success: true, data: [] };
  } catch (error) {
    console.error("Error fetching issues:", error);
    return { success: false, error: "Failed to fetch issues", data: null };
  }
}

/**
 * Get all agents
 */
export async function getAllAgents() {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, is_active, created_at")
      .eq("role", "agent")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching agents:", error);
    return { success: false, error: "Failed to fetch agents", data: null };
  }
}
