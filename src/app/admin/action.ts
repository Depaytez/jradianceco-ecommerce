/**
 * Admin Actions
 * Server-side functions for administrative operations
 * Only accessible by authorized admin users
 */

"use server";

import { createClient } from "@/utils/supabase/server";
import type { UserRole } from "@/types";

export interface AdminActionResult {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Promote a customer to admin or agent role
 * Only chief_admin can perform this action
 */
export async function promoteUserRole(
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

    // Validate new role
    const validRoles: UserRole[] = [
      "customer",
      "agent",
      "admin",
      "chief_admin",
    ];
    if (!validRoles.includes(newRole)) {
      return { success: false, error: "Invalid role" };
    }

    // Update user's role in profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", targetUserId);

    if (profileError) throw profileError;

    // Create admin_staff record if promoting to admin or agent
    if (newRole !== "customer") {
      const { error: staffError } = await supabase.from("admin_staff").insert({
        id: targetUserId,
        profile_id: targetUserId,
        staff_id: `STAFF-${Date.now()}`,
        department: "Team",
        position: newRole === "agent" ? "Support Agent" : "Administrator",
      });

      if (staffError && staffError.code !== "23505") {
        // 23505 is unique constraint violation - staff already exists
        throw staffError;
      }
    }

    // Log the action
    await supabase.from("admin_activity_logs").insert({
      admin_id: currentUser.id,
      action: "user_promoted",
      resource_type: "user",
      resource_id: targetUserId,
      changes: { old_role: "customer", new_role: newRole },
    });

    return {
      success: true,
      message: `User promoted to ${newRole}`,
    };
  } catch (error) {
    console.error("Error promoting user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to promote user",
    };
  }
}

/**
 * Demote an admin back to customer role
 * Only chief_admin can perform this action
 */
export async function demoteUserRole(
  targetUserId: string,
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

    // Remove from admin_staff if exists
    await supabase.from("admin_staff").delete().eq("id", targetUserId);

    // Log the action
    await supabase.from("admin_activity_logs").insert({
      admin_id: currentUser.id,
      action: "user_demoted",
      resource_type: "user",
      resource_id: targetUserId,
      changes: { old_role: oldRole, new_role: "customer" },
    });

    return {
      success: true,
      message: "User demoted to customer",
    };
  } catch (error) {
    console.error("Error demoting user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to demote user",
    };
  }
}

/**
 * Deactivate a user account
 * Only chief_admin can perform this action
 */
export async function deactivateUser(
  targetUserId: string,
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
      return { success: false, error: "Only chief admin can deactivate users" };
    }

    // Deactivate user
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: false })
      .eq("id", targetUserId);

    if (error) throw error;

    // Log the action
    await supabase.from("admin_activity_logs").insert({
      admin_id: currentUser.id,
      action: "user_deactivated",
      resource_type: "user",
      resource_id: targetUserId,
    });

    return {
      success: true,
      message: "User account deactivated",
    };
  } catch (error) {
    console.error("Error deactivating user:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to deactivate user",
    };
  }
}

/**
 * Get all activity logs (admin users only)
 */
export async function getActivityLogs(limit: number = 50) {
  try {
    const supabase = await createClient();

    // Verify user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated", data: null };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!["admin", "agent", "chief_admin"].includes(profile?.role || "")) {
      return { success: false, error: "Unauthorized", data: null };
    }

    const { data, error } = await supabase
      .from("admin_activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch logs",
      data: null,
    };
  }
}
