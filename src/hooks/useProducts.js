import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

/**
 * Fetches a paginated, filterable, sortable list of products from Supabase.
 *
 * @param {Object} options - Query options.
 * @param {string} [options.category] - Filter by category name.
 * @param {string} [options.search] - Search term matched against product name (case-insensitive).
 * @param {string} [options.sort] - Sort key: 'price_asc' | 'price_desc' | 'newest' | 'rating'. Defaults to newest.
 * @param {number} [options.minPrice] - Minimum price filter (inclusive).
 * @param {number} [options.maxPrice] - Maximum price filter (inclusive).
 * @param {number} [options.page=1] - Current page number (1-indexed).
 * @param {number} [options.limit=12] - Number of products per page.
 * @returns {{ products: Array, loading: boolean, error: string|null, totalPages: number, totalCount: number, refetch: Function }}
 */
export function useProducts({
  category,
  search,
  sort,
  minPrice,
  maxPrice,
  page = 1,
  limit = 12,
} = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('products')
        .select('*, profiles(phone, shop_name)', { count: 'exact' });

      // --- Filters ---
      if (category) {
        query = query.eq('category', category);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      if (minPrice !== undefined && minPrice !== null) {
        query = query.gte('price', minPrice);
      }

      if (maxPrice !== undefined && maxPrice !== null) {
        query = query.lte('price', maxPrice);
      }

      // --- Sorting ---
      switch (sort) {
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      // --- Pagination ---
      const from = (page - 1) * limit;
      const to = page * limit - 1;
      query = query.range(from, to);

      const { data, error: queryError, count } = await query;

      if (queryError) throw queryError;

      setProducts(data || []);
      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / limit));
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category, search, sort, minPrice, maxPrice, page, limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, totalPages, totalCount, refetch: fetchProducts };
}

/**
 * Fetches a single product by its ID.
 *
 * @param {string} id - The product UUID.
 * @returns {{ product: Object|null, loading: boolean, error: string|null }}
 */
export function useProduct(id) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setProduct(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: queryError } = await supabase
          .from('products')
          .select('*, profiles(phone, shop_name)')
          .eq('id', id)
          .single();

        if (queryError) throw queryError;
        if (!cancelled) setProduct(data);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to fetch product');
          setProduct(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { product, loading, error };
}

/**
 * Fetches up to 8 featured products (is_featured = true).
 *
 * @returns {{ products: Array, loading: boolean }}
 */
export function useFeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchFeatured = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('products')
          .select('*, profiles(phone, shop_name)')
          .eq('is_featured', true)
          .limit(8);

        if (error) throw error;
        if (!cancelled) setProducts(data || []);
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchFeatured();

    return () => {
      cancelled = true;
    };
  }, []);

  return { products, loading };
}

/**
 * Fetches up to 8 trending products (is_trending = true).
 *
 * @returns {{ products: Array, loading: boolean }}
 */
export function useTrendingProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchTrending = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('products')
          .select('*, profiles(phone, shop_name)')
          .eq('is_trending', true)
          .limit(8);

        if (error) throw error;
        if (!cancelled) setProducts(data || []);
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTrending();

    return () => {
      cancelled = true;
    };
  }, []);

  return { products, loading };
}

/**
 * Fetches up to 4 related products in the same category, excluding a specific product.
 *
 * @param {string} category - The category to match.
 * @param {string} excludeId - The product ID to exclude from results.
 * @returns {{ products: Array, loading: boolean }}
 */
export function useRelatedProducts(category, excludeId) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) {
      setProducts([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchRelated = async () => {
      try {
        setLoading(true);

        let query = supabase
          .from('products')
          .select('*, profiles(phone, shop_name)')
          .eq('category', category)
          .limit(4);

        if (excludeId) {
          query = query.neq('id', excludeId);
        }

        const { data, error } = await query;

        if (error) throw error;
        if (!cancelled) setProducts(data || []);
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRelated();

    return () => {
      cancelled = true;
    };
  }, [category, excludeId]);

  return { products, loading };
}
