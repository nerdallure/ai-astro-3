/**
 * Robust App Store Search & Lookup client with automatic multi-tier fallback:
 * 1. Primary: Try `/api/appstore/search` backend proxy.
 * 2. Secondary: Direct fetch to `itunes.apple.com/search`.
 * 3. Fallback: JSONP script injection (bypasses any browser CORS restrictions).
 */

export interface AppStoreSearchResult {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100?: string;
  artworkUrl512?: string;
  artworkUrl60?: string;
  bundleId?: string;
  primaryGenreName?: string;
  genres?: string[];
  averageUserRating?: number;
  userRatingCount?: number;
  description?: string;
  price?: number;
  formattedPrice?: string;
  currency?: string;
  version?: string;
  currentVersionReleaseDate?: string;
  screenshotUrls?: string[];
  ipadScreenshotUrls?: string[];
}

/**
 * Perform JSONP request as a fail-safe fallback for App Store search
 */
function searchAppStoreJsonp(
  term: string,
  country: string = "us",
  limit: number = 10
): Promise<{ results: AppStoreSearchResult[] }> {
  return new Promise((resolve) => {
    const callbackName = `itunes_jsonp_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const script = document.createElement("script");
    const timeout = setTimeout(() => {
      cleanup();
      resolve({ results: [] });
    }, 5000);

    const cleanup = () => {
      clearTimeout(timeout);
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      delete (window as any)[callbackName];
    };

    (window as any)[callbackName] = (data: any) => {
      cleanup();
      resolve(data || { results: [] });
    };

    script.onerror = () => {
      cleanup();
      resolve({ results: [] });
    };

    script.src = `https://itunes.apple.com/search?term=${encodeURIComponent(
      term
    )}&country=${country}&entity=software&limit=${limit}&callback=${callbackName}`;
    document.body.appendChild(script);
  });
}

/**
 * Universal App Store Search function with multi-tier resilience
 */
export async function searchAppStore(
  term: string,
  country: string = "us",
  limit: number = 10
): Promise<AppStoreSearchResult[]> {
  if (!term || !term.trim()) return [];

  // Tier 1: Try backend proxy
  try {
    const res = await fetch(
      `/api/appstore/search?term=${encodeURIComponent(term.trim())}&country=${country}&limit=${limit}`
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.results) && data.results.length > 0) {
        return data.results;
      }
    }
  } catch (err) {
    console.warn("Backend /api/appstore/search failed, attempting direct fetch:", err);
  }

  // Tier 2: Try direct iTunes API fetch
  try {
    const directRes = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(
        term.trim()
      )}&country=${country}&entity=software&limit=${limit}`
    );
    if (directRes.ok) {
      const data = await directRes.json();
      if (Array.isArray(data.results) && data.results.length > 0) {
        return data.results;
      }
    }
  } catch (err) {
    console.warn("Direct itunes.apple.com fetch failed (CORS), falling back to JSONP:", err);
  }

  // Tier 3: Try JSONP (works in all browsers without CORS issues)
  try {
    const jsonpData = await searchAppStoreJsonp(term.trim(), country, limit);
    return jsonpData.results || [];
  } catch (err) {
    console.error("All App Store search tiers failed:", err);
    return [];
  }
}

/**
 * Universal App Store Lookup by ID function
 */
export async function lookupAppStore(
  id: string | number,
  country: string = "us"
): Promise<AppStoreSearchResult | null> {
  if (!id) return null;

  try {
    const res = await fetch(
      `/api/appstore/lookup?id=${encodeURIComponent(String(id))}&country=${country}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        return data.results[0];
      }
    }
  } catch (err) {
    console.warn("App store lookup proxy error, trying direct JSONP:", err);
  }

  return new Promise((resolve) => {
    const callbackName = `itunes_lookup_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const script = document.createElement("script");
    const timeout = setTimeout(() => {
      cleanup();
      resolve(null);
    }, 5000);

    const cleanup = () => {
      clearTimeout(timeout);
      if (script.parentNode) script.parentNode.removeChild(script);
      delete (window as any)[callbackName];
    };

    (window as any)[callbackName] = (data: any) => {
      cleanup();
      resolve(data?.results?.[0] || null);
    };

    script.onerror = () => {
      cleanup();
      resolve(null);
    };

    script.src = `https://itunes.apple.com/lookup?id=${encodeURIComponent(
      String(id)
    )}&country=${country}&callback=${callbackName}`;
    document.body.appendChild(script);
  });
}
