import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

/**
 * Fetches all upcoming sales, ordered by start date ascending.
 *
 * @returns {{ sales: Array, loading: boolean, error: string|null, refetch: Function }}
 */
export function useSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from('upcoming_sales')
        .select('*')
        .order('start_date', { ascending: true });

      if (queryError) throw queryError;

      setSales(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch sales');
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return { sales, loading, error, refetch: fetchSales };
}

/**
 * Creates a new upcoming sale entry.
 *
 * @param {Object} data - Sale data (title, description, start_date, end_date, discount_percentage, etc.).
 * @returns {Promise<{ data: Object|null, error: string|null }>}
 */
export async function createSale(data) {
  try {
    const { data: sale, error } = await supabase
      .from('upcoming_sales')
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    return { data: sale, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'Failed to create sale' };
  }
}

/**
 * Updates an existing sale by ID.
 *
 * @param {string} id - The sale UUID.
 * @param {Object} data - Fields to update.
 * @returns {Promise<{ data: Object|null, error: string|null }>}
 */
export async function updateSale(id, data) {
  try {
    const { data: sale, error } = await supabase
      .from('upcoming_sales')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { data: sale, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'Failed to update sale' };
  }
}

/**
 * Deletes a sale by ID.
 *
 * @param {string} id - The sale UUID.
 * @returns {Promise<{ error: string|null }>}
 */
export async function deleteSale(id) {
  try {
    const { error } = await supabase
      .from('upcoming_sales')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { error: null };
  } catch (err) {
    return { error: err.message || 'Failed to delete sale' };
  }
}
