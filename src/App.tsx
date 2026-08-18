/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  TrackedApp,
  TrackedKeyword,
  CompetitorApp,
  Platform,
  AppAlertSettings,
  RankingAlert,
} from "./types";
import { INITIAL_TRACKED_APPS, STOREFRONT_COUNTRIES, INITIAL_MOCK_ALERTS } from "./data/mockData";
import { Header } from "./components/Header";
import { Sidebar, StudioTab } from "./components/Sidebar";
import { KeywordTracker } from "./components/KeywordTracker";
import { KeywordResearch } from "./components/KeywordResearch";
import { CompetitorInspector } from "./components/CompetitorInspector";
import { SearchSimulator } from "./components/SearchSimulator";
import { AiMetadataOptimizer } from "./components/AiMetadataOptimizer";
import { GlobalRatings } from "./components/GlobalRatings";
import { AddAppModal } from "./components/AddAppModal";
import { LandingPage } from "./components/LandingPage";
import { AlertSettingsPanel } from "./components/AlertSettingsPanel";
import { ToastAlert } from "./components/ToastAlert";
import { SubHeaderSearchBar } from "./components/SubHeaderSearchBar";

export default function App() {
  const [theme, setTheme] = useState<"dark" | "light">(
    () => (localStorage.getItem("astro_theme") as "dark" | "light") || "dark"
  );
  const [mode, setMode] = useState<"studio" | "landing">(() => {
    if (typeof window !== "undefined" && window.location.hash === "#studio") {
      return "studio";
    }
    const saved = localStorage.getItem("astro_mode");
    if (saved === "studio" || saved === "landing") return saved;
    return "landing";
  });

  const [apps, setApps] = useState<TrackedApp[]>(INITIAL_TRACKED_APPS);
  const [selectedAppId, setSelectedAppId] = useState<string>(INITIAL_TRACKED_APPS[0].id);
  const [selectedCountry, setSelectedCountry] = useState<string>("us");
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("iOS");
  const [activeTab, setActiveTab] = useState<StudioTab>("tracker");
  const [showAddAppModal, setShowAddAppModal] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<RankingAlert[]>(INITIAL_MOCK_ALERTS);
  const [toastAlert, setToastAlert] = useState<RankingAlert | null>(null);
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    latencyMs?: number;
    isSyncing?: boolean;
    appCount?: number;
  }>({
    connected: true,
    isSyncing: false,
  });

  // Sync mode with localStorage
  useEffect(() => {
    localStorage.setItem("astro_mode", mode);
  }, [mode]);

  // Sync theme with document class and localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }
    localStorage.setItem("astro_theme", theme);
  }, [theme]);

  // Initial Neon PostgreSQL Database Load & Seeding
  useEffect(() => {
    let isMounted = true;
    async function loadNeonDatabase() {
      setDbStatus((prev) => ({ ...prev, isSyncing: true }));
      try {
        // 1. Check Neon Connection Status
        const statusRes = await fetch("/api/db/status");
        const statusData = await statusRes.json();
        if (statusData.connected && isMounted) {
          setDbStatus({
            connected: true,
            latencyMs: statusData.latencyMs,
            appCount: statusData.appCount,
            isSyncing: false,
          });
        }

        // 2. Fetch Apps from Neon PostgreSQL
        const appsRes = await fetch("/api/db/apps");
        const appsData = await appsRes.json();

        if (appsData.isFresh || !appsData.apps || appsData.apps.length === 0) {
          // Fresh database: seed default apps into Neon
          await fetch("/api/db/seed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ apps: INITIAL_TRACKED_APPS }),
          });
        } else if (appsData.apps && appsData.apps.length > 0 && isMounted) {
          setApps(appsData.apps);
          setSelectedAppId(appsData.apps[0].id);
        }
      } catch (err) {
        console.warn("[Neon Database] Notice on initial load:", err);
        if (isMounted) {
          setDbStatus({ connected: false, isSyncing: false });
        }
      }
    }

    loadNeonDatabase();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const selectedApp = apps.find((a) => a.id === selectedAppId) || apps[0];
  const currentCountryObj =
    STOREFRONT_COUNTRIES.find((c) => c.code === selectedCountry) || STOREFRONT_COUNTRIES[0];

  // Helper: Persist updated app to Neon DB in background
  const persistAppToNeon = async (appToSave: TrackedApp) => {
    setDbStatus((prev) => ({ ...prev, isSyncing: true }));
    try {
      await fetch("/api/db/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appToSave),
      });
      setDbStatus((prev) => ({ ...prev, isSyncing: false, connected: true }));
    } catch (e) {
      console.warn("[Neon DB] Background save notice:", e);
      setDbStatus((prev) => ({ ...prev, isSyncing: false }));
    }
  };

  // Handler: Add Keywords to Active App
  const handleAddKeywords = (keywordsToAdd: string[]) => {
    setApps((prev) => {
      const updated = prev.map((a) => {
        if (a.id !== selectedApp.id) return a;

        const newTracked: TrackedKeyword[] = keywordsToAdd.map((kw, idx) => ({
          id: `kw-${Date.now()}-${idx}`,
          keyword: kw.toLowerCase(),
          currentRank: Math.floor(Math.random() * 12) + 1,
          previousRank: Math.floor(Math.random() * 15) + 1,
          popularity: Math.floor(Math.random() * 40) + 55,
          difficulty: Math.floor(Math.random() * 50) + 20,
          estimatedInstalls: Math.floor(Math.random() * 300) + 100,
          tags: ["Core"],
          lastUpdated: "Just now",
          history: [
            { date: "Aug 5", rank: Math.floor(Math.random() * 10) + 5 },
            { date: "Aug 6", rank: Math.floor(Math.random() * 8) + 3 },
            { date: "Today", rank: Math.floor(Math.random() * 5) + 1 },
          ],
        }));

        const updatedApp = {
          ...a,
          keywords: [...a.keywords, ...newTracked],
        };
        persistAppToNeon(updatedApp);
        return updatedApp;
      });
      return updated;
    });
  };

  // Handler: Import Mapped Keywords from CSV
  const handleImportMappedKeywords = (mappedKeywords: Partial<TrackedKeyword>[]) => {
    setApps((prev) => {
      const updated = prev.map((a) => {
        if (a.id !== selectedApp.id) return a;

        const newTracked: TrackedKeyword[] = mappedKeywords.map((item, idx) => ({
          id: item.id || `imported-${Date.now()}-${idx}`,
          keyword: item.keyword || "Untitled Keyword",
          currentRank: item.currentRank !== undefined ? item.currentRank : Math.floor(Math.random() * 15) + 1,
          previousRank: item.previousRank !== undefined ? item.previousRank : Math.floor(Math.random() * 20) + 1,
          popularity: item.popularity || Math.floor(Math.random() * 40) + 40,
          difficulty: item.difficulty || Math.floor(Math.random() * 40) + 20,
          estimatedInstalls: item.estimatedInstalls || Math.floor(Math.random() * 250) + 50,
          tags: item.tags && item.tags.length > 0 ? item.tags : ["Imported"],
          notes: item.notes || "",
          lastUpdated: "Just now",
          history: item.history || [
            { date: "Aug 5", rank: item.currentRank ? Math.max(1, item.currentRank + 2) : 15 },
            { date: "Aug 6", rank: item.currentRank ? Math.max(1, item.currentRank + 1) : 12 },
            { date: "Today", rank: item.currentRank || 10 },
          ],
        }));

        const updatedApp = {
          ...a,
          keywords: [...a.keywords, ...newTracked],
        };
        persistAppToNeon(updatedApp);
        return updatedApp;
      });
      return updated;
    });
  };

  // Handler: Single Keyword Add
  const handleAddSingleKeyword = (kw: string) => {
    handleAddKeywords([kw]);
  };

  // Handler: Delete Keyword
  const handleDeleteKeyword = (id: string) => {
    setApps((prev) => {
      const updated = prev.map((a) => {
        if (a.id !== selectedApp.id) return a;
        const updatedApp = {
          ...a,
          keywords: a.keywords.filter((k) => k.id !== id),
        };
        persistAppToNeon(updatedApp);
        return updatedApp;
      });
      return updated;
    });
  };

  // Handler: Bulk Delete Keywords
  const handleBulkDeleteKeywords = (ids: string[]) => {
    const idSet = new Set(ids);
    setApps((prev) => {
      const updated = prev.map((a) => {
        if (a.id !== selectedApp.id) return a;
        const updatedApp = {
          ...a,
          keywords: a.keywords.filter((k) => !idSet.has(k.id)),
        };
        persistAppToNeon(updatedApp);
        return updatedApp;
      });
      return updated;
    });
  };

  // Handler: Bulk Assign Tags
  const handleBulkAssignTags = (keywordIds: string[], tagsToAssign: string[]) => {
    const idSet = new Set(keywordIds);
    setApps((prev) => {
      const updated = prev.map((a) => {
        if (a.id !== selectedApp.id) return a;
        const updatedApp = {
          ...a,
          keywords: a.keywords.map((k) => {
            if (!idSet.has(k.id)) return k;
            const updatedTags = Array.from(new Set([...k.tags, ...tagsToAssign]));
            return { ...k, tags: updatedTags };
          }),
        };
        persistAppToNeon(updatedApp);
        return updatedApp;
      });
      return updated;
    });
  };

  // Handler: Update Keyword Notes
  const handleUpdateKeywordNotes = (id: string, notes: string) => {
    setApps((prev) => {
      const updated = prev.map((a) => {
        if (a.id !== selectedApp.id) return a;
        const updatedApp = {
          ...a,
          keywords: a.keywords.map((k) => (k.id === id ? { ...k, notes } : k)),
        };
        persistAppToNeon(updatedApp);
        return updatedApp;
      });
      return updated;
    });
  };

  // Handler: Add Competitor
  const handleAddCompetitor = (competitor: CompetitorApp) => {
    setApps((prev) => {
      const updated = prev.map((a) => {
        if (a.id !== selectedApp.id) return a;
        if (a.competitors.some((c) => c.id === competitor.id)) return a;
        const updatedApp = {
          ...a,
          competitors: [...a.competitors, competitor],
        };
        persistAppToNeon(updatedApp);
        return updatedApp;
      });
      return updated;
    });
  };

  // Handler: Delete Competitor
  const handleDeleteCompetitor = (id: string) => {
    setApps((prev) => {
      const updated = prev.map((a) => {
        if (a.id !== selectedApp.id) return a;
        const updatedApp = {
          ...a,
          competitors: a.competitors.filter((c) => c.id !== id),
        };
        persistAppToNeon(updatedApp);
        return updatedApp;
      });
      return updated;
    });
  };

  // Handler: Update App Metadata
  const handleUpdateMetadata = (metadata: { title: string; subtitle: string; keywordField: string }) => {
    setApps((prev) => {
      const updated = prev.map((a) => {
        if (a.id !== selectedApp.id) return a;
        const updatedApp = {
          ...a,
          metadata,
        };
        persistAppToNeon(updatedApp);
        return updatedApp;
      });
      return updated;
    });
  };

  // Handler: Add New App or Idea
  const handleAddApp = (newApp: TrackedApp) => {
    setApps((prev) => [newApp, ...prev]);
    setSelectedAppId(newApp.id);
    persistAppToNeon(newApp);
  };

  // Alert Handlers
  const unreadAlertsForSelectedApp = alerts.filter(
    (a) => a.appId === selectedApp.id && !a.read
  ).length;

  const handleUpdateAlertSettings = (appId: string, settings: AppAlertSettings) => {
    setApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, alertSettings: settings } : a))
    );
  };

  const handleMarkAsRead = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, read: true } : a))
    );
  };

  const handleMarkAllAsRead = () => {
    setAlerts((prev) =>
      prev.map((a) => (a.appId === selectedApp.id ? { ...a, read: true } : a))
    );
  };

  const handleClearAlerts = () => {
    setAlerts((prev) => prev.filter((a) => a.appId !== selectedApp.id));
  };

  const handleTriggerTestAlert = (keywordId?: string) => {
    const targetKw =
      selectedApp.keywords.find((k) => k.id === keywordId) ||
      selectedApp.keywords[Math.floor(Math.random() * selectedApp.keywords.length)];

    if (!targetKw) return;

    const oldRank = targetKw.currentRank || 4;
    const dropThreshold = selectedApp.alertSettings?.dropThresholdRank || 10;
    const newRank = Math.max(dropThreshold + 3, oldRank + 6); // drops rank below threshold

    const newAlert: RankingAlert = {
      id: `alert-${Date.now()}`,
      appId: selectedApp.id,
      appName: selectedApp.name,
      keywordId: targetKw.id,
      keywordName: targetKw.keyword,
      previousRank: oldRank,
      currentRank: newRank,
      type: "DROPPED_BELOW_THRESHOLD",
      message: `'${targetKw.keyword}' dropped out of Top ${dropThreshold} (#${oldRank} → #${newRank})`,
      thresholdValue: dropThreshold,
      timestamp: "Just now",
      read: false,
      severity: newRank > 20 ? "high" : "medium",
    };

    // Update keyword rank in state
    setApps((prev) =>
      prev.map((a) => {
        if (a.id !== selectedApp.id) return a;
        return {
          ...a,
          keywords: a.keywords.map((k) =>
            k.id === targetKw.id
              ? {
                  ...k,
                  previousRank: oldRank,
                  currentRank: newRank,
                  lastUpdated: "Just now",
                }
              : k
          ),
        };
      })
    );

    setAlerts((prev) => [newAlert, ...prev]);
    setToastAlert(newAlert);
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = "Keyword,CurrentRank,Popularity,Difficulty,EstInstalls,Tags,Notes\n";
    const rows = selectedApp.keywords
      .map(
        (k) =>
          `"${k.keyword}",${k.currentRank || "Unranked"},${k.popularity},${k.difficulty},${
            k.estimatedInstalls
          },"${k.tags.join(";")}",${k.notes ? `"${k.notes.replace(/"/g, '""')}"` : ""}`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${selectedApp.name.replace(/\s+/g, "_")}_keywords.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import simulation
  const handleImportCsv = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const content = evt.target?.result as string;
          if (content) {
            const lines = content.split("\n").slice(1);
            const importedKw = lines
              .map((l) => l.split(",")[0].replace(/"/g, "").trim())
              .filter((k) => k.length > 0);
            if (importedKw.length > 0) {
              handleAddKeywords(importedKw);
            }
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  if (mode === "landing") {
    return (
      <LandingPage
        onLaunchStudio={() => setMode("studio")}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        apps={apps}
        selectedApp={selectedApp}
        onSelectApp={(app) => setSelectedAppId(app.id)}
        selectedCountry={selectedCountry}
        onSelectCountry={setSelectedCountry}
        selectedPlatform={selectedPlatform}
        onSelectPlatform={setSelectedPlatform}
        onOpenAddApp={() => setShowAddAppModal(true)}
        mode={mode}
        onToggleMode={() => setMode(mode === "studio" ? "landing" : "studio")}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        unreadAlertsCount={unreadAlertsForSelectedApp}
        onOpenAlerts={() => setActiveTab("alerts")}
        dbStatus={dbStatus}
      />

      {/* Sub-Header Global Search Bar (Studio Mode) */}
      {mode === "studio" && (
        <SubHeaderSearchBar
          apps={apps}
          selectedApp={selectedApp}
          selectedCountry={selectedCountry}
          onSelectApp={(app) => setSelectedAppId(app.id)}
          onAddApp={handleAddApp}
          onOpenAddApp={() => setShowAddAppModal(true)}
        />
      )}

      {/* Main Studio Body with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          keywordCount={selectedApp.keywords.length}
          competitorCount={selectedApp.competitors.length}
          unreadAlertsCount={unreadAlertsForSelectedApp}
          onExportCsv={handleExportCsv}
          onImportCsv={handleImportCsv}
        />

        {/* Studio Content View */}
        <main className="flex-1 overflow-y-auto bg-zinc-950">
          {/* Mobile Tab Selector Pill Bar */}
          <div className="md:hidden flex items-center space-x-2 overflow-x-auto p-3 bg-zinc-900 border-b border-zinc-800 text-xs shrink-0">
            {[
              { id: "tracker", label: "Tracker" },
              { id: "alerts", label: `Alerts (${unreadAlertsForSelectedApp})` },
              { id: "research", label: "Research" },
              { id: "competitors", label: "Competitors" },
              { id: "simulator", label: "Simulator" },
              { id: "ai-metadata", label: "AI Metadata" },
              { id: "ratings", label: "Ratings" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as StudioTab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                  activeTab === t.id
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm"
                    : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Active Tab View */}
          {activeTab === "tracker" && (
            <KeywordTracker
              app={selectedApp}
              alerts={alerts}
              onAddKeywords={handleAddKeywords}
              onImportMappedKeywords={handleImportMappedKeywords}
              onDeleteKeyword={handleDeleteKeyword}
              onBulkDeleteKeywords={handleBulkDeleteKeywords}
              onBulkAssignTags={handleBulkAssignTags}
              onUpdateKeywordNotes={handleUpdateKeywordNotes}
              onTranslateKeywords={() => {}}
              countryName={currentCountryObj.name}
              onUpdateAlertSettings={handleUpdateAlertSettings}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onClearAlerts={handleClearAlerts}
              onTriggerTestAlert={handleTriggerTestAlert}
            />
          )}

          {activeTab === "alerts" && (
            <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
              <AlertSettingsPanel
                app={selectedApp}
                alerts={alerts}
                onUpdateAlertSettings={handleUpdateAlertSettings}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onClearAlerts={handleClearAlerts}
                onTriggerTestAlert={handleTriggerTestAlert}
              />
            </div>
          )}

          {activeTab === "research" && (
            <KeywordResearch
              app={selectedApp}
              onAddKeyword={handleAddSingleKeyword}
              onAddKeywords={handleAddKeywords}
              countryName={currentCountryObj.name}
            />
          )}

          {activeTab === "competitors" && (
            <CompetitorInspector
              app={selectedApp}
              onAddCompetitor={handleAddCompetitor}
              onDeleteCompetitor={handleDeleteCompetitor}
              countryName={currentCountryObj.name}
            />
          )}

          {activeTab === "simulator" && (
            <SearchSimulator app={selectedApp} countryName={currentCountryObj.name} />
          )}

          {activeTab === "ai-metadata" && (
            <AiMetadataOptimizer
              app={selectedApp}
              onUpdateMetadata={handleUpdateMetadata}
              countryName={currentCountryObj.name}
            />
          )}

          {activeTab === "ratings" && (
            <GlobalRatings app={selectedApp} countryName={currentCountryObj.name} />
          )}
        </main>
      </div>

      {/* Add App / Import iTunes App Modal */}
      {showAddAppModal && (
        <AddAppModal
          onClose={() => setShowAddAppModal(false)}
          onAddApp={handleAddApp}
          country={selectedCountry}
        />
      )}

      {/* Floating Interactive Toast Alert Banner */}
      <ToastAlert
        alert={toastAlert}
        onDismiss={() => setToastAlert(null)}
        onOpenAlertsPanel={() => setActiveTab("alerts")}
      />
    </div>
  );
}
