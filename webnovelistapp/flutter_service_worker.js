'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"assets/AssetManifest.bin": "4b142c71b28e34cfb74508b130e83f27",
"assets/AssetManifest.bin.json": "4edd2defbc75246943f9bb72213c39d7",
"assets/AssetManifest.json": "833393ba892a4a96b9aa89b8fda70799",
"assets/assets/boat.png": "2ec47085a8bc575b731e43445a990a78",
"assets/assets/cactus.png": "5d7e19db081260700345859f83d3a0de",
"assets/assets/faqs_en.json": "ef84d8b6344315f9edd9b507aa143d68",
"assets/assets/faqs_es.json": "c0bf7bbdcc157456148062894215507f",
"assets/assets/faqs_fr.json": "9d3292b21cdd1fff4bb44d7ca67c1bda",
"assets/assets/faqs_it.json": "e2f78b7fecc3294abc27e12d1e501475",
"assets/assets/faqs_pt.json": "908457a9820a0d5469ba77f4f96d1f6c",
"assets/assets/intro.jpg": "fbd51fd6083ce3b436836253118fbca5",
"assets/assets/logo_dark.png": "f000d7057b0e3f42c20368e7551d1ea9",
"assets/assets/logo_light.png": "8eb8536d54c4f73d0b82b381d5aa0b93",
"assets/assets/mountain.png": "94fdb1df2af9efd7924f817c35c83692",
"assets/assets/pexels.png": "686c522f92edf991c6bfee1cf9be2be1",
"assets/assets/planet.png": "c261092109d716a1a024b7c4fa3166f0",
"assets/assets/privacy_policy.html": "c6e139ffc8ee6dacde7fd56e1dda0ef1",
"assets/assets/privacy_policy_dark.html": "dd3f9cfe7c4df41c996b7d7629aaef1e",
"assets/assets/quickstart_en.html": "0aae0274d933eab4ca691fd77d2550dd",
"assets/assets/quickstart_es.html": "d9859fd2e10735f1ebb39f48a19c3638",
"assets/assets/quickstart_fr.html": "8dcda68fb2779f75d520a3ab980b5941",
"assets/assets/quickstart_it.html": "0fe683484119f4042426b28cb8bca83e",
"assets/assets/quickstart_pt.html": "b17a34d9a4f7e7370a3326fca377afa2",
"assets/assets/sample.nov": "69dfc85a3f94c9e84f5e75a22ed58587",
"assets/assets/telescope.png": "50b6c9520ce118f5f337b67ba09fc57c",
"assets/assets/template_empty.json": "abb55573072606dd7ed57bada009bdc4",
"assets/assets/template_standard_novel.json": "b616fec78f5c8acd901ed45814b5e3ac",
"assets/assets/terms_and_conditions.html": "1425be1c35d4c8ec58b6f17bdd44d5b0",
"assets/assets/terms_and_conditions_dark.html": "6096010aa325d1c48bcca02810f933a5",
"assets/FontManifest.json": "3ddd9b2ab1c2ae162d46e3cc7b78ba88",
"assets/fonts/MaterialIcons-Regular.otf": "45777537d12695d9b4c573ecc4558a9e",
"assets/NOTICES": "fcfa001d470ba13e945376cddad75bad",
"assets/packages/font_awesome_flutter/lib/fonts/fa-brands-400.ttf": "4769f3245a24c1fa9965f113ea85ec2a",
"assets/packages/font_awesome_flutter/lib/fonts/fa-regular-400.ttf": "3ca5dc7621921b901d513cc1ce23788c",
"assets/packages/font_awesome_flutter/lib/fonts/fa-solid-900.ttf": "903f12188f2b5494ccc8fc7345aa7f9b",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"canvaskit/canvaskit.js": "728b2d477d9b8c14593d4f9b82b484f3",
"canvaskit/canvaskit.js.symbols": "bdcd3835edf8586b6d6edfce8749fb77",
"canvaskit/canvaskit.wasm": "7a3f4ae7d65fc1de6a6e7ddd3224bc93",
"canvaskit/chromium/canvaskit.js": "8191e843020c832c9cf8852a4b909d4c",
"canvaskit/chromium/canvaskit.js.symbols": "b61b5f4673c9698029fa0a746a9ad581",
"canvaskit/chromium/canvaskit.wasm": "f504de372e31c8031018a9ec0a9ef5f0",
"canvaskit/skwasm.js": "ea559890a088fe28b4ddf70e17e60052",
"canvaskit/skwasm.js.symbols": "e72c79950c8a8483d826a7f0560573a1",
"canvaskit/skwasm.wasm": "39dd80367a4e71582d234948adc521c0",
"favicon.ico": "4a8626a63e055a84c3fc6b8a7d84783b",
"flutter.js": "83d881c1dbb6d6bcd6b42e274605b69c",
"flutter_bootstrap.js": "83b291956cb2e2c5bdd755ec8477b09a",
"icons/icon-192-maskable.png": "195a9e274997d4240f60a63f47f5351c",
"icons/icon-192.png": "494d051e0b625a9f4b6d8089dcf53676",
"icons/icon-512-maskable.png": "ff2e1d8421db659380cf7436f0df7feb",
"icons/icon-512.png": "6969d8c715bb33af3682698aefdcb613",
"index.html": "a97925dae62002ccd217b689444e1f7c",
"/": "a97925dae62002ccd217b689444e1f7c",
"main.dart.js": "b3c9fdff0596189503a6329556ca63dc",
"manifest.json": "20aa8433afcefe5476f2a4ca3934c362",
"styles.css": "db152fec66877bd25c5667b60298364f",
"version.json": "67d338bcf4e6c746cae32eccaed18d05"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
