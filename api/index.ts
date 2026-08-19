import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";
import { neon } from "@neondatabase/serverless";

function getAi() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenAI({ apiKey });
}

function getSql() {
  const dbUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || process.env.POSTGRES_URL;
  if (!dbUrl) return null;
  return neon(dbUrl);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const url = new URL(req.url || "", `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname.replace(/^\/api/, "") || "/";

  try {
    // Health Check
    if (pathname === "/health" || pathname === "/") {
      return res.json({ status: "ok", timestamp: new Date().toISOString(), platform: "Vercel Serverless" });
    }

    // Database Status
    if (pathname === "/db/status") {
      const sql = getSql();
      if (!sql) {
        return res.json({ connected: false, message: "No DATABASE_URL configured" });
      }
      const start = Date.now();
      await sql`SELECT 1 as ping`;
      const latencyMs = Date.now() - start;
      return res.json({ connected: true, latencyMs });
    }

    // App Store Search Proxy
    if (pathname === "/appstore/search") {
      const term = (req.query.term as string) || "calendar";
      const country = (req.query.country as string) || "us";
      const entity = (req.query.entity as string) || "software";
      const limit = parseInt((req.query.limit as string) || "12", 10);

      const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&country=${country}&entity=${entity}&limit=${limit}`;
      const appleRes = await fetch(searchUrl);
      if (!appleRes.ok) {
        throw new Error(`iTunes API returned status ${appleRes.status}`);
      }
      const data = await appleRes.json();
      return res.json(data);
    }

    // App Store Lookup Proxy
    if (pathname === "/appstore/lookup") {
      const id = req.query.id as string;
      const country = (req.query.country as string) || "us";
      if (!id) return res.status(400).json({ error: "Missing app ID" });

      const lookupUrl = `https://itunes.apple.com/lookup?id=${encodeURIComponent(id)}&country=${country}`;
      const appleRes = await fetch(lookupUrl);
      const data = await appleRes.json();
      return res.json(data);
    }

    // App Store Autocomplete Proxy
    if (pathname === "/appstore/autocomplete") {
      const term = (req.query.term as string) || "";
      const country = (req.query.country as string) || "us";
      if (!term.trim()) return res.json({ hints: [] });

      let suggestions: string[] = [];
      try {
        const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&country=${country}&entity=software&limit=12`;
        const resp = await fetch(searchUrl);
        if (resp.ok) {
          const searchData = await resp.json();
          const results = searchData.results || [];
          results.forEach((r: any) => {
            if (r.trackName) {
              const cleanName = r.trackName.replace(/[:\-–—\(].*$/, "").trim();
              if (cleanName && !suggestions.includes(cleanName)) {
                suggestions.push(cleanName);
              }
            }
          });
        }
      } catch (err) {
        console.warn("Autocomplete proxy search error:", err);
      }

      const termLower = term.toLowerCase().trim();
      [" app", " tracker", " planner", " free", " pro", " widget"].forEach((mod) => {
        const combo = termLower.endsWith(mod.trim()) ? termLower : `${termLower}${mod}`;
        if (!suggestions.includes(combo)) suggestions.push(combo);
      });

      const uniqueTerms = Array.from(new Set(suggestions)).filter((s) => s.trim().length > 0).slice(0, 8);
      const enriched = uniqueTerms.map((hintText, idx) => {
        const popBase = Math.max(25, 96 - idx * 7);
        const popScore = Math.min(99, Math.max(22, popBase + (hintText.length % 5)));
        let volumeCategory: "High Volume" | "Moderate Volume" | "Niche" = "Moderate Volume";
        if (popScore >= 72) volumeCategory = "High Volume";
        else if (popScore < 45) volumeCategory = "Niche";

        return {
          term: hintText,
          popularity: popScore,
          volumeCategory,
          isHighVolume: popScore >= 72,
          searchCountEst: `${(popScore * 420 + idx * 85).toLocaleString()}/mo`,
        };
      });

      return res.json({ hints: enriched });
    }

    // App Store Customer Reviews RSS Proxy
    if (pathname === "/appstore/reviews") {
      const id = req.query.id as string;
      const country = (req.query.country as string) || "us";
      if (!id) return res.status(400).json({ error: "Missing app ID" });

      const revUrl = `https://itunes.apple.com/${country}/rss/customerreviews/id=${encodeURIComponent(id)}/sortBy=mostRecent/json`;
      const appleRes = await fetch(revUrl);
      if (!appleRes.ok) return res.json({ reviews: [] });

      const data = await appleRes.json();
      const entries = data?.feed?.entry || [];
      const reviewEntries = Array.isArray(entries) ? entries.slice(1) : [];

      const formattedReviews = reviewEntries.map((e: any, idx: number) => ({
        id: e.id?.label || `rev-${idx}`,
        author: e.author?.name?.label || "App Store User",
        rating: parseInt(e["im:rating"]?.label || "5", 10),
        title: e.title?.label || "User Review",
        content: e.content?.label || "",
        version: e["im:version"]?.label || "1.0",
        countryCode: country,
        date: "Recent",
      }));

      return res.json({ reviews: formattedReviews });
    }

    // Gemini ASO Recommendations
    if (pathname === "/gemini/aso-recommendations" && req.method === "POST") {
      const { appName, category, currentTitle, currentSubtitle, currentKeywords, country } = req.body || {};
      const ai = getAi();
      const prompt = `You are Astro ASO Metadata Optimizer for Apple App Store (iOS 18 Guidelines).
App Name: ${appName}
Category: ${category}
Current Title: ${currentTitle}
Current Subtitle: ${currentSubtitle}
Current Keywords: ${currentKeywords}
Storefront Country: ${country || "US"}

Rules:
1. Title MUST be 30 characters or fewer.
2. Subtitle MUST be 30 characters or fewer.
3. Keyword field MUST be 100 characters or fewer, comma-separated with NO SPACES.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              optimizedTitle: { type: Type.STRING },
              optimizedSubtitle: { type: Type.STRING },
              optimizedKeywordField: { type: Type.STRING },
              actionableTips: { type: Type.ARRAY, items: { type: Type.STRING } },
              estimatedOrganicReachBoost: { type: Type.STRING },
            },
          },
        },
      });

      const result = JSON.parse(response.text || "{}");
      return res.json(result);
    }

    // Gemini Keyword Variations
    if (pathname === "/gemini/keyword-variations" && req.method === "POST") {
      const { coreKeyword, appCategory, appDescription, country } = req.body || {};
      const ai = getAi();
      const prompt = `Generate 16 high-performing bulk keyword variations for the core keyword: "${coreKeyword}". Category: ${appCategory}. Storefront: ${country || "US"}.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              coreKeyword: { type: Type.STRING },
              variations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    keyword: { type: Type.STRING },
                    variationType: { type: Type.STRING },
                    popularity: { type: Type.INTEGER },
                    difficulty: { type: Type.INTEGER },
                    opportunityScore: { type: Type.INTEGER },
                    intent: { type: Type.STRING },
                  },
                },
              },
            },
          },
        },
      });

      const result = JSON.parse(response.text || "{}");
      return res.json(result);
    }

    return res.status(404).json({ error: `Not found: ${pathname}` });
  } catch (err: any) {
    console.error("API error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
