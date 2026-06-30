import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import webpush from "npm:web-push"

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Default VAPID keys matching client-side public VAPID key
// Ideally, the user sets custom VAPID keys as Environment Secrets
const PUBLIC_VAPID_KEY = Deno.env.get('PUBLIC_VAPID_KEY') || 'BEl62iPI154yiCYB24CIs49e79YQ4V8009sO4R9Hj24N2hC-9V8-28C8472m-8V948C90C0N114O07312104928';
const PRIVATE_VAPID_KEY = Deno.env.get('PRIVATE_VAPID_KEY') || ''; // User should configure this in Supabase secrets

// Configure VAPID details
if (PRIVATE_VAPID_KEY) {
  webpush.setVapidDetails(
    'mailto:support@shopverse.com',
    PUBLIC_VAPID_KEY,
    PRIVATE_VAPID_KEY
  );
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Authorization header missing');

    const supabaseClient = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user role is admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) throw new Error('Not authenticated');

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized: Admin role required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Parse notification request payload
    const { title, body, url } = await req.json();
    if (!title || !body) throw new Error('Missing title or body');

    // Fetch all active subscriptions
    const { data: subscriptions, error: subsError } = await supabaseClient
      .from('push_subscriptions')
      .select('*');

    if (subsError) throw subsError;

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: 'No active subscriptions' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // If private VAPID key is not set, we can simulate the push dispatch logs
    if (!PRIVATE_VAPID_KEY) {
      console.log('Skipping webpush dispatch: PRIVATE_VAPID_KEY environment secret is not set.');
      return new Response(JSON.stringify({ 
        message: 'Mock Success: Edge function successfully ran. (Set PRIVATE_VAPID_KEY secret to enable real delivery)',
        subscriptionsCount: subscriptions.length
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const payload = JSON.stringify({ title, body, url });
    const sendPromises = subscriptions.map((sub) => {
      return webpush.sendNotification(sub.subscription, payload)
        .catch(async (err) => {
          console.error(`Failed to send to endpoint ${sub.subscription.endpoint}:`, err);
          // If endpoint is expired or invalid (404/410), delete subscription from DB
          if (err.statusCode === 404 || err.statusCode === 410) {
            await supabaseClient.from('push_subscriptions').delete().eq('id', sub.id);
          }
        });
    });

    await Promise.all(sendPromises);

    return new Response(JSON.stringify({ message: 'Push notifications broadcast complete!' }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
});
