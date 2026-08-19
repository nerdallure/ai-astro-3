import React, { useState } from "react";
import { TrackedApp } from "../types";
import { searchAppStore } from "../utils/appStoreClient";
import { Search, Plus, Loader2 } from "lucide-react";

interface AddAppModalProps {
  onClose: () => void;
  onAddApp: (app: TrackedApp) => void;
  country: string;
}

export const AddAppModal: React.FC<AddAppModalProps> = ({
  onClose,
  onAddApp,
  country,
}) => {
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const results = await searchAppStore(searchQuery, country, 10);
      setSearchResults(results || []);
    } catch (err) {
      console.error("App Store Search error:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSearchResult = (item: any) => {
    const newApp: TrackedApp = {
      id: `app-${item.trackId}`,
      trackId: item.trackId,
      name: item.trackName,
      developer: item.artistName,
      category: item.primaryGenreName || item.genres?.[0] || "Productivity",
      iconUrl: item.artworkUrl512 || item.artworkUrl100,
      bundleId: item.bundleId || `com.${item.artistName.toLowerCase().replace(/\s+/g, "")}.${item.trackId}`,
      platform: "iOS",
      country: country,
      isTemporary: false,
      averageUserRating: item.averageUserRating || 4.6,
      userRatingCount: item.userRatingCount || 1200,
      metadata: {
        title: item.trackName.slice(0, 30),
        subtitle: (item.genres?.[0] ? `${item.genres[0]} App` : "iOS App").slice(0, 30),
        keywordField: item.trackName.toLowerCase().split(" ").join(",").slice(0, 100),
      },
      competitors: [],
      keywords: [
        {
          id: `kw-${Date.now()}-1`,
          keyword: item.trackName.toLowerCase().split(" ")[0] || "app",
          currentRank: 1,
          previousRank: 1,
          popularity: 82,
          difficulty: 45,
          estimatedInstalls: 420,
          tags: ["Core"],
          lastUpdated: "Just now",
          history: [{ date: "Today", rank: 1 }],
        },
      ],
    };

    onAddApp(newApp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center space-x-2">
            <Plus className="w-4 h-4 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Track New Application</h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-xs font-semibold cursor-pointer">
            ✕
          </button>
        </div>

        {/* Search App Store Form */}
        <div className="space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search App Store by name (e.g. Fantastical, Notion, Flighty)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={searching}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
            </button>
          </form>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {searchResults.map((item) => (
              <div
                key={item.trackId}
                onClick={() => handleSelectSearchResult(item)}
                className="flex items-center justify-between p-3 bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 rounded-xl cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <img
                    src={item.artworkUrl100}
                    alt={item.trackName}
                    className="w-10 h-10 rounded-xl object-cover border border-zinc-700"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-white text-xs truncate">{item.trackName}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{item.artistName} • {item.primaryGenreName}</p>
                  </div>
                </div>
                <button className="text-[11px] bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-lg shrink-0 cursor-pointer">
                  Track App
                </button>
              </div>
            ))}

            {searchResults.length === 0 && !searching && (
              <p className="text-center text-xs text-zinc-500 py-6">
                Search above to import any published app directly from Apple App Store.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
