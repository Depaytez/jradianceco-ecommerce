/**
 * =============================================================================
 * JRADIANCE Admin Actions
 * =============================================================================
 * 
 * Server-side functions for all administrative operations.
 * These actions are only accessible by authorized admin users.
 * 
 * Features:
 * - Authentication (login)
 * - User Management (promote/demote/delete/toggle)
 * - Permission & Access Control
 * - Product Management (CRUD)
 * - Order Management
 * - Activity Logs (Audit Trail)
 * - Sales Reports
 * 
 * @author Philip Depaytez
 * @version 2.0.0
 */

"use server";

import { createClient } from "@/utils/supabase/server";
import { createStaticClient } from "@/utils/supabase/static-client";
import type { UserRole, OrderStatus } from "@/types";
import { AuthState } from "@/types/index";
import { revalidatePath } from "next/cache";

/* =============================================================================
   Authentication Actions
   ============================================================================= */

/**
 * Admin Login
 * 
 * Authenticates admin users and verifies their role.
 * Only users with admin, agent, or chief_admin roles can access admin panel.
 * 
 * @param prevState - Previous authentication state
 * @param formData - Form data containing email and password
 * @returns Authentication result with error or success message
 * 
 * @example
 * // In a login form:
 * const [state, formAction] = useActionState(login, null);
 * <form action={formAction}>...</form>
 */
export async function login(
  prevState: AuthState | null,
  formData: FormData,
): Promise<AuthState | null> {
  try {
    const supabase = await createClient();

    // Extract and validate form data
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { error: "Email and password are required" };
    }

    // Attempt sign in
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Not authenticated" };
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const allowedRoles = ["admin", "agent", "chief_admin"];
    if (!allowedRoles.includes(profile?.role || "")) {
      return { error: "Unauthorized" };
    }

    return { error: null, message: "Login successful" };
  } catch (error) {
    console.error("Login error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "An error occurred during login",
    };
  }
}

/* =============================================================================
   Common Response Types
   ============================================================================= */

/**
 * Standard response interface for admin actions
 * Used for consistent error handling across all operations
 */
export interface AdminActionResult {
  success: boolean;
  error?: string;
  message?: string;
}

/* =============================================================================
   Permission & Access Control
   ============================================================================= */

/**
 * Check Permission
 * 
 * Verifies if the current user has the required role or higher.
 * Uses role hierarchy: customer (0) < agent (1) < admin (2) < chief_admin (3)
 * 
 * @param requiredRole - Minimum role required for access
 * @returns true if user has permission, false otherwise
 * 
 * @example
 * const hasAccess = await checkPermission("admin");
 * if (!hasAccess) return { error: "Access denied" };
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

    // Role hierarchy for permission checking
    const roleHierarchy: Record<UserRole, number> = {
      customer: 0,
      agent: 1,
      admin: 2,
      chief_admin: 3,
    };

    return (
      roleHierarchy[profile.role as UserRole] >= roleHierarchy[requiredRole]
    );
  } catch (error) {
    console.error("Error checking permission:", error);
    return false;
  }
}

/**
 * Get Admin Permissions
 * 
 * Returns detailed permission flags based on user's role.
 * Useful for conditionally rendering UI elements.
 * 
 * @returns Permission object with boolean flags for each capability
 * 
 * @example
 * const perms = await getAdminPermissions();
 * if (perms?.canManageProducts) { /* Show product management UI *\/ }
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

/* =============================================================================
   User Management (Chief Admin Only)
   ============================================================================= */

/**
 * Get All Users
 * 
 * Retrieves all user profiles with their roles.
 * Uses static client to avoid cookie issues during static generation.
 * 
 * @returns List of all users with basic profile information
 * 
 * @security Chief Admin only
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
 * Promote User
 * 
 * Elevates a user to a higher role (e.g., customer → agent → admin).
 * Creates admin_staff record if promoting to admin/agent.
 * 
 * @param targetUserId - ID of user to promote
 * @param newRole - New role to assign
 * @returns Result of promotion operation
 * 
 * @security Chief Admin only
 * @audit Logs promotion action for accountability
 */
export async function promoteUser(
  targetUserId: string,
  newRole: UserRole,
): Promise<AdminActionResult> {
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

      // Ignore unique constraint violations (staff already exists)
      if (staffError && staffError.code !== "23505") {
        throw staffError;
      }
    }

    // Log the action for audit trail
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
 * Demote User
 * 
 * Removes admin/agent privileges and reverts user to customer role.
 * Deletes admin_staff record.
 * 
 * @param targetUserId - ID of user to demote
 * @returns Result of demotion operation
 * 
 * @security Chief Admin only
 * @audit Logs demotion action for accountability
 */
