import React, { useEffect } from "react";
import { RankingAlert } from "../types";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, X, Bell } from "lucide-react";

interface ToastAlertProps {
  alert: RankingAlert | null;
  onDismiss: () => void;
  onOpenAlertsPanel?: () => void;
}

export const ToastAlert: React.FC<ToastAlertProps> = ({
  alert,
  onDismiss,
  onOpenAlertsPanel,
}) => {
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [alert, onDismiss]);

  if (!alert) return null;

  const isPositive = alert.type === "TOP_RANK_GAINED";
  const isHighSeverity = alert.severity === "high";

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-slide-up shadow-2xl">
      <div
        className={`p-4 rounded-2xl border backdrop-blur-md flex items-start space-x-3.5 shadow-2xl ${
          isPositive
            ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-100"
            : isHighSeverity
            ? "bg-rose-950/90 border-rose-500/60 text-rose-100"
            : "bg-zinc-900/95 border-amber-500/50 text-amber-100"
        }`}
      >
        <div className="mt-0.5 shrink-0">
          {isPositive ? (
            <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          ) : isHighSeverity ? (
            <div className="p-2 bg-rose-500/20 rounded-xl text-rose-400 animate-bounce">
              <AlertTriangle className="w-5 h-5" />
            </div>
          ) : (
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          )}
        </div>

        <div className="space-y-1 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center space-x-1 opacity-90">
              <Bell className="w-3 h-3" />
              <span>Keyword Rank Alert</span>
            </span>
            <button
              onClick={onDismiss}
              className="text-zinc-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs font-bold">{alert.appName}</p>
          <p className="text-xs font-medium leading-snug opacity-95">{alert.message}</p>

          <div className="pt-1 flex items-center space-x-3">
            {onOpenAlertsPanel && (
              <button
                onClick={() => {
                  onOpenAlertsPanel();
                  onDismiss();
                }}
                className="text-[11px] font-bold underline cursor-pointer hover:opacity-80"
              >
                View Alert Settings & Log →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
