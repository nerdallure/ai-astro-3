import React, { useState, useRef } from "react";
import { TrackedKeyword, TrackedApp, KeywordRankHistory, AppAlertSettings, RankingAlert } from "../types";
import { KeywordHeatmap } from "./KeywordHeatmap";
import { RankDistributionSummary } from "./RankDistributionSummary";
import { DifficultyVsRankScatter } from "./DifficultyVsRankScatter";
import { PredictiveTrendsWidget } from "./PredictiveTrendsWidget";
import { KeywordRankTrendChart } from "./KeywordRankTrendChart";
import { PdfExportModal } from "./PdfExportModal";
import { PopularitySparkline } from "./PopularitySparkline";
import { AlertSettingsPanel } from "./AlertSettingsPanel";
import { CsvImportModal } from "./CsvImportModal";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Plus,
  Trash2,
  Tag,
  Edit3,
  Search,
  Filter,
  Globe2,
  BarChart3,
  Languages,
  Check,
  ChevronRight,
  Info,
  Award,
  Flame,
  Target,
  FileText,
  X,
  Bell,
  ShieldAlert,
  Zap,
  Upload,
  FileSpreadsheet,
} from "lucide-react";

interface KeywordTrackerProps {
  app: TrackedApp;
  alerts?: RankingAlert[];
  onAddKeywords: (keywords: string[]) => void;
  onImportMappedKeywords?: (keywords: Partial<TrackedKeyword>[]) => void;
  onDeleteKeyword: (id: string) => void;
  onBulkDeleteKeywords?: (ids: string[]) => void;
  onBulkAssignTags?: (keywordIds: string[], tags: string[]) => void;
  onUpdateKeywordNotes: (id: string, notes: string) => void;
  onTranslateKeywords: () => void;
  countryCode?: string;
  countryName: string;
  onUpdateAlertSettings?: (appId: string, settings: AppAlertSettings) => void;
  onMarkAsRead?: (alertId: string) => void;
  onMarkAllAsRead?: () => void;
  onClearAlerts?: () => void;
  onTriggerTestAlert?: (keywordId?: string) => void;
}

