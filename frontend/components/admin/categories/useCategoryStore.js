"use client";
import { useState, useEffect, useCallback } from 'react';

const LS_KEY = 'b2b_admin_categories';

const seed = [
  { id: '1', name: 'Electronics', slug: 'electronics', description: 'Devices & gadgets', parent: null, specifications: [
    { name: 'Brand', type: 'text', required: true },
    { name: 'Model', type: 'text', required: true },
    { name: 'Warranty (Months)', type: 'number', required: false }
  ]},
  { id: '2', name: 'Laptops', slug: 'laptops', description: 'Portable computers', parent: '1', specifications: [
    { name: 'Processor', type: 'text', required: true },
    { name: 'RAM (GB)', type: 'number', required: true },
    { name: 'Storage (GB)', type: 'number', required: true }
  ]},
];

export const slugify = (str) => str.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)+/g,'');

export function useCategoryStore() {
  const [categories, setCategories] = useState(seed);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(LS_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setCategories(parsed);
      }
    } catch (e) { /* ignore */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(LS_KEY, JSON.stringify(categories)); } catch (e) { /* ignore */ }
  }, [categories, ready]);

  const addCategory = useCallback((data) => {
    setCategories(prev => [...prev, { ...data, id: crypto.randomUUID(), slug: slugify(data.name) }]);
  }, []);

  const updateCategory = useCallback((id, patch) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...patch, slug: patch.name ? slugify(patch.name) : c.slug } : c));
  }, []);

  const deleteCategory = useCallback((id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  const bulkDelete = useCallback((ids) => {
    setCategories(prev => prev.filter(c => !ids.includes(c.id)));
  }, []);

  const getById = useCallback((id) => categories.find(c => c.id === id), [categories]);

  return { ready, categories, addCategory, updateCategory, deleteCategory, bulkDelete, getById };
}