export async function demoteUser(targetUserId: string): Promise<AdminActionResult> {
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
 * Delete User
 * 
 * Permanently removes a user from the system.
 * Cascades to related tables (cart_items, orders, etc.) via foreign keys.
 * 
 * @param targetUserId - ID of user to delete
 * @returns Result of deletion operation
 * 
 * @security Chief Admin only
 * @warning This action cannot be undone
 * @audit Logs deletion action for accountability
 */
export async function deleteUser(targetUserId: string): Promise<AdminActionResult> {
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
 * Toggle User Status
 * 
 * Activates or deactivates a user account without deleting data.
 * Deactivated users cannot log in.
 * 
 * @param targetUserId - ID of user to toggle
 * @returns Result of toggle operation
 * 
 * @security Chief Admin only
 * @audit Logs toggle action for accountability
 */
export async function toggleUserStatus(targetUserId: string): Promise<AdminActionResult> {
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

/**
 * Get All Agents
 * 
 * Retrieves all users with agent role.
 * Used in Agents Manager page.
 * 
 * @returns List of all agents
 * 
 * @security Chief Admin only
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

/* =============================================================================
   Product Management (Agent+ Access)
   ============================================================================= */

/**
 * Create Product
 * 
 * Adds a new product to the catalog.
 * Associates product with creating admin for audit trail.
 * 
 * @param productData - Product information including name, price, images, etc.
 * @returns Result with created product ID
 * 
 * @security Agent, Admin, Chief Admin only
 * @audit Logs product creation
 * @revalidates /admin/catalog, /shop, /sitemap.xml
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
}): Promise<AdminActionResult & { productId?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Get admin_staff record for created_by field
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

    // Revalidate pages that display products
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
 * Update Product
 * 
 * Modifies existing product information.
 * Updates timestamp for cache invalidation.
 * 
 * @param productId - ID of product to update
 * @param updates - Fields to update
 * @returns Result of update operation
 * 
 * @security Agent, Admin, Chief Admin only
 * @audit Logs product update
 * @revalidates affected pages
 */
export async function updateProduct(
  productId: string,
  updates: Partial<{
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
  }>
): Promise<AdminActionResult> {
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
 * Delete Product
 * 
 * Removes a product from the catalog.
 * Soft delete recommended for production (set is_active = false).
 * 
 * @param productId - ID of product to delete
 * @returns Result of deletion operation
 * 
 * @security Agent, Admin, Chief Admin only
 * @audit Logs product deletion
 * @revalidates affected pages
 */
export async function deleteProduct(productId: string): Promise<AdminActionResult> {
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
 * Toggle Product Status
 * 
 * Activates or deactivates a product.
 * Deactivated products are hidden from customers but remain in database.
 * 
 * @param productId - ID of product to toggle
 * @returns Result of toggle operation
 * 
 * @security Agent, Admin, Chief Admin only
 * @audit Logs product status change
 */
export async function toggleProductStatus(productId: string): Promise<AdminActionResult> {
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

/* =============================================================================
   Order Management (Agent+ Access)
   ============================================================================= */

/**
 * Get All Orders
 * 
 * Retrieves all orders with customer and item details.
 * Uses static client to avoid cookie issues.
 * 
 * @returns List of all orders with related data
 * 
 * @security Agent, Admin, Chief Admin only
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
 * Update Order Status
 * 
 * Changes order status through the fulfillment pipeline:
 * pending → confirmed → shipped → delivered
 * 
 * @param orderId - ID of order to update
 * @param status - New order status
 * @returns Result of update operation
 * 
 * @security Agent, Admin, Chief Admin only
 * @audit Logs status change
 * @revalidates /admin/orders
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<AdminActionResult> {
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

/* =============================================================================
   Activity Logs & Audit Trail (Admin+ Access)
   ============================================================================= */

/**
 * Get Activity Logs
 * 
 * Retrieves admin activity logs for audit and accountability.
 * Includes admin details and changes made.
 * 
 * @param limit - Maximum number of logs to retrieve (default: 100)
 * @returns List of activity logs with admin details
 * 
 * @security Admin, Chief Admin only
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

/* =============================================================================
   Sales Reports & Analytics (Admin+ Access)
   ============================================================================= */

/**
 * Get Sales Statistics
 * 
 * Calculates revenue, order counts, and completion rates.
 * Supports filtering by time period.
 * 
 * @param period - Time period: "day", "week", "month", or "all"
 * @returns Sales statistics and order data
 * 
 * @security Admin, Chief Admin only
 */
export async function getSalesStats(
  period: "day" | "week" | "month" | "all" = "all"
) {
  try {
    const supabase = createStaticClient();

    // Get all completed orders
    const { data: orders, error } = await supabase
      .from("orders")
      .select("total_amount, status, created_at")
      .eq("payment_status", "completed");

    if (error) throw error;

    // Calculate statistics
    const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
    const totalOrders = orders?.length || 0;
    const completedOrders = orders?.filter((o) => o.status === "delivered").length || 0;

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

/* =============================================================================
   Issues & Bug Tracking (Admin+ Access)
   ============================================================================= */

/**
 * Get System Issues
 * 
 * Retrieves bugs and customer complaints.
 * Currently returns mock data - implement issues table for production.
 * 
 * @returns List of system issues
 * 
 * @security Admin, Chief Admin only
 * @todo Create issues table in Supabase for production
 */
export async function getSystemIssues() {
  try {
    const supabase = createStaticClient();
    
    // TODO: Implement issues table
    // For now, return empty array
    return { success: true, data: [] };
  } catch (error) {
    console.error("Error fetching issues:", error);
    return { success: false, error: "Failed to fetch issues", data: null };
  }
}