export const KeywordTracker: React.FC<KeywordTrackerProps> = ({
  app,
  alerts = [],
  onAddKeywords,
  onImportMappedKeywords,
  onDeleteKeyword,
  onBulkDeleteKeywords,
  onBulkAssignTags,
  onUpdateKeywordNotes,
  onTranslateKeywords,
  countryCode = "us",
  countryName,
  onUpdateAlertSettings,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAlerts,
  onTriggerTestAlert,
}) => {
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvInitialFile, setCsvInitialFile] = useState<File | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKeywordInput, setNewKeywordInput] = useState("");
  const [editingNotesKeyword, setEditingNotesKeyword] = useState<TrackedKeyword | null>(null);
  const [notesInput, setNotesInput] = useState("");
  const [showTranslations, setShowTranslations] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showRankDistribution, setShowRankDistribution] = useState(true);
  const [showScatterPlot, setShowScatterPlot] = useState(true);
  const [showPredictiveTrends, setShowPredictiveTrends] = useState(true);
  const [show30DayTrendChart, setShow30DayTrendChart] = useState(true);
  const [showAlertsPanel, setShowAlertsPanel] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [activeQuadrantFilter, setActiveQuadrantFilter] = useState<string | null>(null);
  const [activeRankFilter, setActiveRankFilter] = useState<string | null>(null);
  const [selectedKeywordForHistory, setSelectedKeywordForHistory] = useState<TrackedKeyword | null>(
    app.keywords[0] || null
  );

  // Sync selected keyword when app changes
  React.useEffect(() => {
    setSelectedKeywordForHistory(app.keywords[0] || null);
    setSelectedKeywordIds([]);
    setSearchTerm("");
    setSelectedTag("All");
  }, [app.id]);

  const appAlerts = alerts.filter((a) => a.appId === app.id);
  const unreadAlertsCount = appAlerts.filter((a) => !a.read).length;

  // Bulk Selection States
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<string[]>([]);
  const [showBulkTagModal, setShowBulkTagModal] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [customTagInput, setCustomTagInput] = useState("");

  // Extract all unique tags
  const allTags = ["All", ...Array.from(new Set(app.keywords.flatMap((k) => k.tags)))];

  const filteredKeywords = app.keywords.filter((kw) => {
    const matchesSearch = kw.keyword.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === "All" || kw.tags.includes(selectedTag);

    let matchesQuadrant = true;
    if (activeQuadrantFilter === "sweetSpot") {
      matchesQuadrant = kw.popularity > 40 && kw.difficulty <= 50;
    } else if (activeQuadrantFilter === "competitiveGiants") {
      matchesQuadrant = kw.popularity > 40 && kw.difficulty > 50;
    } else if (activeQuadrantFilter === "nicheTargets") {
      matchesQuadrant = kw.popularity <= 40 && kw.difficulty <= 50;
    } else if (activeQuadrantFilter === "lowOpportunity") {
      matchesQuadrant = kw.popularity <= 40 && kw.difficulty > 50;
    }

    let matchesRank = true;
    if (activeRankFilter === "1-5") {
      matchesRank = kw.currentRank !== null && kw.currentRank >= 1 && kw.currentRank <= 5;
    } else if (activeRankFilter === "6-10") {
      matchesRank = kw.currentRank !== null && kw.currentRank >= 6 && kw.currentRank <= 10;
    } else if (activeRankFilter === "11-20") {
      matchesRank = kw.currentRank !== null && kw.currentRank >= 11 && kw.currentRank <= 20;
    } else if (activeRankFilter === "21-50") {
      matchesRank = kw.currentRank !== null && kw.currentRank >= 21 && kw.currentRank <= 50;
    } else if (activeRankFilter === "50+") {
      matchesRank = kw.currentRank === null || kw.currentRank > 50;
    }

    return matchesSearch && matchesTag && matchesQuadrant && matchesRank;
  });

  // Bulk Selection Helpers
  const isAllSelected =
    filteredKeywords.length > 0 &&
    filteredKeywords.every((kw) => selectedKeywordIds.includes(kw.id));

  const isSomeSelected =
    filteredKeywords.some((kw) => selectedKeywordIds.includes(kw.id)) &&
    !isAllSelected;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedKeywordIds([]);
    } else {
      setSelectedKeywordIds(filteredKeywords.map((kw) => kw.id));
    }
  };

  const handleToggleSelectRow = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedKeywordIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleConfirmBulkDelete = () => {
    if (selectedKeywordIds.length === 0) return;
    if (onBulkDeleteKeywords) {
      onBulkDeleteKeywords(selectedKeywordIds);
    } else {
      selectedKeywordIds.forEach((id) => onDeleteKeyword(id));
    }
    setSelectedKeywordIds([]);
    setShowBulkDeleteConfirm(false);
  };

  const handleConfirmBulkTag = (tagToApply: string) => {
    const cleanTag = tagToApply.trim().replace(/^#/, "");
    if (!cleanTag || selectedKeywordIds.length === 0) return;
    if (onBulkAssignTags) {
      onBulkAssignTags(selectedKeywordIds, [cleanTag]);
    }
    setShowBulkTagModal(false);
    setCustomTagInput("");
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeywordInput.trim()) return;
    const kwList = newKeywordInput
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    onAddKeywords(kwList);
    setNewKeywordInput("");
    setShowAddModal(false);
  };

  const handleSaveNotes = () => {
    if (editingNotesKeyword) {
      onUpdateKeywordNotes(editingNotesKeyword.id, notesInput);
      setEditingNotesKeyword(null);
    }
  };

  const activeKeyword = selectedKeywordForHistory || app.keywords[0];

  return (
    <div className="p-3 sm:p-5 space-y-4">
      {/* Top Banner Overview */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-indigo-950/40 border border-zinc-800 rounded-xl p-3.5 sm:p-4 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center space-x-3 min-w-0">
            <img
              src={app.iconUrl}
              alt={app.name}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border-2 border-zinc-700/80 shadow-md shrink-0"
            />
            <div className="min-w-0 truncate">
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">{app.name}</h1>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.2 rounded-full font-medium shrink-0">
                  {app.platform} • {countryName}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                {app.developer} • {app.category} • {app.keywords.length} Keywords Tracked
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setShowAlertsPanel(!showAlertsPanel)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer relative ${
                showAlertsPanel
                  ? "bg-rose-500/25 text-rose-300 border-rose-500/50 shadow-md"
                  : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white"
              }`}
            >
              <Bell className="w-3 h-3 text-rose-400" />
              <span>Alerts</span>
              {unreadAlertsCount > 0 && (
                <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full font-mono animate-pulse">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setShow30DayTrendChart(!show30DayTrendChart)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                show30DayTrendChart
                  ? "bg-indigo-600/30 text-indigo-300 border-indigo-500/50 shadow-sm"
                  : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200"
              }`}
            >
              <TrendingUp className="w-3 h-3 text-indigo-400" />
              <span>30D Trend</span>
            </button>

            <button
              onClick={() => setShowRankDistribution(!showRankDistribution)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                showRankDistribution
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200"
              }`}
            >
              <BarChart3 className="w-3 h-3 text-emerald-400" />
              <span>Distribution</span>
            </button>

            <button
              onClick={() => setShowScatterPlot(!showScatterPlot)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                showScatterPlot
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                  : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200"
              }`}
            >
              <Target className="w-3 h-3 text-purple-400" />
              <span>Scatter</span>
            </button>

            <button
              onClick={() => setShowPredictiveTrends(!showPredictiveTrends)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                showPredictiveTrends
                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                  : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200"
              }`}
            >
              <TrendingUp className="w-3 h-3 text-indigo-400" />
              <span>Predictive</span>
            </button>

            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                showHeatmap
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200"
              }`}
            >
              <Flame className="w-3 h-3 text-amber-400" />
              <span>Heatmap</span>
            </button>

            <button
              onClick={() => setShowTranslations(!showTranslations)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                showTranslations
                  ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40"
                  : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200"
              }`}
            >
              <Languages className="w-3.5 h-3.5 text-indigo-400" />
              <span>DeepL Translations</span>
            </button>

            <button
              onClick={() => setShowPdfModal(true)}
              className="flex items-center space-x-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-md"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Export PDF Report</span>
            </button>

            <input
              type="file"
              ref={csvFileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setCsvInitialFile(file);
                  setShowCsvModal(true);
                }
                e.target.value = "";
              }}
              accept=".csv,.tsv,.txt"
              className="hidden"
            />

            <button
              onClick={() => {
                setCsvInitialFile(null);
                csvFileInputRef.current?.click();
              }}
              className="flex items-center space-x-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-md"
              title="Import keywords from CSV file with custom column mapping"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Import CSV</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Track Keywords</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-zinc-800/80 text-xs">
          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3">
            <p className="text-[11px] text-zinc-400 font-medium">Top 3 Rankings</p>
            <p className="text-lg font-bold text-emerald-400 mt-0.5">
              {app.keywords.filter((k) => k.currentRank !== null && k.currentRank <= 3).length}
            </p>
          </div>
          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3">
            <p className="text-[11px] text-zinc-400 font-medium">Top 10 Rankings</p>
            <p className="text-lg font-bold text-indigo-300 mt-0.5">
              {app.keywords.filter((k) => k.currentRank !== null && k.currentRank <= 10).length}
            </p>
          </div>
          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3">
            <p className="text-[11px] text-zinc-400 font-medium">Avg Search Ads Score</p>
            <p className="text-lg font-bold text-amber-400 mt-0.5">
              {Math.round(
                app.keywords.reduce((acc, k) => acc + k.popularity, 0) / (app.keywords.length || 1)
              )}
              <span className="text-xs text-zinc-400 font-normal"> /100</span>
            </p>
          </div>
          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3">
            <p className="text-[11px] text-zinc-400 font-medium">Est Organic Installs/mo</p>
            <p className="text-lg font-bold text-purple-300 mt-0.5">
              {app.keywords.reduce((acc, k) => acc + k.estimatedInstalls, 0) * 30}
            </p>
          </div>
        </div>
      </div>

      {/* Rank Drop Alert Settings & Triggers Panel */}
      {showAlertsPanel && onUpdateAlertSettings && onMarkAsRead && onMarkAllAsRead && onClearAlerts && onTriggerTestAlert && (
        <AlertSettingsPanel
          app={app}
          alerts={alerts}
          onUpdateAlertSettings={onUpdateAlertSettings}
          onMarkAsRead={onMarkAsRead}
          onMarkAllAsRead={onMarkAllAsRead}
          onClearAlerts={onClearAlerts}
          onTriggerTestAlert={onTriggerTestAlert}
          onSelectKeyword={(kw) => setSelectedKeywordForHistory(kw)}
        />
      )}

      {/* 30-Day Historical Rank Trend Visualizer Widget */}
      {show30DayTrendChart && activeKeyword && (
        <KeywordRankTrendChart
          keyword={activeKeyword}
          comparisonKeywords={app.keywords.filter((k) => k.id !== activeKeyword.id)}
          titlePrefix="30-Day Recharts Rank Trend Visualizer"
          onSelectKeyword={(kw) => setSelectedKeywordForHistory(kw)}
        />
      )}

      {/* Rank Distribution Bar Chart Summary */}
      {showRankDistribution && (
        <RankDistributionSummary
          keywords={app.keywords}
          activeRankFilter={activeRankFilter}
          onSelectRankFilter={(bucketId) => setActiveRankFilter(bucketId)}
        />
      )}

      {/* Difficulty vs. Rank Scatter Plot Widget */}
      {showScatterPlot && (
        <DifficultyVsRankScatter
          keywords={app.keywords}
          selectedKeywordId={activeKeyword?.id}
          onSelectKeyword={(kw) => setSelectedKeywordForHistory(kw)}
        />
      )}

      {/* 30-Day Predictive Popularity Forecasting Widget */}
      {showPredictiveTrends && (
        <PredictiveTrendsWidget
          keywords={app.keywords}
          selectedKeywordId={activeKeyword?.id}
          onSelectKeyword={(kw) => setSelectedKeywordForHistory(kw)}
        />
      )}

      {/* Visual Heatmap Widget Section */}
      {showHeatmap && (
        <KeywordHeatmap
          keywords={app.keywords}
          selectedKeywordId={activeKeyword?.id}
          onSelectKeyword={(kw) => setSelectedKeywordForHistory(kw)}
          onQuadrantFilter={(quadrant) => setActiveQuadrantFilter(quadrant)}
        />
      )}

      {/* Main Grid: Keyword Table + Selected Keyword Detail Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Search & Keyword Table */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active Rank or Quadrant Filter Indicator */}
          {(activeRankFilter || activeQuadrantFilter) && (
            <div className="flex flex-wrap items-center justify-between gap-2 bg-indigo-950/40 border border-indigo-500/30 px-3.5 py-2 rounded-xl text-xs text-indigo-300">
              <span className="flex items-center space-x-2">
                <Filter className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  Filtered by:{" "}
                  {activeRankFilter && (
                    <strong className="text-emerald-300 mr-2">
                      Rank Bracket: {activeRankFilter}
                    </strong>
                  )}
                  {activeQuadrantFilter && (
                    <strong className="text-white">
                      Heatmap Quadrant:{" "}
                      {activeQuadrantFilter === "sweetSpot"
                        ? "🎯 Sweet Spot"
                        : activeQuadrantFilter === "competitiveGiants"
                        ? "⚔️ Fierce Competition"
                        : activeQuadrantFilter === "nicheTargets"
                        ? "💡 Niche Opportunities"
                        : "⚠️ Low Return"}
                    </strong>
                  )}
                </span>
              </span>
              <button
                onClick={() => {
                  setActiveRankFilter(null);
                  setActiveQuadrantFilter(null);
                }}
                className="text-zinc-400 hover:text-white flex items-center space-x-1 text-[11px] bg-zinc-900 border border-zinc-700/80 px-2 py-0.5 rounded-lg cursor-pointer ml-auto"
              >
                <span>Reset All Filters</span>
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/60 border border-zinc-800 p-2.5 rounded-2xl">
            {/* Search input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Tag Filter Pills */}
            <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <span className="text-[11px] text-zinc-400 mr-1 flex items-center space-x-1 shrink-0">
                <Tag className="w-3 h-3" />
                <span>Tag:</span>
              </span>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-colors shrink-0 ${
                    selectedTag === tag
                      ? "bg-indigo-600 text-white font-medium shadow-sm"
                      : "bg-zinc-800/80 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Keywords Table */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/80 text-zinc-400 uppercase tracking-wider text-[10px] font-semibold border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isSomeSelected;
                        }}
                        onChange={handleToggleSelectAll}
                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                        title="Select all visible keywords"
                      />
                    </th>
                    <th className="py-3 px-4">Keyword</th>
                    <th className="py-3 px-3">Rank</th>
                    <th className="py-3 px-3">ASA Pop & Trend</th>
                    <th className="py-3 px-3">Difficulty</th>
                    <th className="py-3 px-3">Installs/d</th>
                    <th className="py-3 px-3">Trend</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
                  {filteredKeywords.map((kw) => {
                    const isSelected = activeKeyword?.id === kw.id;
                    const isChecked = selectedKeywordIds.includes(kw.id);
                    const diff =
                      kw.previousRank && kw.currentRank
                        ? kw.previousRank - kw.currentRank
                        : 0;

                    return (
                      <tr
                        key={kw.id}
                        onClick={() => setSelectedKeywordForHistory(kw)}
                        className={`cursor-pointer transition-colors ${
                          isChecked
                            ? "bg-indigo-950/40 border-l-2 border-indigo-500"
                            : isSelected
                            ? "bg-indigo-600/10 border-l-2 border-indigo-500"
                            : "hover:bg-zinc-800/40"
                        }`}
                      >
                        {/* Row Checkbox */}
                        <td
                          className="py-3 px-3 w-10 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => handleToggleSelectRow(kw.id, e as any)}
                            className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                          />
                        </td>
                        {/* Keyword Name & Tags */}
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-zinc-100 flex items-center space-x-1.5 flex-wrap gap-1">
                              <span>{kw.keyword}</span>
                              {kw.notes && (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" title={kw.notes} />
                              )}
                              {alerts.find((a) => a.appId === app.id && a.keywordId === kw.id && !a.read) && (
                                <span
                                  className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] font-bold px-1.5 py-0.2 rounded-md flex items-center space-x-0.5 animate-pulse"
                                  title="Rank Drop Alert Triggered!"
                                >
                                  <Bell className="w-2.5 h-2.5" />
                                  <span>Drop Alert</span>
                                </span>
                              )}
                            </p>
                            {showTranslations && kw.translationEn && (
                              <p className="text-[10px] text-zinc-400 italic">
                                EN: {kw.translationEn}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {kw.tags.map((t) => (
                                <span
                                  key={t}
                                  className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded font-mono"
                                >
                                  #{t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </td>

                        {/* Current Rank Badge & Movement */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {kw.currentRank !== null ? (
                            <div className="flex items-center space-x-1.5">
                              <span
                                className={`font-mono font-bold px-2 py-0.5 rounded-md text-xs ${
                                  kw.currentRank === 1
                                    ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                                    : kw.currentRank <= 3
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : kw.currentRank <= 10
                                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                    : "bg-zinc-800 text-zinc-300"
                                }`}
                              >
                                #{kw.currentRank}
                              </span>
                              {diff > 0 && (
                                <span className="text-[10px] text-emerald-400 font-semibold flex items-center">
                                  <TrendingUp className="w-3 h-3 mr-0.5" />+{diff}
                                </span>
                              )}
                              {diff < 0 && (
                                <span className="text-[10px] text-rose-400 font-semibold flex items-center">
                                  <TrendingDown className="w-3 h-3 mr-0.5" />
                                  {diff}
                                </span>
                              )}
                              {diff === 0 && (
                                <span className="text-[10px] text-zinc-400">
                                  <Minus className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-zinc-400 italic">Unranked</span>
                          )}
                        </td>

                        {/* ASA Popularity with Recharts Sparkline */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center space-x-2.5">
                            <div className="space-y-1">
                              <span className="font-mono font-medium text-amber-300 block text-xs">
                                {kw.popularity}/100
                              </span>
                              <div className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-amber-500 to-orange-400"
                                  style={{ width: `${kw.popularity}%` }}
                                />
                              </div>
                            </div>
                            <PopularitySparkline
                              popularity={kw.popularity}
                              keywordId={kw.id}
                              history={kw.history}
                              width={64}
                              height={22}
                            />
                          </div>
                        </td>

                        {/* Difficulty */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="space-y-1">
                            <span className="font-mono font-medium text-zinc-300">
                              {kw.difficulty}/100
                            </span>
                            <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  kw.difficulty < 40
                                    ? "bg-emerald-400"
                                    : kw.difficulty < 70
                                    ? "bg-amber-400"
                                    : "bg-rose-400"
                                }`}
                                style={{ width: `${kw.difficulty}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Est Installs */}
                        <td className="py-3 px-3 whitespace-nowrap font-mono text-zinc-300">
                          ~{kw.estimatedInstalls}
                        </td>

                        {/* Sparkline Visual */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="w-20 h-6 flex items-center">
                            {kw.history.length > 1 ? (
                              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30">
                                <polyline
                                  fill="none"
                                  stroke={
                                    diff >= 0 ? "#34d399" : "#f43f5e"
                                  }
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  points={kw.history
                                    .map((h, idx) => {
                                      const x = (idx / (kw.history.length - 1)) * 100;
                                      // Lower rank is higher on chart
                                      const y = Math.min(Math.max((h.rank / 20) * 30, 2), 28);
                                      return `${x},${y}`;
                                    })
                                    .join(" ")}
                                />
                              </svg>
                            ) : (
                              <span className="text-[10px] text-zinc-400">New</span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                setEditingNotesKeyword(kw);
                                setNotesInput(kw.notes || "");
                              }}
                              className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-amber-300 transition-colors"
                              title="Edit Notes"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteKeyword(kw.id)}
                              className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-rose-400 transition-colors"
                              title="Delete Keyword"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredKeywords.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-zinc-400">
                        No keywords found matching filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1/3): Historical Rank Detail Card & ASO Insight */}
        <div className="space-y-4">
          {activeKeyword ? (
            <div className="space-y-4">
              <KeywordRankTrendChart
                keyword={activeKeyword}
                comparisonKeywords={app.keywords.filter((k) => k.id !== activeKeyword.id)}
                compact={true}
                titlePrefix="Selected Trajectory"
                onSelectKeyword={(kw) => setSelectedKeywordForHistory(kw)}
              />

              {/* Notes Box */}
              <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl space-y-2 shadow-lg">
                <div className="flex items-center justify-between text-xs text-amber-400 font-medium">
                  <span className="flex items-center space-x-1.5">
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>ASO Strategy Notes</span>
                  </span>
                  <button
                    onClick={() => {
                      setEditingNotesKeyword(activeKeyword);
                      setNotesInput(activeKeyword.notes || "");
                    }}
                    className="text-[10px] underline text-zinc-400 hover:text-white cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-xs text-zinc-300 italic">
                  {activeKeyword.notes || "No strategy notes added for this keyword yet."}
                </p>
              </div>

              {/* DeepL Translation Info */}
              {activeKeyword.translationEn && (
                <div className="bg-indigo-950/30 border border-indigo-800/40 p-4 rounded-2xl text-xs space-y-1 shadow-lg">
                  <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">
                    DeepL ASO English Translation
                  </span>
                  <p className="font-semibold text-white">"{activeKeyword.translationEn}"</p>
                  <p className="text-[10px] text-zinc-400">
                    Sourced from DeepL API to preserve search intent across global storefronts.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 text-center text-zinc-400 text-xs">
              Select a keyword to view detailed rank trajectory.
            </div>
          )}
        </div>
      </div>

      {/* Add Keywords Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>Track New Keywords</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white text-xs font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Enter keywords (one per line)
                </label>
                <textarea
                  rows={5}
                  value={newKeywordInput}
                  onChange={(e) => setNewKeywordInput(e.target.value)}
                  placeholder={`ai planner\ntime management app\nschedule calendar 2026\nproductivity widget`}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <p className="text-[11px] text-zinc-400 mt-1">
                  Tip: You can paste up to 50 keywords at once. Apple Search Ads popularity & difficulty metrics will be fetched automatically.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                >
                  Start Tracking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Notes Modal */}
      {editingNotesKeyword && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>Strategy Notes for "{editingNotesKeyword.keyword}"</span>
              </h3>
              <button
                onClick={() => setEditingNotesKeyword(null)}
                className="text-zinc-400 hover:text-white text-xs font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <textarea
                rows={4}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Write ASO observations, Search Ads bid changes, or release experiment notes..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={() => setEditingNotesKeyword(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotes}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bulk Action Toolbar */}
      {selectedKeywordIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900/95 border border-indigo-500/40 shadow-2xl shadow-indigo-950/90 rounded-2xl p-3 sm:px-5 sm:py-3.5 text-xs text-white flex flex-wrap items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-600 text-white font-mono font-bold px-2 py-0.5 rounded-lg text-xs">
              {selectedKeywordIds.length}
            </span>
            <span className="font-semibold text-zinc-200">Selected</span>
          </div>

          <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

          {/* Quick Select / Deselect All */}
          <button
            onClick={handleToggleSelectAll}
            className="text-zinc-400 hover:text-white transition-colors text-[11px] font-medium cursor-pointer"
          >
            {isAllSelected ? "Deselect All" : "Select All"}
          </button>

          <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

          {/* Bulk Assign Tag Button */}
          <button
            onClick={() => setShowBulkTagModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white font-medium transition-all shadow-md cursor-pointer"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Assign Tag</span>
          </button>

          {/* Bulk Delete Button */}
          <button
            onClick={() => setShowBulkDeleteConfirm(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-medium transition-all shadow-md cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete ({selectedKeywordIds.length})</span>
          </button>

          <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

          {/* Clear selection button */}
          <button
            onClick={() => setSelectedKeywordIds([])}
            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bulk Tag Assignment Modal */}
      {showBulkTagModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Tag className="w-4 h-4 text-indigo-400" />
                <span>Assign Tag to {selectedKeywordIds.length} Keywords</span>
              </h3>
              <button
                onClick={() => setShowBulkTagModal(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Select Preset Tag or Type Custom Tag:
                </label>
                {/* Preset tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {["Brand", "Competitor", "ASO", "Meta", "High Intent", "Long-Tail", "Primary", "High ROI"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCustomTagInput(preset)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-all cursor-pointer ${
                        customTagInput === preset
                          ? "bg-indigo-600 text-white border-indigo-400 font-bold"
                          : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-zinc-500"
                      }`}
                    >
                      #{preset}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="e.g. High ROI or #Feature"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <p className="text-[11px] text-zinc-400 italic">
                This tag will be added to all {selectedKeywordIds.length} selected keywords without duplicates.
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setShowBulkTagModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={!customTagInput.trim()}
                onClick={() => handleConfirmBulkTag(customTagInput)}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-all shadow-md cursor-pointer"
              >
                Apply Tag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Confirm Bulk Deletion</h3>
                <p className="text-[11px] text-zinc-400">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300">
              Are you sure you want to permanently delete{" "}
              <strong className="text-white font-mono">{selectedKeywordIds.length}</strong> selected keywords from{" "}
              <strong className="text-white">{app.name}</strong>?
            </p>

            <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBulkDelete}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete {selectedKeywordIds.length} Keywords</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Report Export Modal */}
      {showPdfModal && (
        <PdfExportModal
          app={app}
          countryName={countryName}
          onClose={() => setShowPdfModal(false)}
        />
      )}

      {/* CSV Import & Column Mapping Modal */}
      <CsvImportModal
        isOpen={showCsvModal}
        onClose={() => {
          setShowCsvModal(false);
          setCsvInitialFile(null);
        }}
        appName={app.name}
        existingKeywords={app.keywords.map((k) => k.keyword)}
        initialFile={csvInitialFile}
        onImportMappedKeywords={(mappedItems) => {
          if (onImportMappedKeywords) {
            onImportMappedKeywords(mappedItems);
          } else {
            onAddKeywords(mappedItems.map((m) => m.keyword || "").filter(Boolean));
          }
        }}
      />
    </div>
  );
};
