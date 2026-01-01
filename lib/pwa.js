/**
 * PWA utilities for EduX
 */

/**
 * Check if service workers are supported
 */
export function isPWASupported() {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator;
}

/**
 * Register service worker
 */
export async function registerServiceWorker() {
  if (!isPWASupported()) {
    console.log('Service workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('Service Worker registered:', registration.scope);

    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      newWorker?.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker available
          dispatchEvent(new CustomEvent('sw-update-available'));
        }
      });
    });

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Unregister service worker
 */
export async function unregisterServiceWorker() {
  if (!isPWASupported()) return false;

  const registration = await navigator.serviceWorker.ready;
  return registration.unregister();
}

/**
 * Check if app is installed (standalone mode)
 */
export function isAppInstalled() {
  if (typeof window === 'undefined') return false;
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

/**
 * Check if app can be installed
 */
let deferredPrompt = null;

export function canInstall() {
  return deferredPrompt !== null;
}

/**
 * Listen for install prompt
 */
export function setupInstallPrompt(callback) {
  if (typeof window === 'undefined') return;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    callback?.(true);
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    callback?.(false);
  });
}

/**
 * Trigger install prompt
 */
export async function promptInstall() {
  if (!deferredPrompt) {
    console.log('Install prompt not available');
    return false;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  
  return outcome === 'accepted';
}

/**
 * Push Notifications
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  return permission;
}

export function getNotificationPermission() {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(vapidPublicKey) {
  if (!isPWASupported()) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    return subscription;
  } catch (error) {
    console.error('Push subscription failed:', error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush() {
  if (!isPWASupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Push unsubscribe failed:', error);
    return false;
  }
}

/**
 * Get current push subscription
 */
export async function getPushSubscription() {
  if (!isPWASupported()) return null;

  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

/**
 * Show local notification
 */
export async function showNotification(title, options = {}) {
  if (!isPWASupported()) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      ...options,
    });
    return true;
  } catch (error) {
    console.error('Show notification failed:', error);
    return false;
  }
}

/**
 * Background Sync
 */
export async function registerBackgroundSync(tag) {
  if (!isPWASupported()) return false;
  if (!('sync' in window.ServiceWorkerRegistration.prototype)) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register(tag);
    return true;
  } catch (error) {
    console.error('Background sync registration failed:', error);
    return false;
  }
}

/**
 * Store data for offline sync
 */
export async function storeForOfflineSync(storeName, data) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('edux-offline', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
      }
    };
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const addRequest = store.add(data);
      
      addRequest.onerror = () => reject(addRequest.error);
      addRequest.onsuccess = () => resolve(addRequest.result);
    };
  });
}

/**
 * Check online status
 */
export function isOnline() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Listen for online/offline changes
 */
export function onConnectivityChange(callback) {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Helper: Convert VAPID key to Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default {
  isPWASupported,
  registerServiceWorker,
  unregisterServiceWorker,
  isAppInstalled,
  canInstall,
  setupInstallPrompt,
  promptInstall,
  requestNotificationPermission,
  getNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  getPushSubscription,
  showNotification,
  registerBackgroundSync,
  storeForOfflineSync,
  isOnline,
  onConnectivityChange,
};
