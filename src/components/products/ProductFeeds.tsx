"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { SearchIcon, Filter, Grid, List } from "lucide-react";
import { Product, ProductFilters } from "@/types";
import {
  getProducts,
  getTrendingProducts,
  getBestSellerProducts,
} from "@/utils/supabase/services";
import ProductCard from "./ProductCard";
import ProductDetail from "./ProductDetail";

interface ProductFeedsProps {
  initialProducts?: Product[];
  initialFilters?: ProductFilters;
  showSearch?: boolean;
  showFilters?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
  feedType?: "trending" | "best-sellers" | "all";
}

export default function ProductFeeds({
  initialProducts,
  initialFilters = {},
  showSearch = true,
  showFilters = true,
  title = "Products",
  subtitle,
  className = "",
  feedType = "all",
}: ProductFeedsProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialFilters.search || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialFilters.category || "",
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<
    "newest" | "price-low" | "price-high" | "rating"
  >("newest");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const BATCH_SIZE = initialFilters.limit || 8;

  // Generic product fetcher
  const fetchProductsCallback = useCallback(
    async (filters: ProductFilters, nextPage = 1) => {
      if (nextPage > 1) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const offset = (nextPage - 1) * BATCH_SIZE;

      try {
        let newProducts: Product[] = [];
        if (feedType === "trending") {
          newProducts = await getTrendingProducts(BATCH_SIZE);
        } else if (feedType === "best-sellers") {
          newProducts = await getBestSellerProducts(BATCH_SIZE);
        } else {
          newProducts = await getProducts({
            ...filters,
            limit: BATCH_SIZE,
            offset,
          });
        }

        if (nextPage > 1) {
          setProducts((prev) => [...prev, ...newProducts]);
        } else {
          setProducts(newProducts);
        }

        setHasMore(newProducts.length === BATCH_SIZE);
        setPage(nextPage);
      } catch (err) {
        setError("Failed to load products");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [BATCH_SIZE, feedType],
  );

  // Initial load
  useEffect(() => {
    if (!initialProducts) {
      fetchProductsCallback(initialFilters, 1);
    } else {
      setHasMore(products.length >= BATCH_SIZE);
    }
  }, [
    initialFilters,
    fetchProductsCallback,
    initialProducts,
    products.length,
    BATCH_SIZE,
  ]);

  // Get unique categories from the initial set of products
  const categories = useMemo(() => {
    const allProducts = initialProducts ? initialProducts : products;
    const cats = new Set(allProducts.map((p) => p.category));
    return Array.from(cats).sort();
  }, [products, initialProducts]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProductsCallback(
      { search: searchQuery, category: selectedCategory },
      1,
    );
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    fetchProductsCallback({ search: searchQuery, category: category }, 1);
  };

  // Load more products
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchProductsCallback(
        { search: searchQuery, category: selectedCategory },
        page + 1,
      );
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCloseProductDetail = () => {
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-radiance-goldColor mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => fetchProductsCallback(initialFilters, 1)}
            className="mt-4 px-4 py-2 bg-radiance-goldColor text-white rounded-lg hover:bg-radiance-charcoalTextColor transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="space-y-2">
          {title && (
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900">
              {title}
            </h2>
          )}
          {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
        </div>
      )}

      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="flex flex-col  md:flex-row md:items-center gap-4 justify-between">
          {/* Search Bar */}
          {showSearch && (
            <form
              onSubmit={handleSearch}
              className="w-full relative flex-1 max-w-md mx-auto"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-1.5 pr-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-radiance-goldColor focus:border-transparent text-sm md:text-base"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-radiance-goldColor transition-colors"
                >
                  <SearchIcon size={18} />
                </button>
              </div>
            </form>
          )}

          {/* Filters and Sort */}
          {showFilters && (
            <div className="flex flex-wrap items-center gap-3 w-full justify-center md:w-auto">
              {/* Category Filter */}
              <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-300 px-3 py-1.5 focus-within:ring-2 focus-within:ring-radiance-goldColor">
                <Filter size={16} className="text-gray-500 shrink-0" />
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className=" bg-transparent border-none outline-none text-sm text-gray-700 w-full  "
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort - Note: Sorting is now handled by the backend for 'getProducts'. UI for sorting might need to pass params to fetch. */}
              <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-300 px-3 py-1.5 focus-within:ring-2 focus-within:ring-radiance-goldColor">
                <span className="text-sm text-gray-500 shrink-0 hidden sm:inline">
                  Sort by:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="bg-transparent border-none outline-none text-sm text-gray-700 w-full"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>

              {/* View Mode */}
              <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1 bg-white ml-auto md:ml-0">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded transition-colors ${viewMode === "grid" ? "bg-radiance-goldColor text-white" : "text-gray-500 hover:bg-gray-100"}`}
                  aria-label="Grid view"
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${viewMode === "list" ? "bg-radiance-goldColor text-white" : "text-gray-500 hover:bg-gray-100"}`}
                  aria-label="List view"
                >
                  <List size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid Area Wrapper */}
      <div className="space-y-4">
        {/* Results Count */}
        <div className="text-sm text-gray-500 font-medium">
          {products.length} product
          {products.length !== 1 ? "s" : ""} found
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                : "grid-cols-1 md:grid-cols-2"
            }`}
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onProductClick={handleProductClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-radiance-creamBackgroundColor rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500 font-medium">
              No products found matching your criteria.
            </p>
          </div>
        )}

        {/* "See More" Button */}
        {hasMore && (
          <div className="flex justify-center pt-4">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              // className="bg-radiance-charcoalTextColor text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-radiance-goldColor transition-all shadow-lg disabled:bg-gray-400"
              className="bg-radiance-charcoalTextColor text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-radiance-goldColor transition-all shadow-md hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none min-w-40"
            >
              {/* {loadingMore ? "Loading..." : "See More"} */}
              {loadingMore ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                Loading...
              </span>
            ) : (
              "See More"
            )}
            </button>
          </div>
        )}

        {/* Product Detail Modal */}
        {selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            onClose={handleCloseProductDetail}
          />
        )}
      </div>
    </div>
  );
}
