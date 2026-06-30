import { supabase } from '../lib/supabase';

// Standard public VAPID key for Web Push (replace with your own using web-push library)
const PUBLIC_VAPID_KEY = 'BEl62iPI154yiCYB24CIs49e79YQ4V8009sO4R9Hj24N2hC-9V8-28C8472m-8V948C90C0N114O07312104928';

// Store deferred PWA install prompt
let deferredPrompt = null;
const installListeners = new Set();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    notifyInstallListeners();
  });
}

function notifyInstallListeners() {
  installListeners.forEach(listener => listener(!!deferredPrompt));
}

// Convert Base64 URL Safe string to Uint8Array for applicationServerKey
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Registers the Service Worker.
 */
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration.scope);
      return registration;
    } catch (err) {
      console.error('Service Worker registration failed:', err);
    }
  }
}

/**
 * Subscribes to the PWA install prompt change.
 */
export function subscribeToInstallPrompt(callback) {
  installListeners.add(callback);
  callback(!!deferredPrompt);
  return () => {
    installListeners.delete(callback);
  };
}

/**
 * Triggers the browser install prompt.
 */
export async function installPWA() {
  if (!deferredPrompt) {
    console.warn('Install prompt is not available yet.');
    return false;
  }
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`User response to install prompt: ${outcome}`);
  deferredPrompt = null;
  notifyInstallListeners();
  return outcome === 'accepted';
}

/**
 * Checks if Push Notifications are supported and active.
 */
export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/**
 * Fetches the current notification permission state.
 */
export function getNotificationPermission() {
  if (!isPushSupported()) return 'denied';
  return Notification.permission;
}

/**
 * Registers / Subscribes a user to Push Notifications.
 */
export async function subscribeToPush(userId) {
  if (!isPushSupported()) {
    throw new Error('Push notifications are not supported in this browser.');
  }

  // Request notification permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Permission not granted for notifications.');
  }

  const registration = await navigator.serviceWorker.ready;
  
  // Find or create Push Subscription
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    try {
      const convertedVapidKey = urlBase64ToUint8Array(PUBLIC_VAPID_KEY);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
    } catch (error) {
      console.error('Error during push registration subscription', error);
      // Fallback for offline/local notification registration if server VAPID setup fails
      if (!userId) return null;
    }
  }

  // Save the subscription object to Supabase database for targeting
  if (userId && subscription) {
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        subscription: subscription.toJSON()
      }, { onConflict: 'user_id' }); // Link one active subscription per user profile for simple targeting

    if (error) {
      console.error('Error saving subscription to Supabase:', error.message);
      throw error;
    }
  }

  return subscription;
}

/**
 * Unsubscribes a user from Push Notifications.
 */
export async function unsubscribeFromPush(userId) {
  if (!isPushSupported()) return;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    await subscription.unsubscribe();
  }

  // Remove subscription from Supabase
  if (userId) {
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing subscription from Supabase:', error.message);
    }
  }
}

/**
 * Sends a local simulated notification (ideal for testing offline PWA functionality).
 */
export async function triggerLocalTestNotification(title, body, delayMs = 3000) {
  if (!('serviceWorker' in navigator)) return;
  
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.warn('Notifications permission is not granted.');
    return;
  }

  setTimeout(async () => {
    const registration = await navigator.serviceWorker.ready;
    registration.showNotification(title || 'ShopVerse Test Push', {
      body: body || 'This is a simulated PWA notification triggered from your client settings.',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      vibrate: [100, 50, 100],
      data: {
        url: '/'
      }
    });
  }, delayMs);
}
