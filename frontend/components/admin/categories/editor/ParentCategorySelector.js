"use client";
import { useEffect, useState, useCallback } from "react";
import CategoryAPI from "@/utils/api/admin/categories";
import clsx from "clsx";

export default function ParentCategorySelector({
  value,
  onChange,
  disabledDepth,
  maxDepth = 2,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const cats = await CategoryAPI.suggest({
          q: query,
          depth: disabledDepth === 0 ? 0 : undefined,
          limit: 15,
        });
        console.log(" cats", cats);
        setResults(cats.data.categories);
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    };

    load();
  }, [query, disabledDepth]);
  
  useEffect(() => {
    if (value) {
      CategoryAPI.get(value)
        .then((c) => setSelected(c))
        .catch(() => {});
    } else setSelected(null);
  }, [value]);

  const depthWarning =
    selected && selected.depth >= maxDepth - 1
      ? `Selecting this will reach max depth (${maxDepth}).`
      : null;

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search parent categories..."
          className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-red-600 hover:underline"
          >
            Clear
          </button>
        )}
      </div>
      {selected && (
        <div className="text-xs text-gray-600 flex items-center gap-2">
          <span className="font-medium">Selected:</span>
          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[11px]">
            {selected.name}
          </span>
          <span className="text-[10px] text-gray-400">
            depth {selected.depth}
          </span>
          {depthWarning && (
            <span className="text-[10px] text-orange-500">{depthWarning}</span>
          )}
        </div>
      )}
      <div className="border border-gray-200 rounded-lg divide-y max-h-56 overflow-auto bg-white">
        {loading && <div className="p-3 text-xs text-gray-500">Loading...</div>}
        {!loading && results &&
          results.map((r) => (
            <button
              key={r._id}
              type="button"
              disabled={r.depth >= maxDepth}
              onClick={() => onChange(r._id)}
              className={clsx(
                "w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-indigo-50 disabled:opacity-40",
                value === r._id && "bg-indigo-50 font-medium"
              )}
            >
              <span className="text-gray-800">{r.name}</span>
              <span className="text-[10px] text-gray-400">d{r.depth}</span>
            </button>
          ))}
        {!loading && results.length === 0 && (
          <div className="p-3 text-xs text-gray-400">No matches</div>
        )}
        {error && <div className="p-3 text-xs text-red-500">{error}</div>}
      </div>
    </div>
  );
}
