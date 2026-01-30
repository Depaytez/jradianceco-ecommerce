import { Metadata } from "next";
import Image from "next/image";

const sectionClass = `
  px-0
`

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
      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Heroes section */}
        <section>
          <div className={`heroes-section ${sectionClass}`}>
            <div className="heroe-texts">
              <p>Welcome to</p>
              <h1>JRADIANCE</h1>
              <p>Your organic cosmetics, and beauty store</p>
              <ul>
                <li>Natural Beauty</li>
                <li>Organic Products</li>
                <li>Healthy & Eco-friendly</li>
              </ul>
            </div>
            <div className="heroe-image-persona">
              <Image
                src={'/beauty-model.jpg'}
                alt="heroes image"
                fill
                sizes="(max-width: 768px) 10vw, 50vw"
                priority
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* product image reels section */}
        <section className={`image-reels-section ${sectionClass}`}>
          <div className="image-reels-container">
            {/* add product.length < 12 slide later */}
          </div>
        </section>

        {/* Product list section */}
        <section className={`product-list-section ${sectionClass}`}>
          {/* import product list components */}
        </section>
      </main>
    </div>
  );
}
