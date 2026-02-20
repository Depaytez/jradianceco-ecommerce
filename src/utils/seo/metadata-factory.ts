/**
 * SEO Metadata Factory
 * 
 * Provides reusable functions for generating consistent metadata across the application.
 */

import type { Metadata } from "next";

/**
 * Base configuration for SEO metadata
 */
export interface SEOConfig {
  baseUrl: string;
  siteName: string;
  defaultTitle: string;
  defaultDescription: string;
  locale: string;
  twitterHandle?: string;
}

/**
 * Default SEO configuration for JRADIANCE
 */
export const defaultSEOConfig: SEOConfig = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "https://jradianceco.com",
  siteName: "JRADIANCE",
  defaultTitle: "JRADIANCE | Premium Cosmetics & Skincare",
  defaultDescription: "Authentic skincare and cosmetics for the radiant Nigerian soul.",
  locale: "en_NG",
};

/**
 * Creates base metadata configuration for the application
 * SRP: Only handles base metadata generation
 */
export function createBaseMetadata(config: SEOConfig = defaultSEOConfig): Metadata {
  const { baseUrl, siteName, defaultTitle, defaultDescription, locale } = config;

  return {
    title: {
      default: defaultTitle,
      template: `%s | ${siteName}`,
    },
    description: defaultDescription,
    keywords: [
      "skincare",
      "cosmetics",
      "Nigeria",
      "beauty products",
      "Jradiance",
      "organic",
      "Jradianceco",
      "Africa",
      "premium cosmetics",
      "authentic skincare",
    ],
    authors: [{ name: "Philip Depaytez" }],
    creator: "Philip Depaytez",
    publisher: siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      type: "website",
      locale,
      url: baseUrl,
      siteName,
      title: defaultTitle,
      description: defaultDescription,
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: defaultDescription,
      images: [`${baseUrl}/og-image.jpg`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/icon.png", sizes: "192x192", type: "image/png" },
        { url: "/icon.png", sizes: "512x512", type: "image/png" },
      ],
      apple: "/icon.png",
      shortcut: "/favicon.ico",
    },
    manifest: "/site.webmanifest",
  };
}

/**
 * Creates metadata for product pages
 * SRP: Only handles product-specific metadata
 */
export interface ProductMetadataOptions {
  name: string;
  description?: string | null;
  price: number;
  currency?: string;
  image?: string;
  inStock?: boolean;
  category?: string;
  brand?: string;
}

export function createProductMetadata(
  options: ProductMetadataOptions,
  config: SEOConfig = defaultSEOConfig
): Metadata {
  const { baseUrl, siteName } = config;
  const { name, description, price, currency = "NGN", image, inStock = true, category, brand = siteName } = options;

  const productUrl = `${baseUrl}/products/${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const imageUrl = image || `${baseUrl}/og-image.jpg`;

  return {
    title: name,
    description: description || `Buy ${name} at ${siteName}`,
    keywords: [
      name,
      category || "cosmetics",
      brand,
      "skincare",
      "beauty products",
      currency,
    ].filter(Boolean) as string[],
    openGraph: {
      type: "website",
      locale: config.locale,
      url: productUrl,
      siteName,
      title: name,
      description: description || `Buy ${name} at ${siteName}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description: description || `Buy ${name} at ${siteName}`,
      images: [imageUrl],
    },
  };
}

/**
 * Creates metadata for static pages (About, Contact, etc.)
 * SRP: Only handles static page metadata
 */
export interface StaticPageMetadataOptions {
  title: string;
  description?: string;
  path?: string;
}

export function createStaticPageMetadata(
  options: StaticPageMetadataOptions,
  config: SEOConfig = defaultSEOConfig
): Metadata {
  const { baseUrl } = config;
  const { title, description, path } = options;

  return {
    title,
    description: description || config.defaultDescription,
    openGraph: {
      type: "website",
      locale: config.locale,
      url: path ? `${baseUrl}${path}` : baseUrl,
      siteName: config.siteName,
      title,
      description: description || config.defaultDescription,
    },
  };
}
