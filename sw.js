const CACHE_NAME = 'rehab-menu-v1';
const URLS_TO_CACHE = [
  './index.html',
  './patient.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

// インストール時：必要なファイルをキャッシュに保存
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
});

// 古いキャッシュの削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
});

// リクエスト時：キャッシュ優先、なければネットワーク
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
