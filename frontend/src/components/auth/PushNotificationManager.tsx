import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import api from '@/api/axios';

const VAPID_PUBLIC_KEY = "BDRrrZAbda9__yRjV7NV8_CcYMSKYGrbED7nkXc-pgY7A5Zdk1QGiGhFq-YvRcH6ZBvGxC8EJ1lzdO4GFE78qrU";

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
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

export default function PushNotificationManager() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    async function checkSubscription() {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
      
      if (Notification.permission === 'default') {
        setShowPrompt(true);
      } else if (Notification.permission === 'granted') {
        const registration = await navigator.serviceWorker.register('/sw.js');
        let subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
          const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey
          });
        }
        
        if (subscription) {
          await api.post('/notices/save-subscription/', subscription.toJSON());
        }
      }
    }
    checkSubscription();
  }, []);

  const handleEnablePush = async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setShowPrompt(false);
      const registration = await navigator.serviceWorker.ready;
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });
      await api.post('/notices/save-subscription/', subscription.toJSON());
    } else {
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-primary text-primary-foreground p-3 rounded-xl shadow-xl flex items-center gap-3">
      <Bell className="w-5 h-5" />
      <span className="text-sm font-medium">Enable Notice Alerts</span>
      <button 
        onClick={handleEnablePush}
        className="ml-2 bg-background text-foreground px-3 py-1 rounded-md text-xs font-bold hover:opacity-90"
      >
        Allow
      </button>
      <button 
        onClick={() => setShowPrompt(false)}
        className="text-primary-foreground/70 hover:text-white px-2 text-xl leading-none"
      >
        &times;
      </button>
    </div>
  );
}
