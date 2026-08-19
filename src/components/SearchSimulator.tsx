import React, { useState, useEffect, useRef } from "react";
import { TrackedApp } from "../types";
import {
  Smartphone,
  Search,
  Star,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Download,
  Flame,
  Zap,
  TrendingUp,
  X,
} from "lucide-react";

interface SearchSimulatorProps {
  app: TrackedApp;
  countryCode?: string;
  countryName: string;
}

interface AutocompleteHint {
  term: string;
  popularity: number;
  volumeCategory: "High Volume" | "Moderate Volume" | "Niche";
  isHighVolume: boolean;
  searchCountEst: string;
}

export const SearchSimulator: React.FC<SearchSimulatorProps> = ({
  app,
  countryCode = "us",
  countryName,
}) => {
  const initialQuery = app.keywords[0]?.keyword || app.name.split(" ")[0]?.toLowerCase() || "app";
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Sync query on app change
  useEffect(() => {
    const q = app.keywords[0]?.keyword || app.name.split(" ")[0]?.toLowerCase() || "app";
    setQuery(q);
    fetchSearchResults(q);
  }, [app.id]);

  // Autocomplete states
  const [hints, setHints] = useState<AutocompleteHint[]>([]);
  const [isFetchingHints, setIsFetchingHints] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchInputContainerRef = useRef<HTMLDivElement>(null);

  const fetchSearchResults = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setShowSuggestions(false);
    try {
      const response = await fetch(
        `/api/appstore/search?term=${encodeURIComponent(searchTerm)}&country=${countryCode}&limit=10`
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      }
    } catch (err) {
      console.error("Search simulator error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchResults(query);
  }, [countryCode]);

  // Fetch live Apple query completions with debouncing
  useEffect(() => {
    if (!query || query.trim().length === 0) {
      setHints([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsFetchingHints(true);
      try {
        const response = await fetch(
          `/api/appstore/autocomplete?term=${encodeURIComponent(query)}&country=${countryCode}`
        );
        if (response.ok) {
          const data = await response.json();
          const fetchedHints: AutocompleteHint[] = data.hints || [];
          setHints(fetchedHints);
          setShowSuggestions(fetchedHints.length > 0);
          setHighlightedIndex(-1);
        }
      } catch (err) {
        console.error("Failed to fetch search completions:", err);
      } finally {
        setIsFetchingHints(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query, countryCode]);

  // Click outside to close auto-complete dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchInputContainerRef.current &&
        !searchInputContainerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (term: string) => {
    setQuery(term);
    setShowSuggestions(false);
    fetchSearchResults(term);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || hints.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < hints.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : hints.length - 1));
    } else if (e.key === "Enter" && highlightedIndex >= 0 && highlightedIndex < hints.length) {
      e.preventDefault();
      handleSelectSuggestion(hints[highlightedIndex].term);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (highlightedIndex >= 0 && highlightedIndex < hints.length) {
      handleSelectSuggestion(hints[highlightedIndex].term);
    } else {
      fetchSearchResults(query);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-950/50 via-zinc-900 to-purple-950/40 border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs mb-1">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              <span>On-Device Apple App Store Search Simulation</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
              <span>App Store Search Result Simulator</span>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium px-2 py-0.5 rounded-full">
                Live Query Completions
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              Simulate live customer searches directly on an iOS / macOS storefront device in <strong className="text-zinc-200">{countryName}</strong>. Type to discover real-time Apple Search query completions and identify high-volume search terms.
            </p>
          </div>
        </div>

        {/* Search Bar with Live Auto-Complete Dropdown */}
        <div className="mt-5 relative" ref={searchInputContainerRef}>
          <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => {
                  if (hints.length > 0) setShowSuggestions(true);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type to search App Store (e.g., calendar, pomodoro, habit tracker)..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 shadow-inner"
              />
              {isFetchingHints ? (
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin absolute right-3.5 top-3" />
              ) : (
                query.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setHints([]);
                      setShowSuggestions(false);
                    }}
                    className="absolute right-3.5 top-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2 shrink-0 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simulate Search"}
            </button>
          </form>

          {/* Auto-Complete Suggestions Dropdown Menu */}
          {showSuggestions && hints.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 z-40 bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-fade-in">
              <div className="p-2.5 bg-zinc-950/90 border-b border-zinc-800 flex items-center justify-between text-[11px]">
                <span className="font-bold text-zinc-300 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Apple Search Query Completions & ASA Volume</span>
                </span>
                <span className="text-zinc-500 text-[10px] font-mono">
                  Storefront: {app.country.toUpperCase()}
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-zinc-800/60">
                {hints.map((hint, idx) => {
                  const isHighlighted = idx === highlightedIndex;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectSuggestion(hint.term)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`p-3 flex items-center justify-between cursor-pointer transition-all ${
                        isHighlighted
                          ? "bg-indigo-600/25 text-white border-l-4 border-indigo-500 pl-3.5"
                          : "hover:bg-zinc-800/70 text-zinc-200"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <Search className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="font-semibold text-xs text-white truncate">
                          {hint.term}
                        </span>
                        {hint.isHighVolume && (
                          <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-bold px-1.5 py-0.2 rounded flex items-center space-x-0.5 shrink-0">
                            <Zap className="w-2.5 h-2.5 text-rose-400 fill-rose-400" />
                            <span>High Volume</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 shrink-0 text-[11px] font-mono">
                        {/* Popularity Progress Indicator */}
                        <div className="flex items-center space-x-1.5">
                          <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                hint.popularity >= 72
                                  ? "bg-gradient-to-r from-amber-400 to-rose-500"
                                  : hint.popularity >= 45
                                  ? "bg-indigo-400"
                                  : "bg-zinc-500"
                              }`}
                              style={{ width: `${hint.popularity}%` }}
                            />
                          </div>
                          <span
                            className={`font-bold ${
                              hint.popularity >= 72 ? "text-amber-400" : "text-zinc-400"
                            }`}
                          >
                            {hint.popularity}
                          </span>
                        </div>

                        <span className="text-[10px] text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                          {hint.searchCountEst}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* High-Volume Search Term Suggestions Tray */}
        {hints.length > 0 && (
          <div className="mt-3 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80">
            <div className="flex items-center justify-between mb-1.5 text-[11px]">
              <span className="font-semibold text-zinc-300 flex items-center space-x-1">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>High-Volume Search Query Completions for "{query}":</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {hints.slice(0, 6).map((hint, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSuggestion(hint.term)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center space-x-1.5 cursor-pointer ${
                    hint.isHighVolume
                      ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60"
                  }`}
                >
                  <span>{hint.term}</span>
                  <span
                    className={`text-[9px] font-mono font-bold ${
                      hint.isHighVolume ? "text-amber-400" : "text-zinc-400"
                    }`}
                  >
                    ({hint.popularity})
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Tracked Keyword Pills */}
        <div className="flex items-center space-x-2 mt-3 overflow-x-auto text-xs pb-1">
          <span className="text-[10px] text-zinc-400 font-medium shrink-0">Tracked Queries:</span>
          {app.keywords.map((kw) => (
            <button
              key={kw.id}
              onClick={() => {
                setQuery(kw.keyword);
                fetchSearchResults(kw.keyword);
              }}
              className="bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 px-2.5 py-1 rounded-lg text-xs transition-colors shrink-0 font-mono text-[11px]"
            >
              {kw.keyword} (#{kw.currentRank || "–"})
            </button>
          ))}
        </div>
      </div>

      {/* Simulated Device Frame Workspace */}
      <div className="max-w-3xl mx-auto bg-zinc-950 border-4 border-zinc-800 rounded-[32px] shadow-2xl p-4 sm:p-6 space-y-4 relative">
        {/* Device Header Bar */}
        <div className="flex items-center justify-between text-zinc-400 text-[11px] pb-3 border-b border-zinc-800/80 px-2">
          <span className="font-semibold text-zinc-200">App Store Search</span>
          <span className="font-mono bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800 text-[10px]">
            Storefront: {app.country.toUpperCase()} ({countryName})
          </span>
        </div>

        {/* Search Query Headline */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-bold text-white">"{query}"</span>
          </div>
          <span className="text-[10px] text-zinc-400">
            Showing top {searchResults.length} organic & sponsored results
          </span>
        </div>

        {/* Simulated Search Ads Banner (Top Result Sponsor) */}
        {searchResults.length > 0 && (
          <div className="bg-gradient-to-r from-amber-950/20 via-zinc-900 to-zinc-900 border border-amber-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="bg-amber-400 text-black text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Apple Search Ads Ad
              </span>
              <span className="text-[10px] text-zinc-400">Sponsored Placement</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={searchResults[0].artworkUrl100}
                  alt={searchResults[0].trackName}
                  className="w-12 h-12 rounded-xl object-cover border border-zinc-700"
                />
                <div>
                  <h3 className="font-bold text-white text-sm">{searchResults[0].trackName}</h3>
                  <p className="text-[11px] text-zinc-400">{searchResults[0].artistName}</p>
                </div>
              </div>

              <button className="bg-zinc-800 hover:bg-zinc-700 text-indigo-400 font-bold px-4 py-1.5 rounded-full text-xs transition-colors">
                GET
              </button>
            </div>
          </div>
        )}

        {/* Search Results List */}
        <div className="space-y-4 pt-2">
          {searchResults.map((item, index) => {
            const isYourApp =
              item.trackName.toLowerCase().includes(app.name.toLowerCase().split(" ")[0]) ||
              item.artistName.toLowerCase().includes(app.developer.toLowerCase().split(" ")[0]);

            return (
              <div
                key={item.trackId}
                className={`bg-zinc-900/80 border p-4 rounded-2xl space-y-3 transition-all ${
                  isYourApp
                    ? "border-emerald-500/80 bg-emerald-950/20 shadow-lg shadow-emerald-500/10"
                    : "border-zinc-800/90 hover:border-zinc-700"
                }`}
              >
                {/* Result Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`w-6 h-6 rounded-lg font-mono font-bold text-xs flex items-center justify-center ${
                        index === 0
                          ? "bg-amber-400 text-black"
                          : index === 1
                          ? "bg-zinc-300 text-black"
                          : index === 2
                          ? "bg-amber-700 text-white"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      #{index + 1}
                    </span>

                    <img
                      src={item.artworkUrl100}
                      alt={item.trackName}
                      className="w-12 h-12 rounded-xl object-cover border border-zinc-700 shrink-0"
                    />

                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <h3 className="font-bold text-white text-sm truncate">{item.trackName}</h3>
                        {isYourApp && (
                          <span className="text-[9px] bg-emerald-500 text-black font-bold px-1.5 py-0.2 rounded">
                            YOUR APP
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate">{item.artistName}</p>
                      <div className="flex items-center space-x-2 text-[10px] text-zinc-400 mt-0.5">
                        <span className="flex items-center space-x-1 text-amber-400 font-bold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{item.averageUserRating ? item.averageUserRating.toFixed(1) : "4.5"}</span>
                        </span>
                        <span>•</span>
                        <span>{(item.userRatingCount || 1000).toLocaleString()} Ratings</span>
                        <span>•</span>
                        <span className="text-zinc-300">{item.primaryGenreName || "Productivity"}</span>
                      </div>
                    </div>
                  </div>

                  <button className="bg-zinc-800 hover:bg-zinc-700 text-indigo-400 font-bold px-3.5 py-1.5 rounded-full text-xs shrink-0">
                    GET
                  </button>
                </div>

                {/* Screenshot Previews */}
                {item.screenshotUrls && item.screenshotUrls.length > 0 && (
                  <div className="flex items-center space-x-2 overflow-x-auto pt-1 pb-1">
                    {item.screenshotUrls.slice(0, 3).map((imgUrl: string, idx: number) => (
                      <img
                        key={idx}
                        src={imgUrl}
                        alt={`Screenshot ${idx + 1}`}
                        className="w-24 h-40 object-cover rounded-xl border border-zinc-800 shrink-0 shadow-md"
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {searchResults.length === 0 && !loading && (
            <div className="py-12 text-center text-zinc-400 text-xs">
              No search results found for query.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
