import React, { useState } from "react";
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
} from "lucide-react";

interface AiMetadataOptimizerProps {
  app: TrackedApp;
  onUpdateMetadata: (metadata: { title: string; subtitle: string; keywordField: string }) => void;
  countryName: string;
}

export const AiMetadataOptimizer: React.FC<AiMetadataOptimizerProps> = ({
  app,
  onUpdateMetadata,
  countryName,
}) => {
  const [title, setTitle] = useState(app.metadata.title);
  const [subtitle, setSubtitle] = useState(app.metadata.subtitle);
  const [keywordField, setKeywordField] = useState(app.metadata.keywordField);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<any | null>(null);

  // Character Count Helpers
  const titleLen = title.length;
  const subtitleLen = subtitle.length;
  const keywordLen = keywordField.length;

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
          currentTitle: title,
          currentSubtitle: subtitle,
          currentKeywords: keywordField,
          country: app.country,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiResult(data);
        if (data.optimizedTitle) setTitle(data.optimizedTitle);
        if (data.optimizedSubtitle) setSubtitle(data.optimizedSubtitle);
        if (data.optimizedKeywordField) setKeywordField(data.optimizedKeywordField);
        onUpdateMetadata({
          title: data.optimizedTitle || title,
          subtitle: data.optimizedSubtitle || subtitle,
          keywordField: data.optimizedKeywordField || keywordField,
        });
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
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-indigo-950/40 border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 font-semibold text-xs mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Apple App Store Guidelines Compliant Optimizer</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              AI Metadata & Keyword Field Optimizer
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              Optimize Title (30c max), Subtitle (30c max), and 100-character Keyword Field to maximize Apple Search Ads indexability and organic traffic in <strong className="text-zinc-200">{countryName}</strong>.
            </p>
          </div>

          <button
            onClick={handleGenerateAiMetadata}
            disabled={loading}
            className="shrink-0 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Optimizing with Gemini AI...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 text-black" />
                <span>Generate Optimized Metadata</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Metadata Inputs */}
        <div className="lg:col-span-2 space-y-5 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h2 className="text-sm font-bold text-white">App Store Metadata Editor</h2>
            <button
              onClick={handleSaveToApp}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-colors"
            >
              Save Metadata
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
                  className="text-[10px] text-amber-400 hover:underline flex items-center space-x-1"
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
                  <span className="text-emerald-400 font-bold">✓ Valid</span>
                ) : (
                  <span className="text-rose-400 font-bold">✕ Exceeded</span>
                )}
              </div>

              <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-zinc-300">Subtitle ≤ 30 chars</span>
                {subtitleLen <= 30 ? (
                  <span className="text-emerald-400 font-bold">✓ Valid</span>
                ) : (
                  <span className="text-rose-400 font-bold">✕ Exceeded</span>
                )}
              </div>

              <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-zinc-300">Keyword Field ≤ 100 chars</span>
                {keywordLen <= 100 ? (
                  <span className="text-emerald-400 font-bold">✓ Valid</span>
                ) : (
                  <span className="text-rose-400 font-bold">✕ Exceeded</span>
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
