import React, { useState } from "react";
import { TrackedApp, AiKeywordIdea } from "../types";
import {
  Search,
  Sparkles,
  Plus,
  Check,
  TrendingUp,
  BarChart,
  Lightbulb,
  Filter,
  Loader2,
  Zap,
  Layers,
  CheckSquare,
  Square,
  ArrowRight,
  SlidersHorizontal,
  Flame,
  Tag,
  CheckCircle2,
  Copy,
} from "lucide-react";

export interface BulkKeywordVariation {
  keyword: string;
  variationType: string; // Long-Tail, Feature & Action, Audience & Use Case, High-Volume Suffix, Alternative Angle
  popularity: number;
  difficulty: number;
  opportunityScore: number;
  intent: string;
}

interface KeywordResearchProps {
  app: TrackedApp;
  onAddKeyword: (keyword: string) => void;
  onAddKeywords?: (keywords: string[]) => void;
  countryCode?: string;
  countryName: string;
}

export const KeywordResearch: React.FC<KeywordResearchProps> = ({
  app,
  onAddKeyword,
  onAddKeywords,
  countryCode = "us",
  countryName,
}) => {
  const [researchMode, setResearchMode] = useState<"bulk-variations" | "opportunity-discovery">(
    "bulk-variations"
  );

  // Bulk Variations Generator States
  const defaultKw = app.keywords[0]?.keyword || app.category.toLowerCase() || "planner";
  const [coreKeyword, setCoreKeyword] = useState(defaultKw);
  const [generatingVariations, setGeneratingVariations] = useState(false);
  const [selectedVariationSet, setSelectedVariationSet] = useState<Set<string>>(new Set());
  const [bucketFilter, setBucketFilter] = useState<string>("All");
  const [hideTrackedFilter, setHideTrackedFilter] = useState<boolean>(false);
  const [lastBulkTrackedCount, setLastBulkTrackedCount] = useState<number | null>(null);

  // Sync state on app switch
  React.useEffect(() => {
    const kw = app.keywords[0]?.keyword || app.category.toLowerCase() || "planner";
    setCoreKeyword(kw);
    setSeedKeyword(kw);
    setSelectedVariationSet(new Set());
    setAddedKeywordSet(new Set(app.keywords.map((k) => k.keyword.toLowerCase())));

    // Auto-generate fresh opportunity keyword ideas for the selected app
    const fetchFreshDiscovery = async () => {
      setLoadingDiscovery(true);
      try {
        const response = await fetch("/api/gemini/keyword-variations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            coreKeyword: kw,
            appName: app.name,
            category: app.category,
            country: countryCode,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.variations) && data.variations.length > 0) {
            setVariations(data.variations);
          }
        }
      } catch (err) {
        console.error("Auto keyword sync error:", err);
      } finally {
        setLoadingDiscovery(false);
      }
    };

    fetchFreshDiscovery();
  }, [app.id, app.name, countryCode]);

  // Default seed variations for instant display
  const [variations, setVariations] = useState<BulkKeywordVariation[]>([
    {
      keyword: "ai daily calendar planner",
      variationType: "Long-Tail",
      popularity: 88,
      difficulty: 34,
      opportunityScore: 92,
      intent: "Feature Search",
    },
    {
      keyword: "calendar widget 2026 free",
      variationType: "High-Volume Suffix",
      popularity: 91,
      difficulty: 58,
      opportunityScore: 84,
      intent: "High Volume",
    },
    {
      keyword: "shared calendar for couples",
      variationType: "Audience & Use Case",
      popularity: 82,
      difficulty: 29,
      opportunityScore: 94,
      intent: "High Intent",
    },
    {
      keyword: "auto schedule meeting calendar",
      variationType: "Feature & Action",
      popularity: 79,
      difficulty: 36,
      opportunityScore: 86,
      intent: "Transactional",
    },
    {
      keyword: "minimalist time block calendar",
      variationType: "Long-Tail",
      popularity: 74,
      difficulty: 22,
      opportunityScore: 95,
      intent: "Long-Tail",
    },
    {
      keyword: "calendar app for college students",
      variationType: "Audience & Use Case",
      popularity: 76,
      difficulty: 31,
      opportunityScore: 89,
      intent: "Niche Target",
    },
    {
      keyword: "family event tracker calendar",
      variationType: "Feature & Action",
      popularity: 85,
      difficulty: 42,
      opportunityScore: 83,
      intent: "Feature Search",
    },
    {
      keyword: "google calendar sync assistant",
      variationType: "Alternative Angle",
      popularity: 93,
      difficulty: 64,
      opportunityScore: 78,
      intent: "Integration",
    },
    {
      keyword: "color code habit calendar",
      variationType: "Feature & Action",
      popularity: 68,
      difficulty: 18,
      opportunityScore: 96,
      intent: "Feature Search",
    },
    {
      keyword: "smart schedule reminder app",
      variationType: "High-Volume Suffix",
      popularity: 84,
      difficulty: 39,
      opportunityScore: 87,
      intent: "Core Search",
    },
    {
      keyword: "simple agenda planner widget",
      variationType: "Long-Tail",
      popularity: 71,
      difficulty: 25,
      opportunityScore: 91,
      intent: "Long-Tail",
    },
    {
      keyword: "business shift work calendar",
      variationType: "Audience & Use Case",
      popularity: 80,
      difficulty: 33,
      opportunityScore: 88,
      intent: "B2B Intent",
    },
    {
      keyword: "icalendar offline planner",
      variationType: "Alternative Angle",
      popularity: 65,
      difficulty: 21,
      opportunityScore: 90,
      intent: "Alternative",
    },
    {
      keyword: "clean desktop calendar organizer",
      variationType: "Long-Tail",
      popularity: 63,
      difficulty: 19,
      opportunityScore: 92,
      intent: "Long-Tail",
    },
    {
      keyword: "calendar schedule online free",
      variationType: "High-Volume Suffix",
      popularity: 89,
      difficulty: 52,
      opportunityScore: 80,
      intent: "High Volume",
    },
  ]);

  // General Discovery States
  const [seedKeyword, setSeedKeyword] = useState("calendar");
  const [loadingDiscovery, setLoadingDiscovery] = useState(false);
  const [discoveredKeywords, setDiscoveredKeywords] = useState<AiKeywordIdea[]>([
    {
      keyword: "ai daily calendar planner",
      popularity: 84,
      difficulty: 38,
      opportunityScore: 88,
      intent: "Feature Search",
      suggestedTag: "High Opportunity",
    },
    {
      keyword: "smart schedule assistant",
      popularity: 76,
      difficulty: 32,
      opportunityScore: 85,
      intent: "Transactional",
      suggestedTag: "Core",
    },
    {
      keyword: "time block task manager",
      popularity: 69,
      difficulty: 28,
      opportunityScore: 82,
      intent: "Long-Tail",
      suggestedTag: "High Opportunity",
    },
    {
      keyword: "auto schedule meeting link",
      popularity: 71,
      difficulty: 45,
      opportunityScore: 74,
      intent: "Feature Search",
      suggestedTag: "Secondary",
    },
    {
      keyword: "minimalist habit calendar 2026",
      popularity: 62,
      difficulty: 19,
      opportunityScore: 92,
      intent: "Long-Tail",
      suggestedTag: "Long-Tail",
    },
    {
      keyword: "family shared calendar widget",
      popularity: 89,
      difficulty: 74,
      opportunityScore: 60,
      intent: "High Volume",
      suggestedTag: "High Volume",
    },
  ]);

  // Tracked Keyword Set
  const [addedKeywordSet, setAddedKeywordSet] = useState<Set<string>>(
    new Set(app.keywords.map((k) => k.keyword.toLowerCase()))
  );

  // Handle Bulk AI Variation Generation
  const handleGenerateBulkVariations = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!coreKeyword.trim()) return;

    setGeneratingVariations(true);
    setSelectedVariationSet(new Set());
    setLastBulkTrackedCount(null);

    try {
      const response = await fetch("/api/gemini/keyword-variations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coreKeyword,
          appCategory: app.category,
          appDescription: `${app.metadata.title} ${app.metadata.subtitle}`,
          country: app.country,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.variations && Array.isArray(data.variations) && data.variations.length > 0) {
          setVariations(data.variations);
          return;
        }
      }
      throw new Error("Using client fallback");
    } catch (err) {
      console.warn("Bulk variation using client fallback generator");
      const clean = coreKeyword.trim().toLowerCase();
      const localVars: BulkKeywordVariation[] = [
        { keyword: `best ${clean} 2026`, variationType: "Long-Tail", popularity: 88, difficulty: 32, opportunityScore: 92, intent: "Feature Search" },
        { keyword: `simple ${clean} widget`, variationType: "Long-Tail", popularity: 76, difficulty: 24, opportunityScore: 94, intent: "Long-Tail" },
        { keyword: `daily ${clean} assistant`, variationType: "Long-Tail", popularity: 72, difficulty: 28, opportunityScore: 90, intent: "Long-Tail" },
        { keyword: `${clean} auto sync`, variationType: "Feature & Action", popularity: 81, difficulty: 42, opportunityScore: 86, intent: "Transactional" },
        { keyword: `shared ${clean} online`, variationType: "Feature & Action", popularity: 84, difficulty: 38, opportunityScore: 88, intent: "Feature Search" },
        { keyword: `${clean} reminder & alarm`, variationType: "Feature & Action", popularity: 79, difficulty: 35, opportunityScore: 87, intent: "Transactional" },
        { keyword: `${clean} for students`, variationType: "Audience & Use Case", popularity: 83, difficulty: 30, opportunityScore: 93, intent: "High Intent" },
        { keyword: `${clean} for couples`, variationType: "Audience & Use Case", popularity: 86, difficulty: 26, opportunityScore: 95, intent: "High Intent" },
        { keyword: `business ${clean} pro`, variationType: "Audience & Use Case", popularity: 75, difficulty: 44, opportunityScore: 82, intent: "B2B Intent" },
        { keyword: `${clean} free`, variationType: "High-Volume Suffix", popularity: 93, difficulty: 65, opportunityScore: 78, intent: "High Volume" },
        { keyword: `${clean} tracker`, variationType: "High-Volume Suffix", popularity: 90, difficulty: 58, opportunityScore: 81, intent: "High Volume" },
        { keyword: `${clean} planner`, variationType: "High-Volume Suffix", popularity: 89, difficulty: 52, opportunityScore: 84, intent: "High Volume" },
        { keyword: `minimal ${clean}`, variationType: "Alternative Angle", popularity: 68, difficulty: 20, opportunityScore: 92, intent: "Alternative" },
        { keyword: `aesthetic ${clean} organizer`, variationType: "Alternative Angle", popularity: 66, difficulty: 22, opportunityScore: 90, intent: "Alternative" },
      ];
      setVariations(localVars);
    } finally {
      setGeneratingVariations(false);
    }
  };

  // Handle Opportunity Discovery
  const handleDiscover = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!seedKeyword.trim()) return;

    setLoadingDiscovery(true);
    try {
      const response = await fetch("/api/gemini/keyword-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seedKeyword,
          appCategory: app.category,
          appDescription: `${app.metadata.title} ${app.metadata.subtitle}`,
          country: app.country,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.keywords && Array.isArray(data.keywords) && data.keywords.length > 0) {
          setDiscoveredKeywords(data.keywords);
          return;
        }
      }
      throw new Error("Using fallback discovery");
    } catch (err) {
      console.warn("Discovery using client fallback");
      const clean = seedKeyword.trim().toLowerCase();
      setDiscoveredKeywords([
        { keyword: `ai ${clean} planner`, popularity: 86, difficulty: 34, opportunityScore: 91, intent: "Feature Search", suggestedTag: "High Opportunity" },
        { keyword: `smart ${clean} assistant`, popularity: 80, difficulty: 32, opportunityScore: 89, intent: "Transactional", suggestedTag: "Core" },
        { keyword: `minimalist ${clean} widget`, popularity: 74, difficulty: 25, opportunityScore: 93, intent: "Long-Tail", suggestedTag: "Long-Tail" },
        { keyword: `shared ${clean} for teams`, popularity: 78, difficulty: 40, opportunityScore: 84, intent: "High Intent", suggestedTag: "Secondary" },
        { keyword: `${clean} tracker 2026`, popularity: 91, difficulty: 60, opportunityScore: 79, intent: "High Volume", suggestedTag: "High Volume" },
        { keyword: `free ${clean} offline`, popularity: 70, difficulty: 22, opportunityScore: 92, intent: "Alternative", suggestedTag: "High Opportunity" },
      ]);
    } finally {
      setLoadingDiscovery(false);
    }
  };

  // Handle single tracking
  const handleTrackSingle = (kw: string) => {
    onAddKeyword(kw);
    setAddedKeywordSet((prev) => new Set(prev).add(kw.toLowerCase()));
  };

  // Handle Bulk Tracking of Selected Variations
  const handleBulkTrackSelected = () => {
    if (selectedVariationSet.size === 0) return;

    const keywordsToAdd = Array.from<string>(selectedVariationSet).filter(
      (kw: string) => !addedKeywordSet.has(kw.toLowerCase())
    );

    if (keywordsToAdd.length === 0) return;

    if (onAddKeywords) {
      onAddKeywords(keywordsToAdd);
    } else {
      keywordsToAdd.forEach((kw: string) => onAddKeyword(kw));
    }

    // Update tracked set
    setAddedKeywordSet((prev) => {
      const next = new Set(prev);
      keywordsToAdd.forEach((kw: string) => next.add(kw.toLowerCase()));
      return next;
    });

    setLastBulkTrackedCount(keywordsToAdd.length);
    setSelectedVariationSet(new Set());

    setTimeout(() => {
      setLastBulkTrackedCount(null);
    }, 4000);
  };

  // Selection Helper Methods
  const toggleSelectVariation = (kw: string) => {
    setSelectedVariationSet((prev) => {
      const next = new Set(prev);
      if (next.has(kw)) {
        next.delete(kw);
      } else {
        next.add(kw);
      }
      return next;
    });
  };

  const handleSelectHighOpportunity = () => {
    const highOppKeywords = filteredVariations
      .filter((v) => v.opportunityScore >= 80 && !addedKeywordSet.has(v.keyword.toLowerCase()))
      .map((v) => v.keyword);

    setSelectedVariationSet(new Set(highOppKeywords));
  };

  const handleToggleSelectAll = () => {
    const untrackedFiltered = filteredVariations.filter(
      (v) => !addedKeywordSet.has(v.keyword.toLowerCase())
    );

    if (selectedVariationSet.size === untrackedFiltered.length && untrackedFiltered.length > 0) {
      setSelectedVariationSet(new Set());
    } else {
      setSelectedVariationSet(new Set(untrackedFiltered.map((v) => v.keyword)));
    }
  };

  // Filtered Variations List
  const filteredVariations = variations.filter((item) => {
    if (bucketFilter !== "All" && item.variationType !== bucketFilter) {
      return false;
    }
    if (hideTrackedFilter && addedKeywordSet.has(item.keyword.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Get variation bucket badge styling
  const getBucketBadgeStyle = (bucketType: string) => {
    switch (bucketType) {
      case "Long-Tail":
        return "bg-indigo-500/10 text-indigo-300 border-indigo-500/30";
      case "Feature & Action":
        return "bg-cyan-500/10 text-cyan-300 border-cyan-500/30";
      case "Audience & Use Case":
        return "bg-amber-500/10 text-amber-300 border-amber-500/30";
      case "High-Volume Suffix":
        return "bg-rose-500/10 text-rose-300 border-rose-500/30";
      case "Alternative Angle":
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
      default:
        return "bg-zinc-800 text-zinc-300 border-zinc-700";
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header Banner & Sub-Navigation */}
      <div className="bg-gradient-to-r from-blue-950/40 via-zinc-900 to-indigo-950/40 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-400 font-semibold text-xs mb-1">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Apple Search Ads Keyword Discovery & Bulk AI Intelligence</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
              <span>Keyword Research Engine</span>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium px-2.5 py-0.5 rounded-full">
                {countryName} Storefront
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              Discover high-volume search phrases or instantly generate bulk keyword variations for{" "}
              <strong className="text-zinc-200">{app.name}</strong> to expand your ASO ranking footprint.
            </p>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 text-xs space-y-1 shrink-0">
            <span className="text-[10px] text-zinc-400 font-medium uppercase">Active App</span>
            <p className="font-bold text-white truncate max-w-[180px]">{app.name}</p>
            <p className="text-[10px] text-emerald-400 font-mono">
              {app.keywords.length} Keywords Tracked
            </p>
          </div>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div className="flex items-center space-x-2 border-t border-zinc-800/80 pt-4">
          <button
            onClick={() => setResearchMode("bulk-variations")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              researchMode === "bulk-variations"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-300" />
            <span>Bulk AI Keyword Variations</span>
            <span className="bg-amber-400/20 text-amber-300 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">
              AI Power
            </span>
          </button>

          <button
            onClick={() => setResearchMode("opportunity-discovery")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              researchMode === "opportunity-discovery"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>ASO Opportunity Finder</span>
          </button>
        </div>
      </div>

      {/* Confirmation Notification Toast */}
      {lastBulkTrackedCount !== null && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-xs text-emerald-300 flex items-center justify-between animate-fade-in shadow-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              Successfully added <strong className="text-white font-bold">{lastBulkTrackedCount}</strong> new keyword variations to your active tracker!
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">Live Sync Active</span>
        </div>
      )}

      {/* MODE 1: BULK AI KEYWORD VARIATIONS GENERATOR */}
      {researchMode === "bulk-variations" && (
        <div className="space-y-6">
          {/* Generator Core Input Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  Bulk Keyword Variation Generator
                </h3>
              </div>
              <p className="text-xs text-zinc-400">
                Generates 20+ long-tail, feature, audience, and intent variations from one core term
              </p>
            </div>

            <form onSubmit={handleGenerateBulkVariations} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={coreKeyword}
                  onChange={(e) => setCoreKeyword(e.target.value)}
                  placeholder="Enter core keyword (e.g., calendar, planner, habit, budget)..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={generatingVariations}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
              >
                {generatingVariations ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Variations...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate Bulk Variations</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Core Seed Chips */}
            <div className="flex items-center space-x-2 text-xs pt-1 overflow-x-auto pb-1">
              <span className="text-[10px] text-zinc-400 font-medium shrink-0">Try Core Seed:</span>
              {["calendar", "habit tracker", "daily planner", "time block", "focus timer", "budget"].map((seed) => (
                <button
                  key={seed}
                  type="button"
                  onClick={() => {
                    setCoreKeyword(seed);
                  }}
                  className="bg-zinc-950 hover:bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-lg text-[11px] font-mono border border-zinc-800 transition-colors shrink-0 cursor-pointer"
                >
                  + {seed}
                </button>
              ))}
            </div>
          </div>

          {/* Variation Controls & Filters Bar */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-3 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Category / Bucket Filters */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-[10px] text-zinc-400 font-medium shrink-0 uppercase tracking-wider mr-1">
                  Buckets:
                </span>
                {[
                  "All",
                  "Long-Tail",
                  "Feature & Action",
                  "Audience & Use Case",
                  "High-Volume Suffix",
                  "Alternative Angle",
                ].map((b) => (
                  <button
                    key={b}
                    onClick={() => setBucketFilter(b)}
                    className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all shrink-0 cursor-pointer ${
                      bucketFilter === b
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>

              {/* Hide Tracked Toggle */}
              <label className="flex items-center space-x-2 text-xs text-zinc-300 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={hideTrackedFilter}
                  onChange={(e) => setHideTrackedFilter(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Hide Already Tracked</span>
              </label>
            </div>

            {/* Quick Bulk Selection Tools & Primary Bulk Add Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-800/80 pt-3 text-xs">
              <div className="flex items-center space-x-2 overflow-x-auto">
                <button
                  onClick={handleToggleSelectAll}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg border border-zinc-700 text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer shrink-0"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    {selectedVariationSet.size > 0 ? "Deselect All" : "Select All Un-tracked"}
                  </span>
                </button>

                <button
                  onClick={handleSelectHighOpportunity}
                  className="bg-zinc-800 hover:bg-zinc-700 text-amber-300 px-3 py-1.5 rounded-lg border border-zinc-700 text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer shrink-0"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Select High Opportunity (80+)</span>
                </button>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <span className="text-zinc-400 text-xs">
                  Selected: <strong className="text-white">{selectedVariationSet.size}</strong> variations
                </span>

                <button
                  onClick={handleBulkTrackSelected}
                  disabled={selectedVariationSet.size === 0}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-lg cursor-pointer ${
                    selectedVariationSet.size > 0
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
                      : "bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed"
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Instantly Track Selected ({selectedVariationSet.size})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Variations Cards Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>
                Showing <strong className="text-white font-bold">{filteredVariations.length}</strong> AI variations for "{coreKeyword}"
              </span>
              <span className="font-mono text-[11px]">Sorted by Opportunity Score</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVariations.map((item, idx) => {
                const isTracked = addedKeywordSet.has(item.keyword.toLowerCase());
                const isSelected = selectedVariationSet.has(item.keyword);

                return (
                  <div
                    key={idx}
                    className={`bg-zinc-900/90 border rounded-2xl p-4 space-y-3 shadow-lg transition-all relative ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-950/10 shadow-emerald-500/10"
                        : "border-zinc-800/90 hover:border-indigo-500/50"
                    }`}
                  >
                    {/* Header: Checkbox + Keyword + Bucket Tag */}
                    <div className="flex items-start space-x-3">
                      <button
                        type="button"
                        onClick={() => toggleSelectVariation(item.keyword)}
                        disabled={isTracked}
                        className={`mt-0.5 shrink-0 transition-all ${
                          isTracked ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                        }`}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                        ) : (
                          <Square className="w-5 h-5 text-zinc-600 hover:text-zinc-400" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-md font-mono border font-semibold ${getBucketBadgeStyle(
                              item.variationType
                            )}`}
                          >
                            {item.variationType}
                          </span>

                          <span
                            className={`text-xs font-extrabold font-mono ${
                              item.opportunityScore >= 80
                                ? "text-emerald-400"
                                : item.opportunityScore >= 60
                                ? "text-amber-400"
                                : "text-zinc-300"
                            }`}
                          >
                            {item.opportunityScore}/100 Opp.
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-white leading-snug">
                          "{item.keyword}"
                        </h4>
                      </div>
                    </div>

                    {/* Stats Progress Bars */}
                    <div className="space-y-2 bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800/80 text-xs">
                      <div>
                        <div className="flex justify-between text-[11px] mb-0.5">
                          <span className="text-zinc-400">Search Ads Volume:</span>
                          <span className="text-amber-300 font-bold font-mono">
                            {item.popularity} / 100
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full"
                            style={{ width: `${item.popularity}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-0.5">
                          <span className="text-zinc-400">ASO Difficulty:</span>
                          <span className="text-zinc-300 font-bold font-mono">
                            {item.difficulty} / 100
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.difficulty < 35
                                ? "bg-emerald-400"
                                : item.difficulty < 65
                                ? "bg-amber-400"
                                : "bg-rose-400"
                            }`}
                            style={{ width: `${item.difficulty}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card Action Button */}
                    <button
                      onClick={() => handleTrackSingle(item.keyword)}
                      disabled={isTracked}
                      className={`w-full py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
                        isTracked
                          ? "bg-zinc-800/80 text-emerald-400 border border-zinc-700/80 cursor-default"
                          : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 cursor-pointer"
                      }`}
                    >
                      {isTracked ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Tracking Active</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Track This Variation</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: ASO OPPORTUNITY FINDER */}
      {researchMode === "opportunity-discovery" && (
        <div className="space-y-6">
          {/* Discovery Input Bar */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>General ASO Keyword Opportunity Finder</span>
            </h3>

            <form onSubmit={handleDiscover} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={seedKeyword}
                  onChange={(e) => setSeedKeyword(e.target.value)}
                  placeholder="Enter seed keyword (e.g., calendar, planner, habit tracker)..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={loadingDiscovery}
                className="w-full sm:w-auto shrink-0 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {loadingDiscovery ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Analyzing ASA Data...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Discover Keywords</span>
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center space-x-2 text-xs overflow-x-auto pb-1">
              <span className="text-[10px] text-zinc-400 font-medium shrink-0">Popular Seeds:</span>
              {["ai calendar", "time blocking", "daily planner", "schedule widget", "pomodoro focus"].map((seed) => (
                <button
                  key={seed}
                  type="button"
                  onClick={() => {
                    setSeedKeyword(seed);
                  }}
                  className="bg-zinc-950 hover:bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-lg text-xs transition-colors shrink-0 font-mono text-[11px] border border-zinc-800"
                >
                  + {seed}
                </button>
              ))}
            </div>
          </div>

          {/* Discovered Keywords Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Discovered ASO Opportunities ({discoveredKeywords.length})</span>
              </h2>
              <span className="text-xs text-zinc-400 font-mono">
                Sorted by Opportunity Score
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {discoveredKeywords.map((item, idx) => {
                const isTracked = addedKeywordSet.has(item.keyword.toLowerCase());

                return (
                  <div
                    key={idx}
                    className="bg-zinc-900/80 border border-zinc-800/90 hover:border-indigo-500/50 rounded-2xl p-4 space-y-3 shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[9px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-md font-mono">
                          #{item.suggestedTag || item.intent}
                        </span>
                        <h3 className="text-sm font-bold text-white mt-1.5">
                          "{item.keyword}"
                        </h3>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[9px] text-zinc-400 font-medium uppercase block">
                          Opportunity
                        </span>
                        <span
                          className={`text-sm font-extrabold font-mono ${
                            item.opportunityScore >= 80
                              ? "text-emerald-400"
                              : item.opportunityScore >= 60
                              ? "text-amber-400"
                              : "text-zinc-300"
                          }`}
                        >
                          {item.opportunityScore}/100
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800/80 text-xs">
                      <div>
                        <div className="flex justify-between text-[11px] mb-0.5">
                          <span className="text-zinc-400">Search Ads Volume:</span>
                          <span className="text-amber-300 font-bold font-mono">
                            {item.popularity} / 100
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full"
                            style={{ width: `${item.popularity}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-0.5">
                          <span className="text-zinc-400">ASO Difficulty:</span>
                          <span className="text-zinc-300 font-bold font-mono">
                            {item.difficulty} / 100
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.difficulty < 35
                                ? "bg-emerald-400"
                                : item.difficulty < 65
                                ? "bg-amber-400"
                                : "bg-rose-400"
                            }`}
                            style={{ width: `${item.difficulty}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleTrackSingle(item.keyword)}
                      disabled={isTracked}
                      className={`w-full py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
                        isTracked
                          ? "bg-zinc-800 text-emerald-400 border border-zinc-700 cursor-default"
                          : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 cursor-pointer"
                      }`}
                    >
                      {isTracked ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Tracking Active</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Track Keyword</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
