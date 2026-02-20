/**
 * Dynamic Sitemap Generator
 * 
 * Generates sitemap.xml dynamically based on Supabase data.
 */

import { MetadataRoute } from "next";
import {
  getAllProductSlugs,
} from "@/utils/supabase/services-server";

/**
 * Base URL for the site - uses environment variable
 */
const getBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_BASE_URL || "https://jradianceco.com";
};

/**
 * Static routes that should always be in the sitemap
 */
const getStaticRoutes = (baseUrl: string): MetadataRoute.Sitemap => [
  {
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
  },
  {
    url: `${baseUrl}/shop`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    url: `${baseUrl}/about-us`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  },
];

/**
 * Generates the complete sitemap including static routes and dynamic product pages
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  
  // Get static routes
  const staticRoutes = getStaticRoutes(baseUrl);

  // Get dynamic product routes from Supabase
  const products = await getAllProductSlugs();
  
  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(product.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Combine static and dynamic routes
  return [...staticRoutes, ...productRoutes];
}
