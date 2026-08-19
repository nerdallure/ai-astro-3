import React, { useState } from "react";
import {
  Sparkles,
  TrendingUp,
  Search,
  Users,
  Smartphone,
  Globe,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Zap,
  Star,
  Download,
  ArrowRight,
  ShieldCheck,
  Laptop,
  Lightbulb,
  Sun,
  Moon,
  BarChart3,
  FileSpreadsheet,
  Layers,
  Bot,
  Bell,
  Award,
  Check,
  ExternalLink,
  HelpCircle,
  Play,
} from "lucide-react";

interface LandingPageProps {
  onLaunchStudio: () => void;
  theme?: "dark" | "light";
  onToggleTheme?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchStudio,
  theme = "dark",
  onToggleTheme,
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [activePreviewTab, setActivePreviewTab] = useState<
    "tracker" | "research" | "simulator" | "competitors"
  >("tracker");

  const faqs = [
    {
      q: "How does Astro calculate keyword search volume and difficulty?",
      a: "Astro pulls real-time popularity scores (0–100) directly from Apple Search Ads API data for over 60 storefront countries. Difficulty scores are algorithmically computed based on top-ranking apps' domain authority, rating counts, keyword placement in Title/Subtitle, and download velocity.",
    },
    {
      q: "Do I need to connect my Apple Developer Account to use Astro?",
      a: "No! Astro operates completely standalone. You don't need to share your Apple ID, App Store Connect credentials, or API keys. You can search any public iOS, iPadOS, macOS, visionOS, or watchOS app instantly.",
    },
    {
      q: "Can I track app ideas before building or publishing them?",
      a: "Yes! Astro features a dedicated Pre-Launch & Temporary Apps module. You can validate keyword demand, search volume, and competitor saturation for unreleased concepts before writing a single line of Swift code.",
    },
    {
      q: "How do I export my data or share reports with clients?",
      a: "Astro supports 1-click CSV bulk exports and imports (compatible with App Store Connect, Sensor Tower, App Annie) as well as comprehensive multi-page executive PDF reports with charts, rank heatmaps, and keyword scatter plots.",
    },
    {
      q: "How can I deploy and host this Astro website on my own domain?",
      a: "You can export the codebase directly to GitHub or download as a ZIP file from Google AI Studio. Run `npm run build` to generate static files in the `dist/` directory and deploy to Vercel, Netlify, Cloudflare Pages, or Cloud Run in under 2 minutes with custom domain support (e.g. tryastro.app).",
    },
    {
      q: "Which App Store platforms and countries are supported?",
      a: "Astro supports all Apple platforms (iOS, iPadOS, macOS, visionOS, and watchOS) across 60+ storefront countries including United States, United Kingdom, Japan, Germany, France, Canada, Australia, South Korea, Brazil, and more.",
    },
  ];

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen selection:bg-indigo-500 selection:text-white font-sans">
      {/* Top Notification Announcement Bar */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-700 to-purple-900 text-white text-xs py-2 px-4 text-center font-medium border-b border-indigo-500/30 flex items-center justify-center space-x-2">
        <span className="bg-indigo-500 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-sm">
          New
        </span>
        <span>AstroASO 2.0 is live with Gemini AI Metadata Generator & Apple Search Ads 60+ Country Data</span>
        <button
          onClick={onLaunchStudio}
          className="underline hover:text-indigo-200 font-bold ml-1 flex items-center space-x-1 cursor-pointer"
        >
          <span>Try Now</span>
          <ArrowRight className="w-3 h-3 inline" />
        </button>
      </div>

      {/* Navigation Bar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onLaunchStudio}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-xl tracking-tight text-white">AstroASO</span>
              <span className="text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono font-semibold">
                Studio
              </span>
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-zinc-300">
          <a href="#features" className="hover:text-indigo-400 transition-colors">
            Features
          </a>
          <a href="#demo" className="hover:text-indigo-400 transition-colors">
            Live Preview
          </a>
          <a href="#tools" className="hover:text-indigo-400 transition-colors">
            ASO Tools
          </a>
          <a href="#faq" className="hover:text-indigo-400 transition-colors">
            FAQ
          </a>
        </nav>

        <div className="flex items-center space-x-3">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center space-x-1 text-xs"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline text-xs font-medium text-amber-300">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span className="hidden sm:inline text-xs font-medium text-indigo-400">Dark</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={onLaunchStudio}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-1.5 cursor-pointer border border-indigo-400/20"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 max-w-7xl mx-auto text-center space-y-8 overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 px-4 py-1.5 rounded-full text-xs font-semibold text-indigo-300 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>The #1 App Store Optimization Suite for Apple Developers</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
          Discover keywords your users are searching for.{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Grow 10x faster.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-zinc-300 max-w-3xl mx-auto leading-relaxed">
          Track keyword rankings across 60+ storefronts in real-time. Uncover competitor keyword gaps, analyze official Apple Search Ads popularity data, and generate optimized AI metadata for iOS, iPadOS, macOS, and visionOS apps.
        </p>

        {/* Hero CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={onLaunchStudio}
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm px-8 py-4 rounded-xl shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2.5 cursor-pointer border border-indigo-400/30 group"
          >
            <span>Launch Interactive Studio Workspace</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <p className="text-xs text-zinc-400 flex items-center justify-center space-x-4">
          <span className="flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>No Apple ID or credit card needed</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>60+ Storefront Countries</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Official ASA Popularity Data</span>
          </span>
        </p>

        {/* Trust Metrics Counter Bar */}
        <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="bg-zinc-900/80 border border-zinc-800/80 p-4 rounded-2xl">
            <p className="text-2xl sm:text-3xl font-extrabold text-white">4,850+</p>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">iOS Apps Optimized</p>
          </div>
          <div className="bg-zinc-900/80 border border-zinc-800/80 p-4 rounded-2xl">
            <p className="text-2xl sm:text-3xl font-extrabold text-indigo-400">60+</p>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">Storefront Countries</p>
          </div>
          <div className="bg-zinc-900/80 border border-zinc-800/80 p-4 rounded-2xl">
            <p className="text-2xl sm:text-3xl font-extrabold text-purple-400">1.4M+</p>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">Keywords Tracked</p>
          </div>
          <div className="bg-zinc-900/80 border border-zinc-800/80 p-4 rounded-2xl">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">99.8%</p>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">Search Accuracy</p>
          </div>
        </div>

        {/* Interactive Desktop Studio Preview Frame */}
        <div id="demo" className="pt-10 max-w-5xl mx-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-left border-t-2 border-t-indigo-500/60">
            {/* macOS Window Titlebar */}
            <div className="bg-zinc-950 px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs text-zinc-400 font-mono ml-2 font-semibold">
                  Astro Studio — ASO Suite for iOS & macOS Developers
                </span>
              </div>
              <button
                onClick={onLaunchStudio}
                className="text-xs bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-indigo-500 transition-colors flex items-center space-x-1"
              >
                <span>Launch Full App</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Interactive Preview Sub-Tabs */}
            <div className="bg-zinc-950/80 px-4 py-2 border-b border-zinc-800 flex items-center space-x-2 overflow-x-auto text-xs">
              <button
                onClick={() => setActivePreviewTab("tracker")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activePreviewTab === "tracker"
                    ? "bg-indigo-600 text-white font-bold"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Keyword Tracker
              </button>
              <button
                onClick={() => setActivePreviewTab("research")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activePreviewTab === "research"
                    ? "bg-indigo-600 text-white font-bold"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                AI Keyword Generator
              </button>
              <button
                onClick={() => setActivePreviewTab("simulator")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activePreviewTab === "simulator"
                    ? "bg-indigo-600 text-white font-bold"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Live Search Simulator
              </button>
            </div>

            {/* Window Content based on selected interactive preview tab */}
            <div className="p-6 bg-zinc-950 space-y-4">
              {activePreviewTab === "tracker" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-zinc-900 p-4 rounded-xl border border-zinc-800 gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-lg shadow-md">
                        A
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">Astro Calendar & AI Planner</h4>
                        <p className="text-xs text-zinc-400">iOS • United States 🇺🇸 • 7 Keywords Tracked</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-bold">
                        ● #1 Organic Rank in US
                      </span>
                      <span className="text-xs text-indigo-300 font-mono bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg font-bold">
                        Avg Rank: 2.8
                      </span>
                    </div>
                  </div>

                  {/* Sample keyword table inside frame */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden text-xs">
                    <div className="grid grid-cols-5 bg-zinc-950 text-zinc-400 uppercase tracking-wider text-[10px] p-3 border-b border-zinc-800 font-bold">
                      <span className="col-span-2">Tracked Keyword</span>
                      <span>Current Rank</span>
                      <span>ASA Popularity</span>
                      <span>Difficulty</span>
                    </div>
                    <div className="divide-y divide-zinc-800/60 p-2 space-y-1 font-medium">
                      <div className="grid grid-cols-5 items-center p-2 rounded-lg hover:bg-zinc-800/40">
                        <span className="col-span-2 font-bold text-white flex items-center space-x-1.5">
                          <span className="text-amber-400">★</span>
                          <span>ai calendar</span>
                        </span>
                        <span className="text-emerald-400 font-bold font-mono">#2 (▲ +2)</span>
                        <span className="text-amber-300 font-mono font-bold">78 / 100 🔥</span>
                        <span className="text-emerald-400 font-mono">42 / 100</span>
                      </div>
                      <div className="grid grid-cols-5 items-center p-2 rounded-lg hover:bg-zinc-800/40">
                        <span className="col-span-2 font-bold text-white flex items-center space-x-1.5">
                          <span className="text-amber-400">★</span>
                          <span>time blocking app</span>
                        </span>
                        <span className="text-amber-300 font-bold font-mono">#1 (🏆 Trophy)</span>
                        <span className="text-amber-300 font-mono font-bold">64 / 100</span>
                        <span className="text-emerald-400 font-mono">35 / 100</span>
                      </div>
                      <div className="grid grid-cols-5 items-center p-2 rounded-lg hover:bg-zinc-800/40">
                        <span className="col-span-2 font-bold text-white flex items-center space-x-1.5">
                          <span className="text-zinc-600">☆</span>
                          <span>schedule planner</span>
                        </span>
                        <span className="text-indigo-300 font-bold font-mono">#4 (▲ +1)</span>
                        <span className="text-amber-300 font-mono font-bold">85 / 100 🔥</span>
                        <span className="text-rose-400 font-mono">68 / 100</span>
                      </div>
                      <div className="grid grid-cols-5 items-center p-2 rounded-lg hover:bg-zinc-800/40">
                        <span className="col-span-2 font-bold text-white flex items-center space-x-1.5">
                          <span className="text-zinc-600">☆</span>
                          <span>daily routine tracker</span>
                        </span>
                        <span className="text-emerald-400 font-bold font-mono">#3 (▲ +4)</span>
                        <span className="text-zinc-300 font-mono">52 / 100</span>
                        <span className="text-emerald-400 font-mono">29 / 100</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === "research" && (
                <div className="space-y-4">
                  <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                        <Bot className="w-4 h-4 text-indigo-400" />
                        <span>AI Bulk Keyword Variation Generator (Gemini 2.5)</span>
                      </h4>
                      <span className="text-xs bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-mono font-bold">
                        1-Click Add
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {[
                        { kw: "ai calendar schedule assistant", pop: 74, diff: 38, tag: "High Demand" },
                        { kw: "smart time block organizer", pop: 68, diff: 31, tag: "Easy Win" },
                        { kw: "weekly focus planner widget", pop: 62, diff: 28, tag: "Low Competition" },
                        { kw: "ios habit routine schedule", pop: 79, diff: 45, tag: "Trending" },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-bold text-white">{item.kw}</p>
                            <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                              Pop: <span className="text-amber-300 font-bold">{item.pop}</span> • Diff:{" "}
                              <span className="text-emerald-400">{item.diff}</span>
                            </p>
                          </div>
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded font-medium">
                            {item.tag}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === "simulator" && (
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-xs font-bold text-white flex items-center space-x-2">
                      <Smartphone className="w-4 h-4 text-blue-400" />
                      <span>App Store Live Search: "ai calendar" (US Storefront 🇺🇸)</span>
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono">10 Organic + Search Ads Placements</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="bg-zinc-950 p-3 rounded-lg border border-amber-500/30 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-mono font-bold">
                          Ad
                        </span>
                        <div>
                          <p className="font-bold text-white">Motion: AI Task & Calendar</p>
                          <p className="text-[11px] text-zinc-400">Sponsored Apple Search Ads Placement</p>
                        </div>
                      </div>
                      <span className="text-xs text-amber-400 font-mono font-bold">$2.40 Est. CPT</span>
                    </div>

                    <div className="bg-zinc-950 p-3 rounded-lg border border-indigo-500/40 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-mono font-extrabold text-emerald-400">#1</span>
                        <div>
                          <p className="font-bold text-white">Astro Calendar & AI Planner (Your App)</p>
                          <p className="text-[11px] text-zinc-400">Time Blocking, Routine & Schedule</p>
                        </div>
                      </div>
                      <span className="text-xs text-emerald-400 font-mono font-bold">● Ranked #1</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid Section */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto border-t border-zinc-900 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            Engineered for High-Growth iOS & macOS Apps
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Everything you need for App Store Optimization
          </h2>
          <p className="text-sm text-zinc-400 max-w-2xl mx-auto">
            Stop guessing keyword volume. Astro gives you the exact telemetry and AI tools to rank #1 and convert organic searchers into paying subscribers.
          </p>
        </div>

        <div id="tools" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl space-y-3 hover:border-zinc-700 transition-all shadow-md">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Real-time Rank Tracking & 30D Trends</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Track daily rank fluctuations across 60+ countries with interactive historical charts, Top 1/3/10 indicators, and estimated install metrics.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl space-y-3 hover:border-zinc-700 transition-all shadow-md">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Official Apple Search Ads (ASA) Telemetry</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Access real 0–100 search volume scores directly from Apple Search Ads to uncover high-intent, low-competition keyword goldmines.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl space-y-3 hover:border-zinc-700 transition-all shadow-md">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Competitor Keyword Gap Inspector</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Benchmark against top category competitors, extract their Title/Subtitle keywords, and pinpoint untouched keyword gaps to steal market share.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl space-y-3 hover:border-zinc-700 transition-all shadow-md">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Live On-Device Search Simulator</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Preview exact search results as they appear on iPhone, iPad, Mac, and Apple Vision Pro screens with sponsored ad placements.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl space-y-3 hover:border-zinc-700 transition-all shadow-md">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Star className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Global Storefront Ratings & Analytics</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Track global sentiment, star ratings distribution, and localized user feedback across every Apple App Store market worldwide.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl space-y-3 hover:border-zinc-700 transition-all shadow-md">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Automated Rank Drop Alerts & Thresholds</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Set customized alerts to receive immediate notifications if a top-3 ranking slips, allowing you to react and protect organic revenue immediately.
            </p>
          </div>
        </div>
      </section>

      {/* Customer Testimonials & Reviews */}
      <section className="py-16 px-6 max-w-7xl mx-auto border-t border-zinc-900 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
            Loved by Indie Hackers & Apple Developers
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Trusted by founders scaling to 6-figure MRR
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl space-y-4">
            <div className="flex text-amber-400 space-x-1 text-xs">
              {"★★★★★"}
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed italic">
              "Astro replaced our expensive $250/month Sensor Tower subscription. Getting real Apple Search Ads popularity data directly inside a clean desktop UI has tripled our keyword visibility in Japan and Germany."
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 font-bold flex items-center justify-center text-xs text-white">
                ML
              </div>
              <div>
                <p className="text-xs font-bold text-white">Max Lawrence</p>
                <p className="text-[10px] text-zinc-400">Founder of HabitFlow (500k+ downloads)</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl space-y-4">
            <div className="flex text-amber-400 space-x-1 text-xs">
              {"★★★★★"}
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed italic">
              "The competitor gap inspector is pure magic. We found 15 high-volume keywords our competitors had in their subtitles that we were missing. We updated our metadata and jumped from #18 to #2 in 4 days."
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <div className="w-8 h-8 rounded-full bg-purple-600 font-bold flex items-center justify-center text-xs text-white">
                SC
              </div>
              <div>
                <p className="text-xs font-bold text-white">Sarah Chen</p>
                <p className="text-[10px] text-zinc-400">Lead iOS Engineer, Minimal Studio</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl space-y-4">
            <div className="flex text-amber-400 space-x-1 text-xs">
              {"★★★★★"}
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed italic">
              "The temporary apps tool is an absolute lifesaver. Before spending 2 months writing Swift code, I check keyword demand in Astro. It saved me from launching an app into a dead search niche."
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 font-bold flex items-center justify-center text-xs text-white">
                DB
              </div>
              <div>
                <p className="text-xs font-bold text-white">David B.</p>
                <p className="text-[10px] text-zinc-400">Indie Hacker & Creator of 4 visionOS apps</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-20 px-6 max-w-4xl mx-auto border-t border-zinc-900 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
            Got Questions?
          </span>
          <h2 className="text-3xl font-extrabold text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-zinc-400">Everything you need to know about Astro ASO Suite and data accuracy.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-sm font-bold text-white hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-indigo-400 shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0 ml-2" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-zinc-300 leading-relaxed border-t border-zinc-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Final Call to Action Banner */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-700 to-purple-900 border border-indigo-500/40 rounded-3xl p-10 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to dominate App Store search rankings?
            </h2>
            <p className="text-sm text-indigo-100 leading-relaxed">
              Join thousands of iOS & macOS developers who use Astro to find high-traffic keywords, optimize metadata, and grow organic downloads.
            </p>
            <div className="pt-2">
              <button
                onClick={onLaunchStudio}
                className="bg-white hover:bg-zinc-100 text-indigo-900 font-extrabold text-sm px-8 py-4 rounded-xl shadow-2xl transition-all cursor-pointer inline-flex items-center space-x-2"
              >
                <span>Launch Interactive Astro Studio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-indigo-200">No credit card required • Instant access</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-12 px-6 max-w-7xl mx-auto text-xs text-zinc-400 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-sm">AstroASO</span>
            <span className="text-[10px] text-zinc-500 ml-1">Studio</span>
          </div>

          <div className="flex items-center space-x-6 text-zinc-400">
            <a href="#features" className="hover:text-white">
              Features
            </a>
            <a href="#faq" className="hover:text-white">
              FAQ
            </a>
            <button onClick={onLaunchStudio} className="hover:text-white text-indigo-400 font-bold">
              Open App
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-zinc-900/80 text-[11px] text-zinc-500">
          <p>© 2026 AstroASO. All rights reserved. Built for Apple Developers.</p>
          <p>Apple, App Store, iOS, macOS, iPadOS, visionOS are trademarks of Apple Inc.</p>
        </div>
      </footer>
    </div>
  );
};
