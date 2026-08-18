import React, { useState, useRef } from "react";
import { TrackedApp, TrackedKeyword } from "../types";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  FileText,
  Download,
  Loader2,
  X,
  Sparkles,
  BarChart3,
  Target,
  Flame,
  CheckCircle2,
  Calendar,
  Globe,
  Award,
} from "lucide-react";
import { RankDistributionSummary } from "./RankDistributionSummary";
import { DifficultyVsRankScatter } from "./DifficultyVsRankScatter";
import { KeywordHeatmap } from "./KeywordHeatmap";
import { PopularitySparkline } from "./PopularitySparkline";
import { PredictiveTrendsWidget } from "./PredictiveTrendsWidget";

interface PdfExportModalProps {
  app: TrackedApp;
  countryName: string;
  onClose: () => void;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  app,
  countryName,
  onClose,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [includeHeatmap, setIncludeHeatmap] = useState(true);
  const [includeScatter, setIncludeScatter] = useState(true);
  const [includePredictiveTrends, setIncludePredictiveTrends] = useState(true);
  const [includeDistribution, setIncludeDistribution] = useState(true);
  const [includeFullTable, setIncludeFullTable] = useState(true);

  const reportRef = useRef<HTMLDivElement>(null);

  const totalKeywords = app.keywords.length;
  const top3 = app.keywords.filter((k) => k.currentRank !== null && k.currentRank <= 3).length;
  const top10 = app.keywords.filter((k) => k.currentRank !== null && k.currentRank <= 10).length;
  const top20 = app.keywords.filter((k) => k.currentRank !== null && k.currentRank <= 20).length;
  const ranked = app.keywords.filter((k) => k.currentRank !== null && k.currentRank <= 50).length;
  const visibilityRate = Math.round((ranked / (totalKeywords || 1)) * 100);

  const avgDiff = Math.round(
    app.keywords.reduce((acc, k) => acc + k.difficulty, 0) / (totalKeywords || 1)
  );
  const avgPop = Math.round(
    app.keywords.reduce((acc, k) => acc + k.popularity, 0) / (totalKeywords || 1)
  );
  const totalEstInstalls = app.keywords.reduce((acc, k) => acc + k.estimatedInstalls, 0);

  const currentDateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    setDownloadSuccess(false);

