import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

/**
 * Fetches all addresses for a specific user.
 *
 * @param {string} userId - The user's UUID.
 * @returns {{ addresses: Array, loading: boolean, error: string|null, refetch: Function }}
 */
export function useAddresses(userId) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAddresses = useCallback(async () => {
    if (!userId) {
      setAddresses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;

      setAddresses(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch addresses');
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  return { addresses, loading, error, refetch: fetchAddresses };
}

/**
 * Adds a new address. If `is_default` is true, all other addresses for the
 * same user are first set to non-default.
 *
 * @param {Object} data - Address data including user_id, street, city, state, zip, country, and optionally is_default.
 * @returns {Promise<{ data: Object|null, error: string|null }>}
 */
export async function addAddress(data) {
  try {
    // If this address should be the default, un-default all existing ones first
    if (data.is_default) {
      const { error: resetError } = await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', data.user_id);

      if (resetError) throw resetError;
    }

    const { data: address, error } = await supabase
      .from('addresses')
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    return { data: address, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'Failed to add address' };
  }
}

/**
 * Updates an existing address by ID.
 *
 * @param {string} id - The address UUID.
 * @param {Object} data - Fields to update.
 * @returns {Promise<{ data: Object|null, error: string|null }>}
 */
export async function updateAddress(id, data) {
  try {
    const { data: address, error } = await supabase
      .from('addresses')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { data: address, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'Failed to update address' };
  }
}

/**
 * Deletes an address by ID.
 *
 * @param {string} id - The address UUID.
 * @returns {Promise<{ error: string|null }>}
 */
export async function deleteAddress(id) {
  try {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { error: null };
  } catch (err) {
    return { error: err.message || 'Failed to delete address' };
  }
}
