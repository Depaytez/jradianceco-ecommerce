import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Leaf, ShieldCheck } from "lucide-react";

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
    url: "https://jradianceco.com",
    siteName: "JRADIANCE",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    type: "website",
  },
  alternates: { canonical: "https://jradianceco.com" },
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
                  Experience the glow of nature with our premium organic cosmetics and beauty essentials.
                </p>
              </div>

              {/* Feature Tags */}
              <ul className="flex flex-wrap gap-4 pt-4">
                <li className="flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-gray-100 px-4 py-2 rounded-full text-xs font-bold">
                  <Sparkles size={14} className="text-radiance-goldColor" /> Natural Beauty
                </li>
                <li className="flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-gray-100 px-4 py-2 rounded-full text-xs font-bold">
                  <Leaf size={14} className="text-radiance-goldColor" /> Organic Products
                </li>
                <li className="flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-gray-100 px-4 py-2 rounded-full text-xs font-bold">
                  <ShieldCheck size={14} className="text-radiance-goldColor" /> Eco-friendly
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

        {/* product image reels section */}
        <section className={`image-reels-section ${sectionClass} border-t border-gray-100`}>
          <div className="image-reels-container">
            <h2 className="text-2xl font-bold mb-8 text-center md:text-left">Trending Now</h2>
            {/* add product.length < 12 slide later */}
            <div className="h-48 rounded-2xl bg-white/30 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 italic text-sm">
              Product reels carousel placeholder
            </div>
          </div>
        </section>

        {/* Product Feeds section */}
        <section className={`product-list-section ${sectionClass}`}>
          <div className="flex justify-between items-end mb-10">
            <div className="space-y-1">
              <h2 className="text-3xl font-black tracking-tight">JRADIANCE Product Feeds</h2>
              <p className="text-gray-500 text-sm">Hand-picked organic solutions for your skin.</p>
            </div>
            <Link href="/shop" className="text-radiance-goldColor font-bold text-sm underline underline-offset-4">
              View all products
            </Link>
          </div>
          
          {/* Grid placeholder for Product list components */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
             {/* import product list components here */}
          </div>
        </section>
      </main>
    </div>
  );
}
