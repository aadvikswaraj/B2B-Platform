import { useState, useEffect, useRef } from 'react';

/**
 * Simulates an API list endpoint on top of a static dataset.
 * Applies search, filters, sort, pagination and artificial latency.
 *
 * @param {Array} dataset - Full static dataset (acts like DB rows)
 * @param {Object} query - { search, filters:{}, page, pageSize, sort:{key,direction} }
 * @param {Object} options - { searchableKeys: string[] }
 */
export default function useSampleList(dataset, query, { searchableKeys = [] } = {}) {
  const [items, setItems] = useState([]);
  const [totalCount, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef();

  useEffect(() => {
    setLoading(true);
    // Abort previous in‑flight mock call
    if (abortRef.current) clearTimeout(abortRef.current);

    abortRef.current = setTimeout(() => {
      const { search = '', filters = {}, page = 1, pageSize = 10, sort } = query;
      const s = search.trim().toLowerCase();

      // 1. Filter by search
      let working = dataset.filter(row => {
        if (!s) return true;
        if (searchableKeys.length) {
          return searchableKeys.some(k => String(row[k] ?? '').toLowerCase().includes(s));
        }
        return JSON.stringify(row).toLowerCase().includes(s);
      });

      // 2. Apply filters (exact match; empty string ignored)
      working = working.filter(row => Object.entries(filters || {}).every(([key, val]) => {
        if (!val) return true;
        let field = row[key];
        if (val === 'null') return field == null; // explicit parent null case
        if (Array.isArray(field)) return field.map(x => String(x).toLowerCase()).includes(String(val).toLowerCase());
        return String(field ?? '').toLowerCase() === String(val).toLowerCase();
      }));

      // 3. Sort
      if (sort?.key) {
        const { key, direction } = sort;
        working = [...working].sort((a, b) => {
          const av = a[key];
            const bv = b[key];
          if (av == null && bv == null) return 0;
          if (av == null) return 1;
          if (bv == null) return -1;
          if (av < bv) return direction === 'asc' ? -1 : 1;
          if (av > bv) return direction === 'asc' ? 1 : -1;
          return 0;
        });
      }

      // 4. Total before pagination
      const total = working.length;

      // 5. Pagination
      const start = (page - 1) * pageSize;
      const paged = working.slice(start, start + pageSize);

      setItems(paged);
      setTotal(total);
      setLoading(false);
    }, 300); // 300ms artificial latency / debounce

    return () => { if (abortRef.current) clearTimeout(abortRef.current); };
  }, [dataset, query, searchableKeys]);

  return { items, totalCount, loading };
}