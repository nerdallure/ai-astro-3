export type Platform = "iOS" | "iPadOS" | "macOS" | "visionOS" | "watchOS";

export interface Country {
  code: string;
  name: string;
  flag: string;
}

export interface KeywordRankHistory {
  date: string;
  rank: number;
}

export interface TrackedKeyword {
  id: string;
  keyword: string;
  currentRank: number | null; // null if unranked
  previousRank: number | null;
  popularity: number; // Apple Search Ads score 1-100
  difficulty: number; // ASO difficulty 1-100
  estimatedInstalls: number;
  tags: string[];
  notes?: string;
  translationEn?: string;
  history: KeywordRankHistory[];
  lastUpdated: string;
}

export interface CompetitorApp {
  id: string;
  trackId?: number;
  name: string;
  developer: string;
  iconUrl: string;
  averageUserRating: number;
  userRatingCount: number;
  title: string;
  subtitle: string;
  category: string;
  topKeywords: { keyword: string; rank: number }[];
}

export interface AppMetadata {
  title: string; // Max 30 chars
  subtitle: string; // Max 30 chars
  keywordField: string; // Max 100 chars
}

export interface AppAlertSettings {
  enabled: boolean;
  dropThresholdRank: number; // e.g. 10 -> alert if rank drops worse than top 10
  minPositionDrop: number; // e.g. 3 -> alert if rank drops by >= 3 positions
  alertOnUnranked: boolean; // alert if keyword drops to unranked
  notifyOnImprovement: boolean; // alert on entering top 3/10
  emailNotifications: boolean;
  inAppToasts: boolean;
  emailRecipient?: string;
}

export interface RankingAlert {
  id: string;
  appId: string;
  appName: string;
  keywordId: string;
  keywordName: string;
  previousRank: number | null;
  currentRank: number | null;
  type: "DROPPED_BELOW_THRESHOLD" | "RANK_POSITIONS_DROPPED" | "BECOME_UNRANKED" | "TOP_RANK_GAINED";
  message: string;
  thresholdValue: number;
  timestamp: string;
  read: boolean;
  severity: "high" | "medium" | "low";
}

export interface TrackedApp {
  id: string;
  trackId?: number; // iTunes trackId if real app
  name: string;
  developer: string;
  category: string;
  iconUrl: string;
  bundleId: string;
  platform: Platform;
  country: string; // default e.g. "us"
  isTemporary: boolean; // if idea before launch
  metadata: AppMetadata;
  averageUserRating: number;
  userRatingCount: number;
  keywords: TrackedKeyword[];
  competitors: CompetitorApp[];
  alertSettings?: AppAlertSettings;
}

export interface AppStoreSearchResult {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl512: string;
  artworkUrl100: string;
  averageUserRating: number;
  userRatingCount: number;
  genres: string[];
  description: string;
  screenshotUrls: string[];
  sellerUrl?: string;
  price: number;
  formattedPrice: string;
  bundleId: string;
}

export interface AiAsoResponse {
  optimizedTitle: string;
  titleCharCount: number;
  optimizedSubtitle: string;
  subtitleCharCount: number;
  optimizedKeywordField: string;
  keywordFieldCharCount: number;
  estimatedOrganicReachBoost: string;
  actionableTips: string[];
  keywordBreakdown: {
    keyword: string;
    searchVolume: number;
    difficulty: number;
    relevanceScore: number;
    placement: string;
  }[];
}

export interface AiKeywordIdea {
  keyword: string;
  popularity: number;
  difficulty: number;
  opportunityScore: number;
  intent: string;
  suggestedTag: string;
}
