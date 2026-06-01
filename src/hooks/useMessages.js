import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

/**
 * Admin hook: fetches all contact messages, ordered by creation date (newest first).
 *
 * @returns {{ messages: Array, loading: boolean, error: string|null, refetch: Function }}
 */
export function useMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;

      setMessages(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch messages');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return { messages, loading, error, refetch: fetchMessages };
}

/**
 * Marks a contact message as read.
 *
 * @param {string} id - The message UUID.
 * @returns {Promise<{ error: string|null }>}
 */
export async function markAsRead(id) {
  try {
    const { error } = await supabase
      .from('contact_messages')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;

    return { error: null };
  } catch (err) {
    return { error: err.message || 'Failed to mark message as read' };
  }
}

/**
 * Deletes a contact message by ID.
 *
 * @param {string} id - The message UUID.
 * @returns {Promise<{ error: string|null }>}
 */
export async function deleteMessage(id) {
  try {
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { error: null };
  } catch (err) {
    return { error: err.message || 'Failed to delete message' };
  }
}
