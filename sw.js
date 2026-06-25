// sw.js — Service Worker（オフライン対応）
// バージョンを変えるとキャッシュが更新される
const CACHE_NAME = 'training-menu-v2';

// キャッシュするファイルのリスト
const CACHE_FILES = [
  './',
  './index.html',
  './patient.html',   // 患者画面があれば
];

// ── インストール時：ファイルをキャッシュに保存 ──────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // patient.htmlがない場合もエラーにならないよう個別にtry
      return Promise.allSettled(
        CACHE_FILES.map(url => cache.add(url).catch(() => {}))
      );
    })
  );
  self.skipWaiting(); // 即座に新しいSWを有効化
});

// ── アクティベート時：古いキャッシュを削除 ──────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim(); // 開いているページにすぐ適用
});

// ── フェッチ時：ネット優先、失敗したらキャッシュを返す ──
// 「ネット優先」= Wi-Fiが繋がっていれば最新版を取得
//              = Wi-Fiが切れていてもキャッシュから動く
self.addEventListener('fetch', event => {
  // chrome-extension や POST は無視
  if (!event.request.url.startsWith('http')) return;
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // ネット成功 → キャッシュも更新してから返す
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => {
        // ネット失敗（Wi-Fi切断中）→ キャッシュから返す
        return caches.match(event.request);
      })
  );
});
