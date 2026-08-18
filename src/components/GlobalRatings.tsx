import React, { useState } from "react";
import { TrackedApp } from "../types";
import {
  Star,
  Globe2,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Filter,
  CheckCircle2,
  HeartHandshake,
} from "lucide-react";

interface GlobalRatingsProps {
  app: TrackedApp;
  countryName: string;
}

export const GlobalRatings: React.FC<GlobalRatingsProps> = ({
  app,
  countryName,
}) => {
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | null>(null);

  const mockReviews = [
    {
      id: "rev-1",
      author: "Alex_Dev26",
      rating: 5,
      date: "Aug 7, 2026",
      countryFlag: "🇺🇸",
      title: "Best AI Calendar on macOS & iOS!",
      content: "The time blocking feature combined with automatic meeting scheduling saved me hours every week.",
      sentiment: "Positive",
    },
    {
      id: "rev-2",
      author: "Kenji_Tokyo",
      rating: 5,
      date: "Aug 6, 2026",
      countryFlag: "🇯🇵",
      title: "素晴らしいアプリ！ (Wonderful App!)",
      content: "The Japanese localization and widget integration are flawless.",
      sentiment: "Positive",
    },
    {
      id: "rev-3",
      author: "Marie_Paris",
      rating: 4,
      date: "Aug 5, 2026",
      countryFlag: "🇫🇷",
      title: "Très bon planificateur",
      content: "Super intuitive interface. Would love a watchOS companion app in the next update.",
      sentiment: "Positive",
    },
    {
      id: "rev-4",
      author: "Lukas_Berlin",
      rating: 5,
      date: "Aug 4, 2026",
      countryFlag: "🇩🇪",
      title: "Perfect time management tool",
      content: "Very snappy native Mac experience and effortless sync with Google & Apple calendars.",
      sentiment: "Positive",
    },
  ];

  const filteredReviews = selectedStarFilter
    ? mockReviews.filter((r) => r.rating === selectedStarFilter)
    : mockReviews;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-indigo-950/40 border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 font-semibold text-xs mb-1">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>Worldwide App Store Review & Sentiment Analysis</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Global Ratings & Sentiment Distribution
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              Track global 5-star ratings, review volume trends, and user feedback across 60+ Apple storefronts for <strong className="text-zinc-200">{app.name}</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Ratings Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Rating Score Card */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xl text-center flex flex-col justify-center items-center">
          <span className="text-xs text-zinc-400 font-medium uppercase">
            Global Rating Score
          </span>
          <div className="text-5xl font-extrabold text-white font-mono tracking-tight">
            {app.averageUserRating}
          </div>
          <div className="flex items-center space-x-1 text-amber-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-5 h-5 fill-amber-400" />
            ))}
          </div>
          <p className="text-xs text-zinc-400 font-mono">
            Based on {app.userRatingCount.toLocaleString()} Ratings Worldwide
          </p>
        </div>

        {/* Rating Bar Distribution */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-2 shadow-xl col-span-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
            Rating Distribution Breakdown
          </h3>

          {[
            { stars: 5, pct: 88 },
            { stars: 4, pct: 8 },
            { stars: 3, pct: 2 },
            { stars: 2, pct: 1 },
            { stars: 1, pct: 1 },
          ].map((bar) => (
            <div
              key={bar.stars}
              onClick={() =>
                setSelectedStarFilter(selectedStarFilter === bar.stars ? null : bar.stars)
              }
              className={`flex items-center space-x-3 text-xs cursor-pointer p-1.5 rounded-xl transition-colors ${
                selectedStarFilter === bar.stars ? "bg-indigo-600/20 border border-indigo-500/40" : "hover:bg-zinc-800/60"
              }`}
            >
              <span className="font-bold text-amber-400 w-8 flex items-center space-x-1">
                <span>{bar.stars}</span>
                <Star className="w-3 h-3 fill-amber-400" />
              </span>
              <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                  style={{ width: `${bar.pct}%` }}
                />
              </div>
              <span className="w-10 text-right font-mono text-zinc-400">{bar.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span>Recent Storefront Reviews ({filteredReviews.length})</span>
          </h2>
          {selectedStarFilter && (
            <button
              onClick={() => setSelectedStarFilter(null)}
              className="text-xs text-indigo-400 hover:underline"
            >
              Clear Star Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-5 space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-base">{rev.countryFlag}</span>
                  <span className="font-bold text-white text-xs">{rev.author}</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">{rev.date}</span>
              </div>

              <div className="flex items-center space-x-1 text-amber-400">
                {Array.from({ length: rev.rating }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>

              <h4 className="font-bold text-zinc-100 text-xs">{rev.title}</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">{rev.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
