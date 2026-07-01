export function localStorageProvider() {
  if (typeof window === 'undefined') {
    return new Map();
  }

  // When initializing, we restore the data from `localStorage` into a map.
  let map;
  try {
    const appCache = localStorage.getItem('app-cache');
    if (appCache) {
      map = new Map(JSON.parse(appCache));
    } else {
      map = new Map();
    }
  } catch (e) {
    map = new Map();
  }

  // Before unloading the app, we write back all the data into `localStorage`.
  window.addEventListener('beforeunload', () => {
    try {
      const appCache = JSON.stringify(Array.from(map.entries()));
      localStorage.setItem('app-cache', appCache);
    } catch (e) {
      console.error('Failed to save SWR cache to localStorage', e);
    }
  });

  // We still use the map for write & read for performance.
  return map;
}
