import React from "react";
import {
  TrendingUp,
  Search,
  Users,
  Smartphone,
  Sparkles,
  Star,
  Lightbulb,
  Tag,
  Download,
  Upload,
  Bell,
} from "lucide-react";

export type StudioTab =
  | "tracker"
  | "research"
  | "competitors"
  | "simulator"
  | "ai-metadata"
  | "ratings"
  | "alerts";

interface SidebarProps {
  activeTab: StudioTab;
  onSelectTab: (tab: StudioTab) => void;
  keywordCount: number;
  competitorCount: number;
  unreadAlertsCount?: number;
  onExportCsv: () => void;
  onImportCsv: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  keywordCount,
  competitorCount,
  unreadAlertsCount = 0,
  onExportCsv,
  onImportCsv,
}) => {
  const navItems: {
    id: StudioTab;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
    highlight?: boolean;
    badgeColor?: string;
  }[] = [
    {
      id: "tracker",
      label: "Keyword Rank Tracker",
      icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
      badge: keywordCount,
    },
    {
      id: "alerts",
      label: "Rank Drop Alerts",
      icon: <Bell className="w-4 h-4 text-rose-400" />,
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : undefined,
      badgeColor: "bg-rose-500 text-white font-bold animate-pulse",
    },
    {
      id: "research",
      label: "Keyword Research & ASA",
      icon: <Search className="w-4 h-4 text-blue-400" />,
    },
    {
      id: "competitors",
      label: "Competitors & Metadata",
      icon: <Users className="w-4 h-4 text-purple-400" />,
      badge: competitorCount,
    },
    {
      id: "simulator",
      label: "App Store Search Simulator",
      icon: <Smartphone className="w-4 h-4 text-indigo-400" />,
    },
    {
      id: "ai-metadata",
      label: "AI Metadata Optimizer",
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      highlight: true,
    },
    {
      id: "ratings",
      label: "Global Ratings & Reviews",
      icon: <Star className="w-4 h-4 text-amber-300" />,
    },
  ];

  return (
    <aside className="w-56 lg:w-60 bg-zinc-950 border-r border-zinc-800/80 flex flex-col justify-between shrink-0 hidden md:flex min-h-[calc(100vh-49px)]">
      {/* Navigation Group */}
      <div className="p-2.5 space-y-4">
        <div>
          <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
            AstroASO Suite
          </p>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-indigo-600/15 text-indigo-300 shadow-sm border border-indigo-500/30 font-semibold"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80"
                  }`}
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className={isActive ? "text-indigo-400" : ""}>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                          item.badgeColor
                            ? item.badgeColor
                            : isActive
                            ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold"
                            : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {item.highlight && !item.badge && (
                      <span className="text-[9px] bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold px-1.5 py-0.2 rounded-md shadow-sm">
                        AI
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Tools */}
        <div>
          <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
            Keywords Management
          </p>
          <div className="space-y-1 px-1">
            <button
              onClick={onExportCsv}
              className="w-full flex items-center space-x-2 px-2 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors border border-dashed border-zinc-800 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">Export CSV</span>
            </button>
            <button
              onClick={onImportCsv}
              className="w-full flex items-center space-x-2 px-2 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors border border-dashed border-zinc-800 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="truncate">Import CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="p-2.5 border-t border-zinc-900 bg-zinc-950/60">
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-2.5 text-xs space-y-1">
          <div className="flex items-center space-x-1.5 text-indigo-400 font-semibold text-[11px]">
            <Sparkles className="w-3 h-3 shrink-0" />
            <span className="truncate">Apple Search Ads</span>
          </div>
          <p className="text-[10px] text-zinc-400 leading-snug">
            Ranks synced across 60+ storefronts.
          </p>
          <div className="pt-0.5 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
            <span>Status:</span>
            <span className="text-emerald-400 font-medium">● Live</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
