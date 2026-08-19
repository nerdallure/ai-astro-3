import React, { useState, useEffect, useRef } from "react";
import { TrackedApp, Country } from "../types";
import { STOREFRONT_COUNTRIES } from "../data/mockData";
import { searchAppStore, AppStoreSearchResult } from "../utils/appStoreClient";
import { Search, Loader2, X, Plus, Check, ArrowRight } from "lucide-react";

interface SubHeaderSearchBarProps {
  apps: TrackedApp[];
  selectedApp: TrackedApp;
  selectedCountry: string;
  onSelectApp: (app: TrackedApp) => void;
  onAddApp: (app: TrackedApp) => void;
  onOpenAddApp: () => void;
}

export const SubHeaderSearchBar: React.FC<SubHeaderSearchBarProps> = ({
  apps,
  selectedApp,
  selectedCountry,
  onSelectApp,
  onAddApp,
  onOpenAddApp,
}) => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentCountryObj =
    STOREFRONT_COUNTRIES.find((c) => c.code === selectedCountry) || STOREFRONT_COUNTRIES[0];

  const handleSearchNow = async (text: string) => {
    if (!text.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    setIsOpen(true);
    try {
      const appResults = await searchAppStore(text, selectedCountry, 8);
      setResults(appResults || []);
    } catch (err) {
      console.error("Sub-header App Store search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(() => {
      handleSearchNow(query);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, selectedCountry]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectOrTrack = (item: any) => {
    const existing = apps.find(
      (a) =>
        a.bundleId === item.bundleId ||
        (item.trackId && a.id === `app-${item.trackId}`) ||
        a.name.toLowerCase() === item.trackName.toLowerCase()
    );

    if (existing) {
      onSelectApp(existing);
      setIsOpen(false);
      setQuery("");
      return;
    }

    const newApp: TrackedApp = {
      id: `app-${item.trackId}`,
      trackId: item.trackId,
      name: item.trackName,
      developer: item.artistName,
      category: item.primaryGenreName || item.genres?.[0] || "Productivity",
      iconUrl: item.artworkUrl512 || item.artworkUrl100,
      bundleId: item.bundleId || `com.${item.artistName.toLowerCase().replace(/\s+/g, "")}.${item.trackId}`,
      platform: "iOS",
      country: selectedCountry,
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
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div className="bg-zinc-950/90 border-b border-zinc-800/80 px-3 sm:px-4 py-2 z-30 relative">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        {/* Search Box */}
        <div ref={containerRef} className="relative flex-1 max-w-2xl">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearchNow(query);
                }
              }}
              placeholder={`Search App Store in ${currentCountryObj.name} (e.g. Flighty, Notion, Duolingo, Strava)...`}
              className="w-full bg-zinc-900 border border-zinc-800/90 focus:border-indigo-500 rounded-xl pl-9 pr-9 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all shadow-inner"
            />
            {isSearching ? (
              <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin absolute right-3" />
            ) : query ? (
              <button
                onClick={() => {
                  setQuery("");
                  setIsOpen(false);
                }}
                className="absolute right-3 text-zinc-400 hover:text-zinc-200 cursor-pointer p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>

          {/* Autocomplete Dropdown */}
          {isOpen && query.trim().length > 0 && (
            <div className="absolute left-0 right-0 mt-1.5 bg-zinc-900/98 backdrop-blur-md border border-zinc-800 rounded-xl shadow-2xl z-50 p-2 max-h-80 overflow-y-auto">
              <div className="flex items-center justify-between px-2 py-1 border-b border-zinc-800/80 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center space-x-1">
                  <span>{currentCountryObj.flag}</span>
                  <span>App Store Results ({currentCountryObj.name})</span>
                </span>
                <span className="text-[10px] text-indigo-400 font-mono font-medium">Instant Add & Track</span>
              </div>

              {results.map((item) => {
                const isTracked = apps.some((a) => a.bundleId === item.bundleId || a.id === `app-${item.trackId}`);
                const isCurrentActive = selectedApp.bundleId === item.bundleId || selectedApp.id === `app-${item.trackId}`;

                return (
                  <div
                    key={item.trackId}
                    onClick={() => handleSelectOrTrack(item)}
                    className={`flex items-center justify-between px-3 py-2 hover:bg-zinc-800/80 rounded-lg cursor-pointer transition-colors text-xs group ${
                      isCurrentActive ? "bg-indigo-600/10 border border-indigo-500/20" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src={item.artworkUrl100}
                        alt={item.trackName}
                        className="w-8 h-8 rounded-lg object-cover border border-zinc-700 shrink-0 shadow-sm"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-100 truncate group-hover:text-indigo-300 transition-colors">
                          {item.trackName}
                        </p>
                        <p className="text-[10px] text-zinc-400 truncate">
                          {item.artistName} • {item.primaryGenreName || "App"}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 ml-3">
                      {isCurrentActive ? (
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-medium flex items-center space-x-1">
                          <Check className="w-3 h-3 text-indigo-400" />
                          <span>Current</span>
                        </span>
                      ) : isTracked ? (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-medium flex items-center space-x-1">
                          <span>Switch</span>
                          <ArrowRight className="w-3 h-3 text-emerald-400" />
                        </span>
                      ) : (
                        <span className="text-[10px] bg-indigo-600 group-hover:bg-indigo-500 text-white px-2.5 py-1 rounded-md font-semibold shadow-sm transition-colors flex items-center space-x-1">
                          <Plus className="w-3 h-3" />
                          <span>Track</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {!isSearching && results.length === 0 && (
                <div className="p-4 text-center text-xs text-zinc-500">
                  No matching apps found in {currentCountryObj.name}.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Active App Info & Add App CTA */}
        <div className="flex items-center space-x-3 text-xs text-zinc-400 shrink-0">
          <div className="hidden md:flex items-center space-x-2 bg-zinc-900 border border-zinc-800/80 px-2.5 py-1 rounded-lg">
            <span className="text-zinc-500">Active:</span>
            <img src={selectedApp.iconUrl} alt={selectedApp.name} className="w-4 h-4 rounded object-cover" />
            <span className="font-semibold text-zinc-200 truncate max-w-[120px]">{selectedApp.name}</span>
          </div>

          <button
            onClick={onOpenAddApp}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 border border-indigo-500/30 font-medium transition-colors cursor-pointer text-xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Import App</span>
          </button>
        </div>
      </div>
    </div>
  );
};
