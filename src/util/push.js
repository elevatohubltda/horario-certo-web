import { subscribe } from "../services/endpoints/push";

const PUBLIC_VAPID_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY;

export default async function enableNotifications() {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
  });

  await subscribe(subscription);
}

export function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}