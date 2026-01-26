import SearchClient from "./SearchClient";
import { searchProducts, parseSearchParams } from "@/utils/api/search";

export const metadata = {
  title: "Search Products | B2B Platform",
  description: "Browse thousands of industrial products from verified sellers.",
};

export default async function SearchPage({ searchParams }) {
  // Await searchParams (Next.js 15+ requirement)
  const resolvedParams = await searchParams;
  
  // Parse and normalize search params
  const params = parseSearchParams(resolvedParams);

  // Fetch search results from backend
  const result = await searchProducts(params);

  // Extract data with defaults
  const {
    products = [],
    categories = [],
    pagination = {},
    query = {},
  } = result?.data || {};

  return (
    <SearchClient
      products={products}
      categories={categories}
      pagination={pagination}
      searchQuery={query}
    />
  );
}
