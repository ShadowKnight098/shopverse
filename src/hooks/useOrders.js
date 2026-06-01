import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

/**
 * Fetches all orders for a specific user, including their line items.
 * Orders are sorted by creation date (newest first).
 *
 * @param {string} userId - The user's UUID.
 * @returns {{ orders: Array, loading: boolean, error: string|null, refetch: Function }}
 */
export function useOrders(userId) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!userId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch orders for this user
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch order items for each order
      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);

          if (itemsError) {
            console.error(`Failed to fetch items for order ${order.id}:`, itemsError.message);
            return { ...order, items: [] };
          }

          return { ...order, items: items || [] };
        })
      );

      setOrders(ordersWithItems);
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders };
}

/**
 * Admin hook: fetches ALL orders across all users, joined with profile info.
 * Orders are sorted by creation date (newest first).
 *
 * @returns {{ orders: Array, loading: boolean, error: string|null, refetch: Function }}
 */
export function useAllOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from('orders')
        .select('*, profiles(*)')
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;

      setOrders(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch all orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  return { orders, loading, error, refetch: fetchAllOrders };
}

/**
 * Creates a new order with its associated line items.
 *
 * @param {Object} params
 * @param {string} params.userId - The ordering user's UUID.
 * @param {Array<Object>} params.items - Array of items, each with: product_id, product_name, product_image, quantity, price.
 * @param {number} params.totalAmount - The total order amount.
 * @param {Object} params.shippingAddress - The shipping address object.
 * @returns {Promise<{ data: Object|null, error: string|null }>}
 */
export async function createOrder({ userId, items, totalAmount, shippingAddress }) {
  try {
    // 1. Insert the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total_amount: totalAmount,
        shipping_address: shippingAddress,
        status: 'Pending Payment',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Insert all order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_image: item.product_image,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return { data: order, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'Failed to create order' };
  }
}

/**
 * Updates the status of an existing order.
 *
 * @param {string} orderId - The order UUID.
 * @param {string} newStatus - The new status value.
 * @returns {Promise<{ data: Object|null, error: string|null }>}
 */
export async function updateOrderStatus(orderId, newStatus) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'Failed to update order status' };
  }
}
