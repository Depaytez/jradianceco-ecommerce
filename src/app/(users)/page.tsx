import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Leaf,
  ShieldCheck,
  Star,
  SearchIcon,
  Play,
  Facebook,
  Instagram,
  X,
  Youtube,
} from "lucide-react";
import ProductFeeds from "@/components/products/ProductFeeds";

// Section wrapper for consistent vertical spacing
const sectionClass = `
  py-12 md:py-20
`;

export const metadata: Metadata = {
  title: {
    default: "JRADIANCE STORE | Organic body care and beauty products ",
    template: "%s | JRADIANCE STORE",
  },
  description:
    "JRADIANCE is a digital market place to shop for organic body care and beauty products",
  openGraph: {
    title: "JRADIANCE STORE",
    description: "Shop for organic body care and beauty products.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}`,
    siteName: "JRADIANCE",
    images: [{ url: "/logo-removebg.png", width: 1200, height: 630 }],
    type: "website",
  },
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL}` },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-radiance-creamBackgroundColor text-radiance-charcoalTextColor">
      <main className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Heroes section */}
        <section className={sectionClass}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Hero Texts */}
            <div className="heroe-texts space-y-6 order-2 md:order-1">
              <div className="space-y-2">
                <p className="text-radiance-goldColor font-bold tracking-widest text-sm uppercase">
                  Welcome to
                </p>
                <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter">
                  JRADIANCE
                </h1>
                <p className="text-lg md:text-xl text-gray-600 max-w-md leading-relaxed">
                  Experience the glow of nature with our premium organic
                  cosmetics and beauty essentials.
                </p>
              </div>

              {/* Feature Tags */}
              <ul className="flex flex-wrap gap-4 pt-4">
                <li className="flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-gray-100 px-4 py-2 rounded-full text-xs font-bold">
                  <Sparkles size={14} className="text-radiance-goldColor" />{" "}
                  Natural Beauty
                </li>
                <li className="flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-gray-100 px-4 py-2 rounded-full text-xs font-bold">
                  <Leaf size={14} className="text-radiance-goldColor" /> Organic
                  Products
                </li>
                <li className="flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-gray-100 px-4 py-2 rounded-full text-xs font-bold">
                  <ShieldCheck size={14} className="text-radiance-goldColor" />{" "}
                  Eco-friendly
                </li>
              </ul>

              <div className="pt-6">
                <Link
                  href="/shop"
                  className="bg-radiance-charcoalTextColor text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-radiance-goldColor transition-all shadow-xl inline-block"
                >
                  Explore Collection
                </Link>
              </div>
            </div>

            {/* Hero Image Container */}
            <div className="heroe-image-persona order-1 md:order-2">
              <div className="relative aspect-4/5 w-full rounded-3xl overflow-hidden ">
                <Image
                  src="/beauty-model-removebg.png"
                  alt="JRADIANCE beauty model"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Presentation Slide Section */}
        <section className={sectionClass}>
          <h2 className="text-3xl font-black tracking-tight mb-8 text-center">
            Our Story
          </h2>
          <div className="relative h-96 rounded-2xl overflow-hidden bg-linear-to-r from-radiance-goldColor to-radiance-creamBackgroundColor flex items-center justify-center">
            {/* Placeholder for presentation slides */}
            <div className="text-center p-8">
              <h3 className="text-2xl font-bold text-radiance-charcoalTextColor mb-4">
                Discover JRADIANCE
              </h3>
              <p className="text-gray-700 max-w-lg mx-auto">
                Learn about our journey, mission, and commitment to natural
                beauty.
              </p>
            </div>
            {/* Navigation dots would go here */}
          </div>
        </section>

        {/* Trending Now section */}
        <section className={sectionClass}>
          <div className="flex justify-between items-end mb-10">
            <div className="space-y-1">
              <h2 className="text-3xl font-black tracking-tight">
                Trending Now
              </h2>
              <p className="text-gray-500 text-sm">
                Most searched and ordered products this week
              </p>
            </div>
            <Link
              href="/shop?filter=trending"
              className="text-radiance-goldColor font-bold text-sm underline underline-offset-4"
            >
              View all trending
            </Link>
          </div>
          {/* ProductFeeds component for trending products */}
          <ProductFeeds
            initialFilters={{ limit: 4 }}
            showSearch={false}
            showFilters={false}
            title=""
            subtitle=""
          />
        </section>

        {/* Best Seller section */}
        <section className={sectionClass}>
          <div className="flex justify-between items-end mb-10">
            <div className="space-y-1">
              <h2 className="text-3xl font-black tracking-tight">
                Best Sellers
              </h2>
              <p className="text-gray-500 text-sm">
                Our most loved and frequently purchased items
              </p>
            </div>
            <Link
              href="/shop?filter=best_sellers"
              className="text-radiance-goldColor font-bold text-sm underline underline-offset-4"
            >
              View all best sellers
            </Link>
          </div>
          {/* ProductFeeds component for best seller products */}
          <ProductFeeds
            initialFilters={{ limit: 4 }}
            showSearch={false}
            showFilters={false}
            title=""
            subtitle=""
          />
        </section>

        {/* Product Demonstration Videos Slides */}
        <section className={sectionClass}>
          <h2 className="text-3xl font-black tracking-tight mb-8 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Example video slide - replace it later with video components */}
            {[1, 2].map((video) => (
              <div
                key={video}
                className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden group"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="h-16 w-16 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="bg-gray-200 w-full h-full" />{" "}
                {/* Placeholder for video thumbnail */}
                <p className="mt-2 text-center font-medium">
                  Demo Video {video}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Product Feeds section - Updated to include search functionality*/}
        <section className={`product-list-section ${sectionClass}`}>
          <div className="mb-10">
            <div className="space-y-1 mb-6">
              <h2 className="text-3xl font-black tracking-tight">
                JRADIANCE Product Feeds
              </h2>
              <p className="text-gray-500 text-sm">
                Hand-picked organic solutions for your skin.
              </p>
            </div>

            {/* Search Box for Product Feeds */}
            <div className="max-w-md mx-auto mb-8">
              <form className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full px-4 py-3 pr-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-radiance-goldColor focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-radiance-goldColor"
                >
                  <SearchIcon size={14} className="text-radiance-goldColor" />
                </button>
              </form>
            </div>

            <div className="flex justify-between items-end">
              <Link
                href="/shop"
                className="text-radiance-goldColor font-bold text-sm underline underline-offset-4"
              >
                View all products
              </Link>
            </div>
          </div>

          {/* Grid placeholder for Product list components - this is the main feed */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Example product card - repeat for each product in feed */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div
                key={item}
                className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-full h-40 bg-gray-200 rounded-lg mb-4"></div>{" "}
                {/* Placeholder image */}
                <h3 className="font-medium text-sm truncate">Product {item}</h3>
                <p className="text-radiance-goldColor font-bold">₦24.99</p>
                <div className="flex items-center mt-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-500 ml-1">(4.3)</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Partner Brands section */}
        <section className={sectionClass}>
          <h2 className="text-3xl font-black tracking-tight mb-8 text-center">
            Our Partners
          </h2>
          <div className="flex flex-wrap justify-center gap-8 items-center">
            {/* Placeholder partner logos - replace with actual logo images later */}
            {["Partner A", "Partner B", "Partner C", "Partner D"].map(
              (partner, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-gray-200 rounded-xl flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-600">
                      {partner}
                    </span>
                  </div>
                </div>
              ),
            )}
          </div>
        </section>

        {/* Recent Activities/News section */}
        <section className={sectionClass}>
          <h2 className="text-3xl font-black tracking-tight mb-8 text-center">
            Latest News & Updates
          </h2>
          <div className="space-y-6">
            {/* Example news item - repeat for each article */}
            {[1, 2, 3].map((news) => (
              <div
                key={news}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="font-bold text-lg mb-2">News Title {news}</h3>
                <p className="text-gray-600 mb-4">
                  A brief summary of the latest update or blog post content...
                </p>
                <div className="text-sm text-gray-500">
                  Published on Feb 5, 2026
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer section */}
        <footer className="py-12 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">JRADIANCE</h3>
              <p className="text-gray-600 text-sm">
                Experience the glow of nature with our premium organic cosmetics
                and beauty essentials.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="/shop" className="hover:text-radiance-goldColor">
                    Shop All
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-radiance-goldColor">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-radiance-goldColor"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-radiance-goldColor">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Customer Care</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link
                    href="/shipping"
                    className="hover:text-radiance-goldColor"
                  >
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link
                    href="/returns"
                    className="hover:text-radiance-goldColor"
                  >
                    Returns & Exchanges
                  </Link>
                </li>
                <li>
                  <Link
                    href="/support"
                    className="hover:text-radiance-goldColor"
                  >
                    Support Center
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect With Us</h4>
              <div className="flex space-x-4">
                {/* Placeholder for social icons */}
                <Link
                  href="#"
                  className="text-gray-600 hover:text-radiance-goldColor"
                >
                  <Facebook size={14} className="text-radiance-goldColor" />
                </Link>
                <Link
                  href="#"
                  className="text-gray-600 hover:text-radiance-goldColor"
                >
                  <Instagram size={14} className="text-radiance-goldColor" />
                </Link>
                <Link
                  href="#"
                  className="text-gray-600 hover:text-radiance-goldColor"
                >
                  <X size={14} className="text-radiance-goldColor" />
                </Link>
                <Link
                  href="#"
                  className="text-gray-600 hover:text-radiance-goldColor"
                >
                  <Youtube size={14} className="text-radiance-goldColor" />
                </Link>
              </div>
              <p className="mt-4 text-sm text-gray-600">info@jradianceco.com</p>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-500">
            <p>
              &copy; {new Date().getFullYear()} JRADIANCE. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
