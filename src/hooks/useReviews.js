import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

/**
 * Fetches all reviews for a specific product, joined with reviewer profile info.
 *
 * @param {string} productId - The product UUID.
 * @returns {{ reviews: Array, loading: boolean, error: string|null, refetch: Function }}
 */
export function useReviews(productId) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(async () => {
    if (!productId) {
      setReviews([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from('reviews')
        .select('*, profiles(full_name, avatar_url)')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;

      setReviews(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return { reviews, loading, error, refetch: fetchReviews };
}

/**
 * Adds a new review for a product and recalculates the product's average rating
 * and review count.
 *
 * @param {Object} params
 * @param {string} params.userId - The reviewer's user UUID.
 * @param {string} params.productId - The product UUID.
 * @param {number} params.rating - Rating value (e.g., 1–5).
 * @param {string} params.comment - Review text.
 * @returns {Promise<{ data: Object|null, error: string|null }>}
 */
export async function addReview({ userId, productId, rating, comment }) {
  try {
    // 1. Insert the review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        user_id: userId,
        product_id: productId,
        rating,
        comment,
      })
      .select()
      .single();

    if (reviewError) throw reviewError;

    // 2. Recalculate the product's average rating and review count
    const { data: allReviews, error: fetchError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId);

    if (fetchError) throw fetchError;

    const reviewCount = allReviews.length;
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount;

    const { error: updateError } = await supabase
      .from('products')
      .update({
        rating: Math.round(avgRating * 100) / 100, // round to 2 decimals
        review_count: reviewCount,
      })
      .eq('id', productId);

    if (updateError) throw updateError;

    return { data: review, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'Failed to add review' };
  }
}
