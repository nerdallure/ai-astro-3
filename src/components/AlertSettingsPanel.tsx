import React, { useState } from "react";
import { TrackedApp, AppAlertSettings, RankingAlert, TrackedKeyword } from "../types";
import {
  Bell,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Mail,
  Zap,
  Trash2,
  Check,
  RefreshCw,
  BellOff,
  Sparkles,
  Info,
} from "lucide-react";

interface AlertSettingsPanelProps {
  app: TrackedApp;
  alerts: RankingAlert[];
  onUpdateAlertSettings: (appId: string, settings: AppAlertSettings) => void;
  onMarkAsRead: (alertId: string) => void;
  onMarkAllAsRead: () => void;
  onClearAlerts: () => void;
  onTriggerTestAlert: (keywordId?: string) => void;
  onSelectKeyword?: (keyword: TrackedKeyword) => void;
}

export const AlertSettingsPanel: React.FC<AlertSettingsPanelProps> = ({
  app,
  alerts,
  onUpdateAlertSettings,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAlerts,
  onTriggerTestAlert,
  onSelectKeyword,
}) => {
  const currentSettings: AppAlertSettings = app.alertSettings || {
    enabled: true,
    dropThresholdRank: 10,
    minPositionDrop: 3,
    alertOnUnranked: true,
    notifyOnImprovement: true,
    emailNotifications: true,
    inAppToasts: true,
    emailRecipient: "developer@astrosoftware.io",
  };

  const [settings, setSettings] = useState<AppAlertSettings>(currentSettings);
  const [activeTab, setActiveTab] = useState<"history" | "config">("history");
  const [filterSeverity, setFilterSeverity] = useState<"all" | "unread" | "high">("all");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync settings when app changes
  React.useEffect(() => {
    setSettings(app.alertSettings || {
      enabled: true,
      dropThresholdRank: 10,
      minPositionDrop: 3,
      alertOnUnranked: true,
      notifyOnImprovement: true,
      emailNotifications: true,
      inAppToasts: true,
      emailRecipient: "developer@astrosoftware.io",
    });
  }, [app.id, app.alertSettings]);

  const appAlerts = alerts.filter((a) => a.appId === app.id);
  const unreadCount = appAlerts.filter((a) => !a.read).length;

  const handleSaveSettings = (newSettings: AppAlertSettings) => {
    setSettings(newSettings);
    onUpdateAlertSettings(app.id, newSettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleToggleEnable = () => {
    const updated = { ...settings, enabled: !settings.enabled };
    handleSaveSettings(updated);
  };

  const filteredAlerts = appAlerts.filter((alert) => {
    if (filterSeverity === "unread") return !alert.read;
    if (filterSeverity === "high") return alert.severity === "high";
    return true;
  });

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-gradient-to-br from-rose-500/20 to-amber-500/20 border border-rose-500/30 rounded-xl text-rose-400">
            <Bell className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Keyword Rank Drop Alert System</span>
              {unreadCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {unreadCount} Unread
                </span>
              )}
            </h3>
            <p className="text-xs text-zinc-400">
              Configure rank thresholds for <strong className="text-zinc-200">{app.name}</strong> & track drop triggers
            </p>
          </div>
        </div>

        {/* Global Alert Status Toggle & Actions */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => onTriggerTestAlert()}
            className="flex items-center space-x-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            title="Simulate a rank drop to test notification triggers"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Simulate Rank Drop Alert</span>
          </button>

          <button
            onClick={handleToggleEnable}
            className={`flex items-center space-x-2 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              settings.enabled
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                : "bg-zinc-800 border-zinc-700 text-zinc-400"
            }`}
          >
            {settings.enabled ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Alerts Active</span>
              </>
            ) : (
              <>
                <BellOff className="w-4 h-4 text-zinc-400" />
                <span>Alerts Disabled</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sub Tabs: Triggered Alerts Log vs Threshold Config */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === "history"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Triggered Alerts Log ({appAlerts.length})</span>
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("config")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === "config"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Threshold Rules & Settings</span>
          </button>
        </div>

        {savedSuccess && (
          <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1 animate-fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>Alert settings saved!</span>
          </span>
        )}
      </div>

      {/* TAB 1: Triggered Alerts History Log */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-zinc-400">Filter Log:</span>
              <button
                onClick={() => setFilterSeverity("all")}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                  filterSeverity === "all"
                    ? "bg-zinc-800 text-white font-bold"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                All ({appAlerts.length})
              </button>
              <button
                onClick={() => setFilterSeverity("unread")}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                  filterSeverity === "unread"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold"
                    : "text-zinc-500 hover:text-rose-400"
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilterSeverity("high")}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                  filterSeverity === "high"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold"
                    : "text-zinc-500 hover:text-amber-400"
                }`}
              >
                High Severity
              </button>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark All Read</span>
                </button>
              )}
              {appAlerts.length > 0 && (
                <button
                  onClick={onClearAlerts}
                  className="text-xs text-rose-400 hover:text-rose-300 font-medium cursor-pointer flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </button>
              )}
            </div>
          </div>

          {filteredAlerts.length === 0 ? (
            <div className="text-center py-10 bg-zinc-950/40 rounded-xl border border-zinc-800/80 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/60 mx-auto" />
              <p className="text-sm font-semibold text-zinc-300">No active rank drop alerts triggered</p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Keywords are currently performing within your threshold boundaries (Top #{settings.dropThresholdRank} cutoff).
              </p>
              <button
                onClick={() => onTriggerTestAlert()}
                className="mt-3 inline-flex items-center space-x-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Simulate a rank drop alert now</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAlerts.map((alert) => {
                const matchedKw = app.keywords.find((k) => k.id === alert.keywordId);

                return (
                  <div
                    key={alert.id}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      !alert.read
                        ? alert.severity === "high"
                          ? "bg-rose-950/25 border-rose-500/40"
                          : "bg-amber-950/20 border-amber-500/40"
                        : "bg-zinc-950/40 border-zinc-800/80 opacity-80"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        {alert.type === "TOP_RANK_GAINED" ? (
                          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                            <ArrowUpRight className="w-4 h-4" />
                          </div>
                        ) : alert.severity === "high" ? (
                          <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                            <ArrowDownRight className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-xs">{alert.keywordName}</span>
                          <span
                            className={`text-[10px] px-2 py-0.2 rounded-full font-mono uppercase font-bold ${
                              alert.severity === "high"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : alert.severity === "medium"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            }`}
                          >
                            {alert.severity} priority
                          </span>
                          {!alert.read && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-ping" />
                          )}
                        </div>

                        <p className="text-xs text-zinc-300 font-medium">{alert.message}</p>
                        <p className="text-[10px] text-zinc-500">{alert.timestamp}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {matchedKw && onSelectKeyword && (
                        <button
                          onClick={() => onSelectKeyword(matchedKw)}
                          className="text-xs bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white px-2.5 py-1 rounded-lg font-medium cursor-pointer"
                        >
                          View Keyword
                        </button>
                      )}

                      {!alert.read && (
                        <button
                          onClick={() => onMarkAsRead(alert.id)}
                          className="text-xs bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 px-2.5 py-1 rounded-lg font-medium cursor-pointer"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Threshold Settings Form */}
      {activeTab === "config" && (
        <div className="space-y-5 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Rule 1: Rank Ceiling Cutoff */}
            <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 space-y-2">
              <label className="text-xs font-bold text-white block flex items-center justify-between">
                <span>1. Rank Drop Threshold Cutoff</span>
                <span className="font-mono text-indigo-400">Top #{settings.dropThresholdRank}</span>
              </label>
              <p className="text-[11px] text-zinc-400">
                Trigger an alert if a keyword's ranking drops worse than this position (e.g., dropping out of Top 10).
              </p>
              <div className="flex items-center space-x-2 pt-1">
                {[5, 10, 15, 20, 50].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() =>
                      handleSaveSettings({ ...settings, dropThresholdRank: num })
                    }
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                      settings.dropThresholdRank === num
                        ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                        : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    Top {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Rule 2: Single-Update Position Drop Delta */}
            <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 space-y-2">
              <label className="text-xs font-bold text-white block flex items-center justify-between">
                <span>2. Minimum Position Drop Jump</span>
                <span className="font-mono text-indigo-400">≥ {settings.minPositionDrop} positions</span>
              </label>
              <p className="text-[11px] text-zinc-400">
                Trigger an alert if a keyword loses this many positions or more in a single update step.
              </p>
              <div className="flex items-center space-x-2 pt-1">
                {[2, 3, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() =>
                      handleSaveSettings({ ...settings, minPositionDrop: num })
                    }
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                      settings.minPositionDrop === num
                        ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                        : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    ≥ {num} Ranks
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Checkbox Rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <label className="flex items-start space-x-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80 cursor-pointer hover:bg-zinc-900">
              <input
                type="checkbox"
                checked={settings.alertOnUnranked}
                onChange={(e) =>
                  handleSaveSettings({ ...settings, alertOnUnranked: e.target.checked })
                }
                className="mt-0.5 w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
              />
              <div>
                <span className="text-xs font-bold text-white block">Alert on Unranked Drop</span>
                <span className="text-[11px] text-zinc-400 block">
                  Send alert if keyword drops out of top 50 / becomes completely unranked
                </span>
              </div>
            </label>

            <label className="flex items-start space-x-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80 cursor-pointer hover:bg-zinc-900">
              <input
                type="checkbox"
                checked={settings.notifyOnImprovement}
                onChange={(e) =>
                  handleSaveSettings({ ...settings, notifyOnImprovement: e.target.checked })
                }
                className="mt-0.5 w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
              />
              <div>
                <span className="text-xs font-bold text-white block">Notify on Positive Leaps</span>
                <span className="text-[11px] text-zinc-400 block">
                  Also send milestone alerts when a keyword surges into Top 3 or Top 10
                </span>
              </div>
            </label>

            <label className="flex items-start space-x-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80 cursor-pointer hover:bg-zinc-900">
              <input
                type="checkbox"
                checked={settings.inAppToasts}
                onChange={(e) =>
                  handleSaveSettings({ ...settings, inAppToasts: e.target.checked })
                }
                className="mt-0.5 w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
              />
              <div>
                <span className="text-xs font-bold text-white block">In-App Banner Toasts</span>
                <span className="text-[11px] text-zinc-400 block">
                  Display floating interactive toast banners on screen when triggered
                </span>
              </div>
            </label>

            <label className="flex items-start space-x-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80 cursor-pointer hover:bg-zinc-900">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) =>
                  handleSaveSettings({ ...settings, emailNotifications: e.target.checked })
                }
                className="mt-0.5 w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
              />
              <div>
                <span className="text-xs font-bold text-white block">Email Dispatch Summaries</span>
                <span className="text-[11px] text-zinc-400 block">
                  Send immediate email notification for high-severity drops
                </span>
              </div>
            </label>
          </div>

          {/* Email Recipient Input */}
          {settings.emailNotifications && (
            <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>Alert Email Recipient</span>
              </label>
              <input
                type="email"
                value={settings.emailRecipient || ""}
                onChange={(e) => setSettings({ ...settings, emailRecipient: e.target.value })}
                onBlur={() => handleSaveSettings(settings)}
                placeholder="developer@company.com"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
