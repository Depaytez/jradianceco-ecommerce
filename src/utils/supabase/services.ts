/**
 * Database Services Layer
 * Centralized database operations following DRY principle
 * All queries go through these functions
 */

import { createClient } from "./server";
import type {
  UserProfile,
  Product,
  CartItem,
  Order,
  OrderItem,
  WishlistItem,
  ProductFilters,
  CreateOrderInput,
  ProductReview,

} from "@/types";

/* Profile Services */
export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>,
): Promise<UserProfile | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating profile:", error);
    return null;
  }
}

/* Product Services */
export async function getProducts(
  filters?: ProductFilters,
): Promise<Product[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("products")
      .select("*")
      .eq("is_active", filters?.is_active !== false ? true : undefined);

    if (filters?.category) {
      query = query.eq("category", filters.category);
    }

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
      );
    }

    // Pagination using range
    if (filters?.limit || filters?.offset) {
      const start = filters?.offset ?? 0;
      const limit = filters?.limit ?? 50;
      query = query.range(start, start + limit - 1);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getProductById(
  productId: string,
): Promise<Product | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function getProductsByIds(
  productIds: string[],
): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching products by IDs:", error);
    return [];
  }
}

/* Cart Services */
export async function getCartItems(userId: string): Promise<CartItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cart_items")
      .select("*, products(*)")
      .eq("user_id", userId)
      .order("added_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching cart:", error);
    return [];
  }
}

export async function addToCart(
  userId: string,
  productId: string,
  quantity: number,
): Promise<CartItem | null> {
  try {
    const supabase = await createClient();

    // Check if item already in cart
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .single();

    if (existingItem) {
      // Update quantity
      const { data, error } = await supabase
        .from("cart_items")
        .update({ quantity: existingItem.quantity + quantity })
        .eq("id", existingItem.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    // Insert new item
    const { data, error } = await supabase
      .from("cart_items")
      .insert({
        user_id: userId,
        product_id: productId,
        quantity,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    return null;
  }
}

export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number,
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", cartItemId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating cart item:", error);
    return false;
  }
}

export async function removeFromCart(cartItemId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error removing from cart:", error);
    return false;
  }
}

export async function clearCart(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error clearing cart:", error);
    return false;
  }
}

/* Wishlist Services */

export async function getWishlist(userId: string): Promise<WishlistItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("wishlist")
      .select("*, products(*)")
      .eq("user_id", userId)
      .order("added_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return [];
  }
}

export async function addToWishlist(
  userId: string,
  productId: string,
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("wishlist").insert({
      user_id: userId,
      product_id: productId,
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return false;
  }
}

export async function removeFromWishlist(
  userId: string,
  productId: string,
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("wishlist")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return false;
  }
}

export async function isInWishlist(
  userId: string,
  productId: string,
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("wishlist")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return !!data;
  } catch (error) {
    console.error("Error checking wishlist:", error);
    return false;
  }
}

/* Order Services */

export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
}

export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching order items:", error);
    return [];
  }
}

export async function createOrder(
  userId: string,
  orderData: CreateOrderInput,
): Promise<Order | null> {
  try {
    const supabase = await createClient();

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        order_number: `ORD-${Date.now()}`,
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        shipping_cost: orderData.shipping_cost,
        total_amount: orderData.total_amount,
        shipping_address: orderData.shipping_address || null,
        billing_address: orderData.billing_address || null,
        status: "pending",
        payment_status: "pending",
      })
      .select()
      .single();

    if (orderError) throw orderError;
    if (!order) throw new Error("Failed to create order");

    // Get product names for order items
    const productIds = orderData.items.map((item) => item.product_id);
    const products = await getProductsByIds(productIds);
    const productMap = new Map(products.map((p) => [p.id, p.name]));

    // Add order items
    const orderItems = orderData.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: productMap.get(item.product_id) || "Unknown Product",
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Clear user's cart
    await clearCart(userId);

    return order;
  } catch (error) {
    console.error("Error creating order:", error);
    return null;
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating order status:", error);
    return false;
  }
}

/* Review Services */

export async function getProductReviews(
  productId: string,
): Promise<ProductReview[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("product_reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}

export async function addProductReview(
  productId: string,
  userId: string,
  rating: number,
  title: string | null,
  review_text: string | null,
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("product_reviews").insert({
      product_id: productId,
      user_id: userId,
      rating,
      title,
      review_text,
      is_verified_purchase: false,
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error adding review:", error);
    return false;
  }
}
