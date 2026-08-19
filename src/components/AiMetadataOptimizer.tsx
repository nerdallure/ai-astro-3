import React, { useState, useEffect } from "react";
import { TrackedApp } from "../types";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  Wand2,
  Loader2,
  HelpCircle,
  TrendingUp,
  Save,
  Layers,
  ArrowRight,
  Search,
  Globe,
} from "lucide-react";

interface AiMetadataOptimizerProps {
  app: TrackedApp;
  onUpdateMetadata: (metadata: { title: string; subtitle: string; keywordField: string }) => void;
  countryCode?: string;
  countryName: string;
}

export const AiMetadataOptimizer: React.FC<AiMetadataOptimizerProps> = ({
  app,
  onUpdateMetadata,
  countryCode = "us",
  countryName,
}) => {
  const [title, setTitle] = useState(app.metadata?.title || "");
  const [subtitle, setSubtitle] = useState(app.metadata?.subtitle || "");
  const [keywordField, setKeywordField] = useState(app.metadata?.keywordField || "");
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);

  // Sync inputs whenever selected app changes or metadata changes
  useEffect(() => {
    setTitle(app.metadata?.title || "");
    setSubtitle(app.metadata?.subtitle || "");
    setKeywordField(app.metadata?.keywordField || "");
    setAiResult(null);
    setSavedSuccess(false);
  }, [app.id, app.metadata?.title, app.metadata?.subtitle, app.metadata?.keywordField]);

  // Character Count Helpers
  const titleLen = title.length;
  const subtitleLen = subtitle.length;
  const keywordLen = keywordField.length;

  // Extract tracked keywords to suggest for the 100-character field
  const trackedKeywordsList = app.keywords.map((k) => k.keyword.toLowerCase().trim()).filter(Boolean);

  const handleAutoFormatKeywords = () => {
    // Clean keyword field: comma separated, no spaces after commas, unique words, remove words present in title or subtitle
    const titleWords = new Set(
      title.toLowerCase().replace(/[^a-z0-9]/g, " ").split(/\s+/).filter(Boolean)
    );
    const subtitleWords = new Set(
      subtitle.toLowerCase().replace(/[^a-z0-9]/g, " ").split(/\s+/).filter(Boolean)
    );

    const rawKw = keywordField
      .toLowerCase()
      .split(/[,;\n]+/)
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const uniqueCleanKw: string[] = [];
    for (const kw of rawKw) {
      if (!uniqueCleanKw.includes(kw) && !titleWords.has(kw) && !subtitleWords.has(kw)) {
        uniqueCleanKw.push(kw);
      }
    }

    const formatted = uniqueCleanKw.join(",");
    setKeywordField(formatted);
    onUpdateMetadata({ title, subtitle, keywordField: formatted });
  };

  const handleSyncTrackedKeywordsToField = () => {
    const titleWords = new Set(
      title.toLowerCase().replace(/[^a-z0-9]/g, " ").split(/\s+/).filter(Boolean)
    );
    const subtitleWords = new Set(
      subtitle.toLowerCase().replace(/[^a-z0-9]/g, " ").split(/\s+/).filter(Boolean)
    );

    const validKw: string[] = [];
    let currentLen = 0;

    for (const kw of trackedKeywordsList) {
      if (!titleWords.has(kw) && !subtitleWords.has(kw) && !validKw.includes(kw)) {
        const testStr = [...validKw, kw].join(",");
        if (testStr.length <= 100) {
          validKw.push(kw);
          currentLen = testStr.length;
        }
      }
    }

    const result = validKw.join(",");
    setKeywordField(result);
    onUpdateMetadata({ title, subtitle, keywordField: result });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleGenerateAiMetadata = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/gemini/aso-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appName: app.name,
          category: app.category,
          currentTitle: title || app.metadata.title,
          currentSubtitle: subtitle || app.metadata.subtitle,
          currentKeywords: keywordField || app.metadata.keywordField,
          country: countryCode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiResult(data);
        const newTitle = data.optimizedTitle || title;
        const newSub = data.optimizedSubtitle || subtitle;
        const newKw = data.optimizedKeywordField || keywordField;

        setTitle(newTitle);
        setSubtitle(newSub);
        setKeywordField(newKw);

        onUpdateMetadata({
          title: newTitle,
          subtitle: newSub,
          keywordField: newKw,
        });
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } catch (err) {
      console.error("AI Metadata error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveToApp = () => {
    onUpdateMetadata({ title, subtitle, keywordField });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-indigo-950/40 border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 font-semibold text-xs mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Apple App Store Guidelines & Keyword Field Optimizer</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              AI Metadata & Keyword Field Optimizer
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              Optimize Title (30c max), Subtitle (30c max), and 100-character Keyword Field to maximize Apple Search Ads indexability and organic traffic for <strong className="text-zinc-200">{app.name}</strong> in <strong className="text-zinc-200">{countryName}</strong>.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSyncTrackedKeywordsToField}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-zinc-700 transition-colors flex items-center space-x-1.5 cursor-pointer"
              title="Auto-fill 100-character keyword field using your top ranked keywords"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Fill from Tracked ({trackedKeywordsList.length})</span>
            </button>

            <button
              onClick={handleGenerateAiMetadata}
              disabled={loading}
              className="shrink-0 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Optimizing with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-black" />
                  <span>Generate with Gemini AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Metadata Inputs */}
        <div className="lg:col-span-2 space-y-5 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white">App Store Metadata Editor</h2>
              <span className="text-[11px] text-zinc-400 font-mono">({app.name})</span>
            </div>

            <button
              onClick={handleSaveToApp}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
                savedSuccess
                  ? "bg-emerald-600 text-white"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white"
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved to App!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Metadata</span>
                </>
              )}
            </button>
          </div>

          {/* Title Field (30 chars) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-zinc-200">App Store Title</label>
              <span
                className={`font-mono text-[11px] font-bold ${
                  titleLen > 30
                    ? "text-rose-400"
                    : titleLen >= 25
                    ? "text-emerald-400"
                    : "text-amber-400"
                }`}
              >
                {titleLen} / 30 chars
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                maxLength={40}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSaveToApp}
                className={`w-full bg-zinc-950 border rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none ${
                  titleLen > 30 ? "border-rose-500" : "border-zinc-800 focus:border-indigo-500"
                }`}
              />
              <button
                onClick={() => handleCopy(title, "title")}
                className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-white p-1"
                title="Copy Title"
              >
                {copiedField === "title" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-zinc-400">
              Highest weight in Apple's algorithm. Include brand + primary keyword.
            </p>
          </div>

          {/* Subtitle Field (30 chars) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-zinc-200">App Store Subtitle</label>
              <span
                className={`font-mono text-[11px] font-bold ${
                  subtitleLen > 30
                    ? "text-rose-400"
                    : subtitleLen >= 25
                    ? "text-emerald-400"
                    : "text-amber-400"
                }`}
              >
                {subtitleLen} / 30 chars
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                maxLength={40}
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                onBlur={handleSaveToApp}
                className={`w-full bg-zinc-950 border rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none ${
                  subtitleLen > 30 ? "border-rose-500" : "border-zinc-800 focus:border-indigo-500"
                }`}
              />
              <button
                onClick={() => handleCopy(subtitle, "subtitle")}
                className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-white p-1"
                title="Copy Subtitle"
              >
                {copiedField === "subtitle" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-zinc-400">
              Second highest weight. Describe value proposition + secondary keywords.
            </p>
          </div>

          {/* Keyword Field (100 chars) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-zinc-200">100-Char Keyword Field</label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleAutoFormatKeywords}
                  className="text-[10px] text-amber-400 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <Wand2 className="w-3 h-3" />
                  <span>Auto-Format & Clean</span>
                </button>
                <span
                  className={`font-mono text-[11px] font-bold ${
                    keywordLen > 100
                      ? "text-rose-400"
                      : keywordLen >= 90
                      ? "text-emerald-400"
                      : "text-amber-400"
                  }`}
                >
                  {keywordLen} / 100 chars
                </span>
              </div>
            </div>
            <div className="relative">
              <textarea
                rows={3}
                maxLength={120}
                value={keywordField}
                onChange={(e) => setKeywordField(e.target.value)}
                onBlur={handleSaveToApp}
                className={`w-full bg-zinc-950 border rounded-xl p-3 text-xs font-mono text-white focus:outline-none ${
                  keywordLen > 100 ? "border-rose-500" : "border-zinc-800 focus:border-indigo-500"
                }`}
              />
              <button
                onClick={() => handleCopy(keywordField, "keywordField")}
                className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-white p-1"
                title="Copy Keyword Field"
              >
                {copiedField === "keywordField" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-zinc-400">
              Rules: Comma-separated. Do NOT use spaces after commas. Do NOT duplicate words that exist in Title or Subtitle.
            </p>
          </div>
        </div>

        {/* Right Column (1/3): Rules Checklist & AI Tips */}
        <div className="space-y-4">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-zinc-800 pb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Apple ASO Rules Checklist</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-zinc-300">Title ≤ 30 chars</span>
                {titleLen <= 30 ? (
                  <span className="text-emerald-400 font-bold">✓ Valid ({titleLen}/30)</span>
                ) : (
                  <span className="text-rose-400 font-bold">✕ Exceeded ({titleLen}/30)</span>
                )}
              </div>

              <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-zinc-300">Subtitle ≤ 30 chars</span>
                {subtitleLen <= 30 ? (
                  <span className="text-emerald-400 font-bold">✓ Valid ({subtitleLen}/30)</span>
                ) : (
                  <span className="text-rose-400 font-bold">✕ Exceeded ({subtitleLen}/30)</span>
                )}
              </div>

              <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-zinc-300">Keyword Field ≤ 100 chars</span>
                {keywordLen <= 100 ? (
                  <span className="text-emerald-400 font-bold">✓ Valid ({keywordLen}/100)</span>
                ) : (
                  <span className="text-rose-400 font-bold">✕ Exceeded ({keywordLen}/100)</span>
                )}
              </div>

              <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-zinc-300">No spaces after commas</span>
                {!keywordField.includes(", ") ? (
                  <span className="text-emerald-400 font-bold">✓ Saved Chars</span>
                ) : (
                  <span className="text-amber-400 font-bold">⚠️ Has spaces</span>
                )}
              </div>
            </div>
          </div>

          {/* AI Tips Box */}
          {aiResult && (
            <div className="bg-gradient-to-br from-amber-950/30 via-zinc-900 to-zinc-900 border border-amber-500/30 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-amber-300 font-bold text-xs">
                <span>Gemini ASO Recommendations</span>
                <span className="text-emerald-400 font-mono">
                  {aiResult.estimatedOrganicReachBoost || "+35% Reach"}
                </span>
              </div>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                {aiResult.actionableTips?.map((tip: string, idx: number) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
