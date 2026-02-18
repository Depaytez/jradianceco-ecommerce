import ProductFeeds from "@/components/products/ProductFeeds";
import { getProducts } from "@/utils/supabase/services-server";
import { ProductFilters } from "@/types";

interface ShopPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const filters: ProductFilters = {
    category:
      typeof searchParams.category === "string"
        ? searchParams.category
        : undefined,
    search:
      typeof searchParams.search === "string" ? searchParams.search : undefined,
    limit: 12, // Set a default limit for the initial load
  };

  const initialProducts = await getProducts(filters);

  return (
    <div className="min-h-screen bg-radiance-creamBackgroundColor text-radiance-charcoalTextColor">
      <main className="mx-auto max-w-7xl px-4 md:px-8 py-12">
        <ProductFeeds
          initialProducts={initialProducts}
          initialFilters={filters}
          title="JRadiance Cosmetics & Beauty Shop"
          subtitle="Discover the perfect products for your beauty needs."
        />
      </main>
    </div>
  );
}