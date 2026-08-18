import React from "react";
import { TrackedApp, Platform } from "../types";
import { STOREFRONT_COUNTRIES } from "../data/mockData";
import {
  Sparkles,
  Globe,
  Plus,
  Smartphone,
  Tablet,
  Laptop,
  Glasses,
  Watch,
  ChevronDown,
  LayoutDashboard,
  ExternalLink,
  Sun,
  Moon,
  Bell,
  Database,
  RefreshCw,
} from "lucide-react";

interface HeaderProps {
  apps: TrackedApp[];
  selectedApp: TrackedApp;
  onSelectApp: (app: TrackedApp) => void;
  selectedCountry: string;
  onSelectCountry: (countryCode: string) => void;
  selectedPlatform: Platform;
  onSelectPlatform: (platform: Platform) => void;
  onOpenAddApp: () => void;
  mode: "studio" | "landing";
  onToggleMode: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  unreadAlertsCount?: number;
  onOpenAlerts?: () => void;
  dbStatus?: {
    connected: boolean;
    latencyMs?: number;
    isSyncing?: boolean;
    appCount?: number;
  };
}

export const Header: React.FC<HeaderProps> = ({
  apps,
  selectedApp,
  onSelectApp,
  selectedCountry,
  onSelectCountry,
  selectedPlatform,
  onSelectPlatform,
  onOpenAddApp,
  mode,
  onToggleMode,
  theme,
  onToggleTheme,
  unreadAlertsCount = 0,
  onOpenAlerts,
  dbStatus,
}) => {
  const currentCountryObj =
    STOREFRONT_COUNTRIES.find((c) => c.code === selectedCountry) || STOREFRONT_COUNTRIES[0];

  const getPlatformIcon = (p: Platform) => {
    switch (p) {
      case "iOS":
        return <Smartphone className="w-3.5 h-3.5" />;
      case "iPadOS":
        return <Tablet className="w-3.5 h-3.5" />;
      case "macOS":
        return <Laptop className="w-3.5 h-3.5" />;
      case "visionOS":
        return <Glasses className="w-3.5 h-3.5" />;
      case "watchOS":
        return <Watch className="w-3.5 h-3.5" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-2 sm:px-4 py-2 text-zinc-100 flex items-center justify-between gap-2">
      {/* Brand & App Picker */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {/* Logo */}
        <div className="flex items-center space-x-1.5 cursor-pointer" onClick={onToggleMode}>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex items-center">
            <span className="font-bold text-sm sm:text-base tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              AstroASO
            </span>
          </div>
        </div>

        <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

        {/* Mode Switcher pill */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs font-medium">
          <button
            onClick={() => mode !== "studio" && onToggleMode()}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center space-x-1.5 cursor-pointer ${
              mode === "studio"
                ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm font-semibold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="inline font-medium">Studio</span>
          </button>
          <button
            onClick={() => mode !== "landing" && onToggleMode()}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center space-x-1.5 cursor-pointer ${
              mode === "landing"
                ? "bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm font-semibold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="inline font-medium">Website</span>
          </button>
        </div>

        {/* App Selector Dropdown (Shown in Studio mode) */}
        {mode === "studio" && (
          <div className="relative group">
            <div className="flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 rounded-lg px-2 py-1 cursor-pointer transition-colors text-xs">
              <img
                src={selectedApp.iconUrl}
                alt={selectedApp.name}
                className="w-4 h-4 rounded object-cover border border-zinc-700"
              />
              <div className="max-w-[80px] sm:max-w-[120px] md:max-w-[150px] truncate">
                <p className="font-semibold text-zinc-100 truncate text-[11px] sm:text-xs">{selectedApp.name}</p>
              </div>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </div>

            {/* Dropdown Menu */}
            <div className="absolute left-0 mt-1 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 p-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 px-2 py-1">
                Tracked Applications
              </p>
              <div className="space-y-0.5 max-h-60 overflow-y-auto">
                {apps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => onSelectApp(app)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition-colors ${
                      app.id === selectedApp.id
                        ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                        : "hover:bg-zinc-800/60 text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <img
                        src={app.iconUrl}
                        alt={app.name}
                        className="w-6 h-6 rounded-md object-cover border border-zinc-700 flex-shrink-0"
                      />
                      <div className="truncate">
                        <p className="font-medium truncate">{app.name}</p>
                        <p className="text-[10px] text-zinc-400 truncate">
                          {app.developer} • {app.platform}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="border-t border-zinc-800 my-1 pt-1">
                <button
                  onClick={onOpenAddApp}
                  className="w-full flex items-center justify-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Track New App</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Country & Platform Controls */}
      {mode === "studio" && (
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {/* Storefront Country Select */}
          <div className="relative group">
            <button className="flex items-center space-x-1 bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-300 transition-colors">
              <span className="text-xs">{currentCountryObj.flag}</span>
              <span className="hidden xl:inline font-medium text-[11px]">{currentCountryObj.name}</span>
              <span className="xl:hidden font-mono uppercase text-[11px]">{currentCountryObj.code}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            <div className="absolute right-0 mt-1 w-52 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 p-1.5 max-h-72 overflow-y-auto">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 px-2 py-1 flex items-center justify-between">
                <span>App Store Region</span>
                <Globe className="w-3 h-3" />
              </p>
              {STOREFRONT_COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => onSelectCountry(c.code)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors ${
                    c.code === selectedCountry
                      ? "bg-indigo-600/20 text-indigo-300 font-medium"
                      : "hover:bg-zinc-800/60 text-zinc-300"
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span className="text-sm">{c.flag}</span>
                    <span>{c.name}</span>
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono uppercase">{c.code}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Platform Picker */}
          <div className="hidden lg:flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs">
            {(["iOS", "iPadOS", "macOS", "visionOS", "watchOS"] as Platform[]).map((p) => (
              <button
                key={p}
                onClick={() => onSelectPlatform(p)}
                className={`px-1.5 py-0.5 rounded-md flex items-center space-x-1 transition-colors ${
                  selectedPlatform === p
                    ? "bg-zinc-800 text-indigo-300 font-semibold"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
                title={p}
              >
                {getPlatformIcon(p)}
                <span className="text-[10px]">{p}</span>
              </button>
            ))}
          </div>

          {/* Neon Database Status Badge */}
          {dbStatus && (
            <div
              className={`hidden xl:flex items-center space-x-1.5 px-2 py-1 rounded-lg border text-[11px] font-mono transition-all ${
                dbStatus.connected
                  ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                  : "bg-amber-950/40 border-amber-500/30 text-amber-300"
              }`}
              title={
                dbStatus.connected
                  ? `Neon PostgreSQL Connected (${dbStatus.latencyMs}ms latency)`
                  : "Neon PostgreSQL Connecting..."
              }
            >
              <Database className="w-3 h-3 text-emerald-400" />
              <span className="font-semibold">Neon</span>
              {dbStatus.isSyncing ? (
                <RefreshCw className="w-2.5 h-2.5 text-emerald-400 animate-spin" />
              ) : (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    dbStatus.connected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                  }`}
                />
              )}
            </div>
          )}

          {/* Alerts Bell Notification Button */}
          {onOpenAlerts && (
            <button
              onClick={onOpenAlerts}
              className="relative p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center justify-center"
              title="Rank Drop Alerts & Threshold Settings"
            >
              <Bell className="w-3.5 h-3.5 text-rose-400" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold font-mono px-1 py-0.2 rounded-full min-w-[14px] text-center shadow-sm animate-pulse">
                  {unreadAlertsCount}
                </span>
              )}
            </button>
          )}

          {/* Track App Button */}
          <button
            onClick={onOpenAddApp}
            className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span className="hidden sm:inline">Add App</span>
          </button>

          {/* Dark / White Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center justify-center text-xs"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
            )}
          </button>
        </div>
      )}

      {mode === "landing" && (
        <button
          onClick={onToggleTheme}
          className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center space-x-1 text-xs"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-medium text-amber-300">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-400" />
              <span className="text-[11px] font-medium text-indigo-400">Dark</span>
            </>
          )}
        </button>
      )}
    </header>
  );
};
