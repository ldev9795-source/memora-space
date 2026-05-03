const CACHE_NAME = "memora-space-v21";
const ASSETS = [
  "/",
  "/index.html",
  "/supabase.config.js",
  "/src/main.js",
  "/src/lib/supabaseClient.js",
  "/src/store/tasks.js",
  "/src/components/AddTaskSheet.js",
  "/src/components/BottomDock.js",
  "/src/components/CalendarWidget.js",
  "/src/components/TaskItem.js",
  "/src/components/TimelineList.js",
  "/src/components/ViewToggle.js",
  "/src/components/icons.js",
  "/src/views/AllTasks.js",
  "/src/views/Calendar.js",
  "/src/views/Login.js",
  "/src/views/Notes.js",
  "/src/views/Onboarding.js",
  "/src/views/Profile.js",
  "/src/views/Settings.js",
  "/src/views/Stash.js",
  "/src/views/Today.js",
  "/src/styles/globals.css",
  "/src/styles/glassmorphism.css",
  "/src/styles/dock.css",
  "/src/styles/animations.css",
  "/public/manifest.json",
  "/public/favicon-64.png",
  "/public/apple-touch-icon.png",
  "/public/icon-192.png",
  "/public/icon-512.png",
  "/public/logo-mark.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
