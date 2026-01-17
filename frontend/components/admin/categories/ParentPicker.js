"use client";
import { useState, useEffect, useRef } from "react";
import CategoryAPI from "@/utils/api/admin/categories";
import { Input } from "@/components/ui/Input";
import { useAlert } from "@/components/ui/AlertManager";
import { buildCategoryPath } from "@/utils/category";
import { Shimmer } from "@/components/ui/skeletons/SkeletonUtilities";
import { 
  ChevronRight, 
  Search, 
  ArrowLeft, 
  X, 
  Folder, 
  FolderOpen, 
  Check, 
  Home,
  MousePointer2,
  ListTree
} from "lucide-react";

export default function ParentPicker({ value, onChange, apiClient, leafSelectionOnly = false }) {
  const [search, setSearch] = useState("");
  const [path, setPath] = useState([]);
  const [depth, setDepth] = useState(0);
  const [parentCategory, setParentCategory] = useState(undefined);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isFirstRun, setIsFirstRun] = useState(true);
  const [skipNextEffect, setSkipNextEffect] = useState(false);
  
  // Use a Ref to scroll to top of list when navigating
  const listRef = useRef(null);
  
  // Determine API to use
  const api = apiClient || CategoryAPI;

  useEffect(() => {
    let cancelled = false;

    // FIRST RENDER WITH VALUE
    if (isFirstRun) {
      setIsFirstRun(false);

      if (value) {
        setSkipNextEffect(true);
        setResults([value]);
        setParentCategory(value.parentCategory);
        setDepth(value.depth);
        // Use internal _parentPath if available (from selection), otherwise try to build it
        setPath(value._parentPath || (value.parentCategory ? buildCategoryPath(value.parentCategory) : []));
        setLoading(false);

        return () => {
          cancelled = true;
        };
      }
    }

    // SKIP the effect triggered by the above setState calls
    if (skipNextEffect) {
      setSkipNextEffect(false);
      return;
    }

    // NORMAL EFFECT
    const query = {
      sort: JSON.stringify({ field: "name", order: "asc" }),
      filters: JSON.stringify({ depth, parentCategory: parentCategory?._id || parentCategory }),
      search: search.length >= 2 ? search : undefined,
    };

    setLoading(true);

    api.list(query).then((resp) => {
      if (cancelled) return;

      if (resp?.success || resp?.data) {
        setResults(resp.data?.docs || resp.data?.categories || []);
        // Scroll list to top on new data
        if (listRef.current) listRef.current.scrollTop = 0;
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [search, depth, parentCategory]); // eslint-disable-line

  const openNode = (cat) => {
    setDepth(cat.depth + 1);
    setParentCategory(cat);
    
    // If coming from search, we rely on best-effort path building.
    // If browsing normally, we append the clicked category to current path.
    if (search) {
         setPath(buildCategoryPath(cat));
         setSearch(""); 
    } else {
         setPath(prev => [...prev, cat]);
    }
  };

  // Attach path to category object so it persists with the value and can be restored
  const selectNode = (cat) => {
    const categoryWithPath = { ...cat, _parentPath: path };
    onChange?.(categoryWithPath);
  };

  const back = () => {
    if (search.length > 0) {
      setSearch("");
      return;
    }
    
    if (path.length === 0) return;
    
    if (path.length === 1) {
      // Going back to root
      setDepth(0);
      setParentCategory(undefined);
      setPath([]);
    } else {
      // Going back to previous parent
      const newParent = path[path.length - 2];
      
      // Safety check: if we somehow have a string ID or undefined, fallback to root or try to specific depth
      if (!newParent || typeof newParent.depth !== 'number') {
           // Fallback state if path state is corrupted or missing data
           setDepth(Math.max(0, depth - 1));
           // If newParent is an object, use it; if string, use it (might fail depth check but better than crash); if undef, undef.
           setParentCategory(newParent); 
           setPath(path.slice(0, -1));
           return;
      }
      
      setDepth(newParent.depth + 1);
      setParentCategory(newParent);
      setPath(path.slice(0, -1));
    }
  };

  const reset = (e) => {
    e?.preventDefault?.(); // Prevent potential form submission or focus jumps
    setPath([]);
    setDepth(0);
    setParentCategory(undefined);
    setSearch("");
  };

  const navigateToBreadcrumb = (index) => {
    const targetCategory = path[index];
    // We want to navigate *into* this category, so it becomes the active parent
    // The path should end with this category
    const newPath = path.slice(0, index + 1);
    
    setParentCategory(targetCategory);
    setDepth(targetCategory.depth + 1);
    setPath(newPath);
    setSearch("");
  };

  const selectFromSearch = (cat) => {
    onChange?.(cat);
  };
  
  const clearSelection = () => {
    onChange?.(null);
  };

  // Helper for rendering list items to ensure consistency
  const renderListItem = (cat) => {
    const depth = cat.depth || 0;
    // Condition depends on mode
    // Standard mode: prevent selecting depth >= 2 (so we can create children of it)
    // Leaf mode: prevent selecting depth < 2 (must be a leaf)
    
    let disabled = false;
    let label = "Select";
    let statusLabel = null;

    if (leafSelectionOnly) {
       // Must be leaf (depth 2)
       if (depth < 2) {
         disabled = true;
         label = "Open";
       } 
    } else {
       // Must NOT be leaf (depth 0 or 1)
       if (depth >= 2) {
         disabled = true;
         label = "Limit";
         statusLabel = (
             <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                Max Depth
             </span>
         );
       }
    }

    const selected = value && value._id === cat._id;
    const canDrillDown = depth < 2; 
    
    return (
      <div 
        key={cat._id}
        onClick={() => canDrillDown && !selected && !search && openNode(cat)} // Row click opens if drillable
        className={`
          group flex items-center justify-between p-3 border-b border-gray-100 last:border-0 transition-colors cursor-pointer
          ${selected ? 'bg-emerald-50 hover:bg-emerald-100' : 'hover:bg-gray-50 active:bg-gray-100'}
        `}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
          <div className={`
             flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg
             ${selected ? 'bg-emerald-200 text-emerald-700' : 'bg-indigo-50 text-indigo-500'}
          `}>
             {selected ? <Check className="h-4 w-4" /> : <Folder className="h-4 w-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className={`text-sm font-medium truncate ${selected ? 'text-emerald-900' : 'text-gray-900'}`}>
              {cat.name}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
               <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                  Depth {cat.depth}
               </span>
               {statusLabel}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (disabled && canDrillDown) {
                 openNode(cat);
              } else {
                 selectNode(cat);
              }
            }}
            disabled={disabled && !canDrillDown}
            className={`
              h-8 px-3 rounded-md text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5
              ${(disabled && !canDrillDown)
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : selected 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 ring-1 ring-emerald-600' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-300'
              }
            `}
          >
            {selected ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Selected
              </>
            ) : disabled ? (
               // If disabled for selection but drillable, clicking it opens
               canDrillDown ? (
                   <>
                     <FolderOpen className="h-3.5 w-3.5" />
                     {label}
                   </>
               ) : (
                   label
               )
            ) : (
              <>
                <MousePointer2 className="h-3.5 w-3.5" />
                {label}
              </>
            )}
          </button>
          
          {!search && canDrillDown && (
            <button
               type="button"
               onClick={(e) => {
                 e.stopPropagation();
                 openNode(cat);
               }}
               className="h-8 w-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
               aria-label="Open subcategory"
            >
               <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  const LoadingSkeleton = () => (
    <div className="flex flex-col">
       {[1, 2, 3, 4, 5].map((i) => (
         <div key={i} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0">
           <div className="flex items-center gap-3 flex-1">
             <Shimmer className="h-8 w-8 rounded-lg" />
             <div className="flex-1 space-y-2">
               <Shimmer className="h-3 w-32 rounded" />
               <Shimmer className="h-2 w-12 rounded" />
             </div>
           </div>
           <Shimmer className="h-8 w-20 rounded-md" />
         </div>
       ))}
    </div>
  );

  return (
    <div className="flex flex-col border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden h-[500px] w-full max-w-full">
      {/* 1. Header Area: Navigation & Search */}
      <div className="flex-none bg-white border-b border-gray-200 z-10">
        
        {/* Navigation Bar */}
        <div className="flex items-center gap-2 p-2 sm:p-3 overflow-hidden">
           {/* Back Button */}
           <button
             type="button"
             onClick={back}
             disabled={path.length === 0 && !search}
             className={`
               flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-full transition-colors
               ${(path.length > 0 || search) ? 'text-gray-700 hover:bg-gray-100 active:bg-gray-200' : 'text-gray-300 cursor-not-allowed'}
             `}
           >
             <ArrowLeft className="h-5 w-5" />
           </button>

           {/* Breadcrumbs / Title */}
           <div className="flex-1 overflow-x-auto whitespace-nowrap scrollbar-hide">
              {search ? (
                <div className="flex items-center text-sm font-medium text-gray-900">
                   <Search className="h-4 w-4 mr-2 text-indigo-500" />
                   Search Results for "{search}"
                </div>
              ) : (
                <div className="flex items-center text-sm">
                  <button 
                    type="button"
                    onClick={reset}
                    className={`flex items-center hover:bg-gray-50 rounded px-1.5 py-0.5 transition-colors ${path.length === 0 ? 'font-bold text-gray-900 pointer-events-none' : 'text-gray-500 hover:text-indigo-600'}`}
                  >
                    <Home className="h-4 w-4 mr-1.5" />
                    Root
                  </button>
                  {path.map((p, index) => {
                    const isLast = index === path.length - 1;
                    return (
                      <span key={p._id} className="flex items-center">
                        <ChevronRight className="h-4 w-4 text-gray-300 mx-0.5" />
                        <button
                          type="button"
                          onClick={() => !isLast && navigateToBreadcrumb(index)}
                          disabled={isLast}
                          className={`font-medium transition-colors rounded px-1 min-w-0 truncate max-w-[120px] sm:max-w-xs
                            ${isLast 
                              ? 'text-gray-900 font-bold cursor-default' 
                              : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'
                            }`}
                        >
                          {p.name}
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
           </div>
        </div>

        {/* Search Bar */}
        <div className="px-3 pb-3">
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400 bg-gray-50 focus:bg-white"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 hover:bg-gray-200 rounded-full transition-all"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Scrollable List Content */}
      <div 
        ref={listRef}
        className="flex-1 overflow-y-auto bg-white overscroll-contain"
      >
        {loading ? (
           <LoadingSkeleton />
        ) : results.length > 0 ? (
           <div className="flex flex-col pb-safe">
             {results.map(renderListItem)}
           </div>
        ) : (
           <div className="flex flex-col items-center justify-center h-full text-center px-6 py-10">
              <div className="bg-gray-50 p-4 rounded-full mb-3">
                 <ListTree className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-gray-900 font-medium mb-1">No categories found</p>
              <p className="text-xs text-gray-500 max-w-[200px]">
                 {search ? `No matches for "${search}"` : "This folder is empty."}
              </p>
              {search && (
                 <button onClick={() => setSearch("")} className="mt-4 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                    Clear Search
                 </button>
              )}
           </div>
        )}
      </div>

      {/* 3. Footer Selection Info */}
      <div className="flex-none bg-gray-50 border-t border-gray-200 p-3">
         {value ? (
           <div className="flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-3 min-w-0">
                 <div className="flex-shrink-0 h-10 w-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                    <Check className="h-5 w-5" />
                 </div>
                 <div className="min-w-0">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Parent Selected</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{value.name}</p>
                 </div>
              </div>
              <button
                type="button"
                onClick={clearSelection}
                className="flex-shrink-0 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-md hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-sm"
              >
                Clear
              </button>
           </div>
         ) : (
           <div className="flex items-center gap-3 opacity-60">
              <div className="h-10 w-10 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                 <Home className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">No Parent</p>
                 {path.length === 0 ? (
                    <p className="text-xs text-gray-600">Creating Root Category</p>
                 ) : (
                    <p className="text-xs text-gray-600">Navigate to desired parent & click Select</p>
                 )}
              </div>
           </div>
         )}
      </div>
    </div>
  );
}



