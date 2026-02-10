self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  self.clients.claim();
});

self.addEventListener("push", event => {
  const data = event.data?.json() || {};

  self.registration.showNotification(data.title || "Notificação", {
    body: data.body || "",
    icon: "/icons/horario-certo-icone.png"
  });
});
