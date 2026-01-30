"use client";
import React from "react";
import { X, ChevronRight, Plus, Minus, Trash2 } from "lucide-react";
import Link from "next/link";

// Define a structured type for Cart Items
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
}

export default function CartOverlay({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
}: CartOverlayProps) {
  // Logic to calculate total price for all items in cart
  const totalPrice = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-28 md:pb-32 pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/10 backdrop-blur-[2px] pointer-events-auto"
        onClick={onClose}
      />

      {/* Overlay Card Content to display Cart */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 pointer-events-auto border border-gray-100 mb-6 md:mb-0 flex flex-col">
        {/* Header with close button */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-bold text-radiance-charcoalTextColor">
            Cart
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable list of products */}
        <div className="max-h-[40vh] overflow-y-auto">
          {cart.length > 0 ? (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 rounded-xl border border-gray-50 bg-gray-50/30"
                >
                  {/* Clickable to open product detail */}
                  <Link
                    href={`/shop/${item.id}`}
                    onClick={onClose}
                    className="flex flex-1 items-center justify-between group"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-radiance-charcoalTextColor group-hover:text-radiance-goldColor transition-colors">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium">
                        ₦{item.price.toLocaleString()}
                      </span>
                    </div>
                    {/* ChevronRight used here to indicate the item can be opened */}
                    <ChevronRight
                      size={14}
                      className="text-gray-300 group-hover:text-radiance-goldColor transition-colors mr-2"
                    />
                  </Link>

                  {/* Quantity Selector Logic */}
                  <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-2 py-1 shadow-sm">
                    <button
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="text-gray-400 hover:text-radiance-goldColor transition-colors"
                    >
                      {item.quantity === 1 ? (
                        <Trash2 size={12} className="text-red-400" />
                      ) : (
                        <Minus size={12} />
                      )}
                    </button>

                    <span className="text-xs font-black text-radiance-charcoalTextColor min-width:12px text-center">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="text-gray-400 hover:text-radiance-goldColor transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-4 text-xs font-medium">
              Empty cart
            </p>
          )}
        </div>

        {/* Footer with total calculation and checkout button */}
        {cart.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-medium text-gray-500">
                Total Amount
              </span>
              <span className="text-lg font-black text-radiance-goldColor">
                ₦{totalPrice.toLocaleString()}
              </span>
            </div>

            <button
              className="w-full bg-radiance-goldColor text-white text-xs font-bold py-3 rounded-xl shadow-lg hover:opacity-90 transition-opacity"
              onClick={() => console.log("Proceeding to checkout")}
            >
              Pay to Checkout Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
