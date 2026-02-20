/**
 * Product Detail Page
 * 
 * SEO-optimized product page with:
 * - Dynamic metadata generation
 * - JSON-LD structured data
 * - Server-side rendering for optimal SEO
 * - Breadcrumb navigation
 */

import { notFound } from "next/navigation";
import Image from "next/image";
import { Star, ShoppingCart, Heart, Share2 } from "lucide-react";
import { Product } from "@/types";
import { getProductBySlug } from "@/utils/supabase/services-server";
import { createProductMetadata } from "@/utils/seo/metadata-factory";
import ProductJsonLd from "@/components/seo/ProductJsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import RichViewer from "@/components/products/RichViewer";

/**
 * Page props from Next.js routing
 */
interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generate dynamic metadata for SEO
 * This runs at build time for static generation or request time for SSR
 */
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<ReturnType<typeof createProductMetadata>> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }

  return createProductMetadata({
    name: product.name,
    description: product.description,
    price: product.discount_price || product.price,
    currency: "NGN",
    image: product.images?.[0],
    inStock: product.stock_quantity > 0,
    category: product.category,
    brand: "JRADIANCE",
  });
}

/**
 * Generate static params for pre-rendering
 * This enables static site generation for all products
 */
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  // Import here to avoid circular dependencies
  const { getAllProductSlugs } = await import(
    "@/utils/supabase/services-server"
  );

  const products = await getAllProductSlugs();

  return products.map((product) => ({
    slug: product.slug,
  }));
}

/**
 * Product Detail Page Component
 */
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Calculate display price
  const displayPrice = product.discount_price || product.price;
  const hasDiscount =
    product.discount_price && product.discount_price < product.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.price - product.discount_price!) / product.price) * 100
      )
    : 0;

  // Build breadcrumb items
  const breadcrumbItems = [
    { name: "Home", url: "/", position: 1 },
    { name: "Shop", url: "/shop", position: 2 },
    { name: product.category, url: `/shop?category=${product.category}`, position: 3 },
    { name: product.name, url: `/products/${slug}`, position: 4 },
  ];

  return (
    <div className="min-h-screen bg-radiance-creamBackgroundColor text-radiance-charcoalTextColor">
      {/* Structured Data for SEO */}
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd items={breadcrumbItems} />

      <article className="mx-auto max-w-7xl px-4 md:px-8 py-12">
        {/* Breadcrumb Navigation */}
        <nav className="mb-8 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            {breadcrumbItems.map((item, index) => (
              <li key={item.position} className="flex items-center">
                {index > 0 && (
                  <span className="mx-2 text-gray-400">/</span>
                )}
                {index === breadcrumbItems.length - 1 ? (
                  <span className="text-gray-500" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <a
                    href={item.url}
                    className="text-radiance-goldColor hover:underline"
                  >
                    {item.name}
                  </a>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <section aria-label="Product images" className="space-y-4">
            <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
              {product.images?.[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ShoppingCart size={64} />
                </div>
              )}

              {/* Discount Badge */}
              {hasDiscount && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold">
                  -{discountPercentage}%
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200"
                  >
                    <Image
                      src={image}
                      alt={`${product.name} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 25vw, 12vw"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Product Info */}
          <section aria-label="Product details" className="space-y-6">
            {/* Category and SKU */}
            <div className="space-y-2">
              <p className="text-sm text-gray-500 uppercase tracking-wider">
                {product.category}
              </p>
              {product.sku && (
                <p className="text-sm text-gray-500">SKU: {product.sku}</p>
              )}
            </div>

            {/* Product Name */}
            <h1 className="text-3xl md:text-4xl font-bold text-radiance-charcoalTextColor">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-radiance-goldColor">
                ₦{displayPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-2xl text-gray-500 line-through">
                    ₦{product.price.toLocaleString()}
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="text-base">
              {product.stock_quantity > 0 ? (
                <span className="text-green-600 font-medium">
                  ✓ In Stock ({product.stock_quantity} available)
                </span>
              ) : (
                <span className="text-red-600 font-medium">
                  ✗ Out of Stock
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="space-y-2">
                <h2 className="font-semibold text-lg text-radiance-charcoalTextColor">
                  Description
                </h2>
                <div className="prose prose-zinc max-w-none">
                  <RichViewer content={product.description} />
                </div>
              </div>
            )}

            {/* Product Attributes */}
            {product.attributes &&
              Object.keys(product.attributes).length > 0 && (
                <div className="space-y-2">
                  <h2 className="font-semibold text-lg text-radiance-charcoalTextColor">
                    Product Details
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(product.attributes).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="font-medium capitalize">
                          {key.replace(/_/g, " ")}:
                        </span>
                        <span className="ml-2 text-gray-600">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Action Buttons */}
            {product.stock_quantity > 0 && (
              <div className="space-y-4 pt-6 border-t border-gray-200">
                <div className="flex gap-3">
                  <button
                    className="flex-1 bg-radiance-charcoalTextColor text-white py-4 px-6 rounded-full font-bold text-base hover:bg-radiance-goldColor transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    aria-label={`Add ${product.name} to cart`}
                  >
                    <ShoppingCart size={20} />
                    Add to Cart
                  </button>
                  <button
                    className="p-4 border-2 border-gray-300 rounded-full hover:bg-gray-50 transition-colors text-gray-600 hover:text-red-500"
                    aria-label="Add to wishlist"
                  >
                    <Heart size={20} />
                  </button>
                  <button
                    className="p-4 border-2 border-gray-300 rounded-full hover:bg-gray-50 transition-colors text-gray-600"
                    aria-label="Share product"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Additional Product Information Section */}
        <section className="mt-16 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold mb-6">Product Information</h2>
          <div className="prose prose-zinc max-w-none">
            <p className="text-gray-600">
              {product.description || `Discover ${product.name}, a premium ${product.category.toLowerCase()} product from JRADIANCE. Designed for quality and authenticity.`}
            </p>
          </div>
        </section>
      </article>
    </div>
  );
}
