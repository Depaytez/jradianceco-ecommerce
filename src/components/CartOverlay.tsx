"use client";
import React from "react";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import type { CartItem } from "@/types";

interface CartOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
}

export default function CartOverlay({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
}: CartOverlayProps) {
  // Calculate total price for all items in cart
  const totalPrice = cart.reduce((acc, item) => {
    const price = item.product?.discount_price || item.product?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-28 md:pb-32 pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/10 backdrop-blur-[2px] pointer-events-auto"
        onClick={onClose}
      />

      {/* Overlay Card Content */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 pointer-events-auto border border-gray-100 mb-6 md:mb-0 flex flex-col max-h-[70vh]">
        {/* Header with close button */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-radiance-goldColor" />
            <h2 className="text-base font-bold text-radiance-charcoalTextColor">
              Your Cart ({totalItems})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable list of products */}
        <div className="flex-1 overflow-y-auto">
          {cart.length > 0 ? (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 rounded-xl border border-gray-50 bg-gray-50/30"
                >
                  {/* Product Image */}
                  {item.product?.images?.[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <ShoppingBag size={16} className="text-gray-400" />
                    </div>
                  )}

                  {/* Product Info */}
                  <Link
                    href={`/products/${item.product_id}`}
                    onClick={onClose}
                    className="flex-1 group"
                  >
                    <span className="text-xs font-bold text-radiance-charcoalTextColor group-hover:text-radiance-goldColor transition-colors line-clamp-1">
                      {item.product?.name}
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">
                      ₦{(item.product?.discount_price || item.product?.price || 0).toLocaleString()}
                    </span>
                  </Link>

                  {/* Quantity Selector */}
                  <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-lg px-1.5 py-1 shadow-sm">
                    <button
                      onClick={() => {
                        if (item.quantity === 1) {
                          onRemoveItem(item.id);
                        } else {
                          onUpdateQuantity(item.id, -1);
                        }
                      }}
                      className="p-1 text-gray-400 hover:text-radiance-goldColor transition-colors"
                    >
                      {item.quantity === 1 ? (
                        <Trash2 size={12} className="text-red-400" />
                      ) : (
                        <Minus size={12} />
                      )}
                    </button>

                    <span className="text-xs font-black text-radiance-charcoalTextColor min-w-[16px] text-center">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="p-1 text-gray-400 hover:text-radiance-goldColor transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingBag size={48} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm font-medium">Your cart is empty</p>
            </div>
          )}
        </div>

        {/* Footer with total and checkout button */}
        {cart.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-500">
                Total Amount
              </span>
              <span className="text-lg font-black text-radiance-goldColor">
                ₦{totalPrice.toLocaleString()}
              </span>
            </div>

            <Link
              href="/shop/checkout"
              onClick={onClose}
              className="block w-full bg-radiance-goldColor text-white text-xs font-bold py-3 rounded-xl shadow-lg hover:opacity-90 transition-opacity text-center"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
