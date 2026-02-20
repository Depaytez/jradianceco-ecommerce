/**
 * Product JSON-LD Structured Data Component
 * 
 * Generates schema.org/Product structured data for rich search results.
 */

import { Product } from "@/types";

/**
 * Props for ProductJsonLd component
 */
interface ProductJsonLdProps {
  product: Product;
  baseUrl?: string;
}

/**
 * ProductJsonLd Component
 * 
 * Injects JSON-LD structured data for product rich snippets.
 * This enables Google to display:
 * - Product price
 * - Availability status
 * - Review ratings
 * - Brand information
 */
export default function ProductJsonLd({ product, baseUrl }: ProductJsonLdProps) {
  const siteUrl = baseUrl || process.env.NEXT_PUBLIC_BASE_URL || "https://jradianceco.com";
  
  // Determine product availability
  const availability = product.stock_quantity > 0
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";

  // Calculate review aggregate if needed (would be passed from parent)
  const reviewCount = product.attributes?.reviewCount as number || 0;
  const averageRating = product.attributes?.averageRating as number || 0;

  // Build the structured data object
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images?.[0] ? `${siteUrl}${product.images[0]}` : `${siteUrl}/og-image.jpg`,
    slug: product.slug,
    brand: {
      "@type": "Brand",
      name: product.attributes?.brand as string || "JRADIANCE",
    },
    sku: product.sku || product.id,
    category: product.category,
    offers: {
      "@type": "Offer",
      price: product.discount_price || product.price,
      priceCurrency: "NGN",
      availability: availability,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      url: `${siteUrl}/products/${product.slug}`,
    },
    ...(reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: averageRating.toString(),
        reviewCount: reviewCount.toString(),
        bestRating: "5",
        worstRating: "1",
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
