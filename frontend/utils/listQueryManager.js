import { useState, useEffect } from "react";
import { useAlert } from "@/components/ui/AlertManager";

// Pure utility - transform query to API params
const transformQuery = (q) => {
  const params = { ...q };
  if (params.sort?.key) {
    params.sort = JSON.stringify({ field: params.sort.key, order: params.sort.direction });
  } else {
    delete params.sort;
  }
  if (params.filters && typeof params.filters === "object") {
    const clean = Object.fromEntries(
      Object.entries(params.filters).filter(([_, v]) => v !== "" && v != null)
    );
    params.filters = Object.keys(clean).length ? JSON.stringify(clean) : undefined;
    if (!params.filters) delete params.filters;
  }
  if (!params.search) delete params.search;
  return params;
};

export function useListQuery({ apiFn, initialQuery = {} }) {
  const pushAlert = useAlert();
  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState({
    search: "",
    filters: {},
    page: 1,
    pageSize: 10,
    sort: { key: "createdAt", direction: "desc" },
    ...initialQuery,
  });

  // Fetch on query change
  useEffect(() => {
    let cancelled = false;
    
    const fetchList = async () => {
      setLoading(true);
      try {
        const res = await apiFn(transformQuery(query));
        if (cancelled) return;
        if (res.success) {
          setItems(res.data?.docs || res.data?.items || []);
          setTotalCount(res.data?.totalCount || 0);
        } else {
          pushAlert("error", res.message || "Failed to fetch");
          setItems([]);
          setTotalCount(0);
        }
      } catch (e) {
        if (cancelled) return;
        pushAlert("error", e.message || "Network error");
        setItems([]);
        setTotalCount(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchList();
    return () => { cancelled = true; };
  }, [query]);

  // Manual refetch function
  const refetch = () => setQuery((q) => ({ ...q }));

  // Handlers to spread into ManagementPanel
  const handlers = {
    search: query.search,
    activeFilters: query.filters,
    sort: query.sort,
    page: query.page,
    pageSize: query.pageSize,
    onSearchChange: (v) => setQuery((p) => ({ ...p, search: v, page: 1 })),
    onFilterChange: (f) => setQuery((p) => ({ ...p, filters: f, page: 1 })),
    onSortChange: (s) => setQuery((p) => ({ ...p, sort: s, page: 1 })),
    onPageChange: (pg) => setQuery((p) => ({ ...p, page: pg })),
    onPageSizeChange: (ps) => setQuery((p) => ({ ...p, pageSize: ps, page: 1 })),
    enableSorting: true,
  };

  return { 
    items, 
    setItems,
    totalCount, 
    setTotalCount,
    loading, 
    query,
    setQuery,
    handlers, 
    refetch 
  };
}

export default useListQuery;
