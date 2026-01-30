"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ShoppingCart,
  Heart,
  Presentation,
  ShoppingBag,
  GalleryVerticalEnd,
} from "lucide-react";
import CartOverlay, { CartItem } from "./CartOverlay";

// Navigation component for all pages except pages with "/admin/*"
export default function BottomNavBar() {
  //use to highlight active route on navbar
  const pathname = usePathname();

  // State to manage the cart overlay visibility
  const [isCartOpen, setIsCartOpen] = useState(false);

  // State for cart items
  const [cart, setCart] = useState<CartItem[]>([]);

  // Effect to load cart data from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error loading cart:", e);
      }
    }
  }, []);

  // Handler to update product quantities or remove items
  const handleUpdateQuantity = (id: string, delta: number) => {
    const updatedCart = cart
      .map((item) => {
        if (item.id === id) {
          return { ...item, quantity: Math.max(0, item.quantity + delta) };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // Logic to hide Home and AboutUs on /shop or /admin routes
  const isHiddenRoute =
    pathname?.startsWith("/shop") || pathname?.startsWith("/admin");

  // Defines routes, labels, icons, and dynamic badges for navitems
  const allNavItems = [
    { href: "/", label: "Home", icon: Home, hideOnSpecial: true },
    { href: "/shop", label: "Shop", icon: ShoppingBag },
    { href: "/shop/history", label: "History", icon: GalleryVerticalEnd },
    { href: "/shop/wish-list", label: "Wish", icon: Heart },
    {
      href: "/about-us",
      label: "AboutUs",
      icon: Presentation,
      hideOnSpecial: true,
    },
  ];

  // Filter items based on the current route
  const visibleNavItems = allNavItems.filter(
    (item) => !(isHiddenRoute && item.hideOnSpecial),
  );

  // Return null if we are on an admin page (entirely hiding the bar if desired)
  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      {/* Separated Cart Overlay Component */}
      <CartOverlay
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
      />

      {/* Positioning wrapper: flex-col (mobile) -> flex-row (desktop) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:bottom-8 flex flex-col items-end md:flex-row md:items-center md:justify-center gap-2 px-3 pb-3 md:pb-0 pointer-events-none">
        {/* Separated Cart Button */}
        <button
          onClick={() => setIsCartOpen(!isCartOpen)}
          className={`
            pointer-events-auto relative flex items-center justify-center p-2.5 transition-all shadow-md
            rounded-full border border-gray-100 md:order-last
            ${
              isCartOpen
                ? "bg-radiance-goldColor text-white"
                : "bg-white/95 backdrop-blur-md text-radiance-charcoalTextColor hover:text-radiance-goldColor"
            }
          `}
        >
          <div className="relative">
            <ShoppingCart
              size={20}
              strokeWidth={isCartOpen ? 2.5 : 2}
              className="shrink-0"
            />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-radiance-goldColor text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center border border-white">
                {cart.length}
              </span>
            )}
          </div>
          <span className="sr-only">Cart</span>
        </button>

        {/* Navigation Bar Pill */}
        <nav className="pointer-events-auto w-full md:w-fit bg-white/95 backdrop-blur-md border md:border border-gray-200/50 rounded-xl md:rounded-full shadow-lg">
          <div className="flex items-center justify-around md:justify-center md:gap-6 px-2 py-2 md:px-6">
            {visibleNavItems.map((navItem) => {
              const isActive = pathname === navItem.href;
              const Icon = navItem.icon;

              return (
                <Link
                  key={navItem.href}
                  href={navItem.href}
                  className={`
                    relative flex flex-col items-center gap-0.5 px-3 py-1 transition-colors 
                    ${isActive ? "text-radiance-goldColor" : "text-radiance-charcoalTextColor hover:text-radiance-goldColor"}
                  `}
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 2}
                    className="shrink-0"
                  />
                  <span className="text-[10px] font-semibold">
                    {navItem.label}
                  </span>
                  {isActive && (
                    <div className="absolute -bottom-1 w-1 h-1 bg-radiance-amberAccentColor rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}