    try {
      // Small timeout to ensure any state render/layout calculation is settled
      await new Promise((resolve) => setTimeout(resolve, 300));

      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // High DPI render
        useCORS: true,
        logging: false,
        backgroundColor: "#09090b", // Dark theme background
        windowWidth: 1200,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width mm
      const pageHeight = 297; // A4 height mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `${app.name.replace(/[^a-zA-Z0-9]/g, "_")}_ASO_Report_${
        new Date().toISOString().split("T")[0]
      }.pdf`;

      pdf.save(fileName);
      setDownloadSuccess(true);
    } catch (err) {
      console.error("Failed to generate PDF report:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-4xl w-full my-auto shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-zinc-800 bg-zinc-950/80">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <FileText className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                <span>Export Keyword Summary PDF Report</span>
                <span className="text-[10px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-medium">
                  ASO Intelligence
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Formatted executive PDF export for {app.name} ({countryName})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Controls Bar */}
        <div className="p-4 sm:px-6 bg-zinc-900/90 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-zinc-400 font-semibold">Report Sections:</span>
            <label className="flex items-center space-x-1.5 text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeDistribution}
                onChange={(e) => setIncludeDistribution(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
              />
              <span>Rank Bar Chart</span>
            </label>
            <label className="flex items-center space-x-1.5 text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeScatter}
                onChange={(e) => setIncludeScatter(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
              />
              <span>Difficulty Correlation</span>
            </label>
            <label className="flex items-center space-x-1.5 text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includePredictiveTrends}
                onChange={(e) => setIncludePredictiveTrends(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
              />
              <span>Predictive Trends (30D)</span>
            </label>
            <label className="flex items-center space-x-1.5 text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeHeatmap}
                onChange={(e) => setIncludeHeatmap(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
              />
              <span>Keyword Heatmap</span>
            </label>
            <label className="flex items-center space-x-1.5 text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeFullTable}
                onChange={(e) => setIncludeFullTable(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
              />
              <span>Keyword Table</span>
            </label>
          </div>

          <div className="flex items-center space-x-2 ml-auto">
            {downloadSuccess && (
              <span className="text-emerald-400 flex items-center space-x-1 font-medium text-xs mr-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>PDF Exported!</span>
              </span>
            )}
            <button
              disabled={isGenerating}
              onClick={handleDownloadPdf}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>Download PDF Report</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Printable Preview Window */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-zinc-950/60">
          <p className="text-xs text-zinc-400 mb-3 font-mono flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Document Layout Preview (Ready for rendering)</span>
          </p>

          {/* Target PDF Element Container */}
          <div
            ref={reportRef}
            className="bg-zinc-950 text-white p-6 sm:p-8 rounded-2xl border border-zinc-800 shadow-2xl space-y-6 max-w-3xl mx-auto font-sans"
            style={{ minWidth: "720px" }}
          >
            {/* Report Document Header */}
            <div className="border-b border-zinc-800 pb-5 flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={app.iconUrl}
                  alt={app.name}
                  className="w-16 h-16 rounded-2xl border border-zinc-700 object-cover shadow-md"
                />
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tight">{app.name}</h1>
                  <p className="text-xs text-indigo-400 font-semibold mt-0.5">
                    {app.developer} • {app.category}
                  </p>
                  <div className="flex items-center space-x-3 text-[11px] text-zinc-400 mt-1 font-mono">
                    <span className="flex items-center space-x-1">
                      <Globe className="w-3 h-3 text-indigo-400" />
                      <span>{countryName} ({app.platform})</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-indigo-400" />
                      <span>{currentDateStr}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase font-bold bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                  ASO Intelligence Report
                </span>
                <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                  {totalKeywords} Keywords Analyzed
                </p>
              </div>
            </div>

            {/* Executive Summary Metrics Box */}
            <div className="grid grid-cols-4 gap-3 bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl text-center">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">
                  Top 3 Rank
                </span>
                <span className="text-xl font-black text-emerald-400 font-mono mt-0.5 block">
                  {top3}
                </span>
                <span className="text-[9px] text-zinc-500 font-mono">
                  {Math.round((top3 / (totalKeywords || 1)) * 100)}% of total
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">
                  Top 10 Rank
                </span>
                <span className="text-xl font-black text-indigo-300 font-mono mt-0.5 block">
                  {top10}
                </span>
                <span className="text-[9px] text-zinc-500 font-mono">
                  {Math.round((top10 / (totalKeywords || 1)) * 100)}% of total
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">
                  Visibility Rate
                </span>
                <span className="text-xl font-black text-sky-400 font-mono mt-0.5 block">
                  {visibilityRate}%
                </span>
                <span className="text-[9px] text-zinc-500 font-mono">
                  {ranked} keywords &le; #50
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">
                  Est. Monthly Installs
                </span>
                <span className="text-xl font-black text-amber-400 font-mono mt-0.5 block">
                  {totalEstInstalls.toLocaleString()}
                </span>
                <span className="text-[9px] text-zinc-500 font-mono">
                  Avg Pop: {avgPop} / Diff: {avgDiff}
                </span>
              </div>
            </div>

            {/* Section 1: Rank Distribution Bar Chart */}
            {includeDistribution && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center space-x-2">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>1. Keyword Rank Distribution Summary</span>
                </h3>
                <RankDistributionSummary
                  keywords={app.keywords}
                  activeRankFilter={null}
                  onSelectRankFilter={() => {}}
                />
              </div>
            )}

            {/* Section 2: Difficulty vs Rank Scatter Correlation */}
            {includeScatter && (
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center space-x-2">
                  <Target className="w-3.5 h-3.5 text-purple-400" />
                  <span>2. Keyword Difficulty vs. Current Rank Correlation</span>
                </h3>
                <DifficultyVsRankScatter
                  keywords={app.keywords}
                  onSelectKeyword={() => {}}
                />
              </div>
            )}

            {/* Section 3: Predictive Trends 30-Day Forecasting */}
            {includePredictiveTrends && (
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>3. 30-Day Predictive Popularity Forecasting (Linear Regression OLS)</span>
                </h3>
                <PredictiveTrendsWidget
                  keywords={app.keywords}
                />
              </div>
            )}

            {/* Section 3: Keyword Heatmap */}
            {includeHeatmap && (
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center space-x-2">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>3. ASA Popularity vs. Difficulty Opportunity Matrix</span>
                </h3>
                <KeywordHeatmap
                  keywords={app.keywords}
                  activeQuadrant={null}
                  onSelectQuadrant={() => {}}
                />
              </div>
            )}

            {/* Section 4: Full Tracked Keyword Table */}
            {includeFullTable && (
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
                  <span>4. Complete Tracked Keywords Breakdown</span>
                  <span className="text-[10px] font-mono text-zinc-500 font-normal">
                    {app.keywords.length} items
                  </span>
                </h3>

                <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/60">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-zinc-950 text-zinc-400 uppercase text-[9px] font-bold border-b border-zinc-800">
                      <tr>
                        <th className="py-2.5 px-3">Keyword</th>
                        <th className="py-2.5 px-2 text-center">Rank</th>
                        <th className="py-2.5 px-2 text-center">ASA Pop</th>
                        <th className="py-2.5 px-2 text-center">Difficulty</th>
                        <th className="py-2.5 px-2 text-right">Est. Installs</th>
                        <th className="py-2.5 px-3">Tags</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
                      {app.keywords.map((kw) => (
                        <tr key={kw.id} className="hover:bg-zinc-800/30">
                          <td className="py-2 px-3 font-semibold text-white">
                            {kw.keyword}
                          </td>
                          <td className="py-2 px-2 text-center font-mono">
                            {kw.currentRank !== null ? (
                              <span
                                className={`px-2 py-0.5 rounded font-bold ${
                                  kw.currentRank <= 5
                                    ? "bg-emerald-500/20 text-emerald-300"
                                    : kw.currentRank <= 10
                                    ? "bg-indigo-500/20 text-indigo-300"
                                    : "bg-zinc-800 text-zinc-300"
                                }`}
                              >
                                #{kw.currentRank}
                              </span>
                            ) : (
                              <span className="text-zinc-600 font-mono">50+</span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-center font-mono">
                            <div className="flex items-center justify-center space-x-1.5">
                              <span className="text-amber-300 font-bold">{kw.popularity}</span>
                              <PopularitySparkline
                                popularity={kw.popularity}
                                keywordId={kw.id}
                                history={kw.history}
                                width={50}
                                height={18}
                              />
                            </div>
                          </td>
                          <td className="py-2 px-2 text-center font-mono text-zinc-300">
                            {kw.difficulty}
                          </td>
                          <td className="py-2 px-2 text-right font-mono text-emerald-400 font-bold">
                            {kw.estimatedInstalls.toLocaleString()}
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex flex-wrap gap-1">
                              {kw.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[9px] bg-zinc-800 text-zinc-300 px-1.5 py-0.2 rounded font-mono"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Document Footer */}
            <div className="border-t border-zinc-800 pt-4 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
              <span>Generated by AppStore Keyword Tracker • Confidential ASO Report</span>
              <span>{app.name} — Page 1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
