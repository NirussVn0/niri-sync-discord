import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ResolvedPresence } from "@presenced/contracts";
import { Radio } from "lucide-react";
import { cardReveal } from "../lib/animations.js";

interface DiscordPreviewProps {
  presence: ResolvedPresence | null | undefined;
  mediaArtUrl?: string | null | undefined;
  discordConnected?: boolean;
}

function formatDuration(sec: number): string {
  if (sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export const DiscordPreview = ({
  presence,
  mediaArtUrl,
  discordConnected = true,
}: DiscordPreviewProps) => {
  const [tickerSec, setTickerSec] = useState(0);

  useEffect(() => {
    if (!presence?.timestamps?.start && !presence?.timestamps?.end) {
      setTickerSec(0);
      return;
    }

    const updateTicker = () => {
      const now = Date.now();
      if (presence.timestamps?.end) {
        const remaining = Math.max(0, Math.floor((presence.timestamps.end - now) / 1000));
        setTickerSec(remaining);
      } else if (presence.timestamps?.start) {
        const elapsed = Math.max(0, Math.floor((now - presence.timestamps.start) / 1000));
        setTickerSec(elapsed);
      }
    };

    updateTicker();
    const interval = setInterval(updateTicker, 1000);
    return () => clearInterval(interval);
  }, [presence]);

  if (!presence) {
    return (
      <div className="p-3.5 rounded-niri-lg glass-float select-none text-center py-6 space-y-1">
        <svg className="w-5 h-5 text-text-ghost mx-auto" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
        </svg>
        <p className="text-xs font-semibold text-text-secondary">Discord Presence Idle</p>
        <p className="text-2xs text-text-muted">No activity currently broadcast to Discord RPC</p>
      </div>
    );
  }

  const firstChar = Array.from(presence.title || "P")[0] ?? "P";
  const isCountdown = !!presence.timestamps?.end;

  return (
    <motion.div
      className="p-3.5 rounded-niri-lg glass-float space-y-2.5 select-none"
      variants={cardReveal}
      initial="hidden"
      animate="visible"
      custom={0}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-2xs font-bold text-text-secondary uppercase tracking-wider">
          <svg className="w-3.5 h-3.5 text-scene-discord-from" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
          </svg>
          <span>Discord Rich Presence</span>
        </div>
        <motion.span
          className={`text-2xs px-2 py-0.5 rounded-niri font-mono ${
            discordConnected
              ? "bg-status-connected/10 text-status-connected border border-status-connected/20"
              : "bg-status-degraded/10 text-status-degraded border border-status-degraded/20"
          }`}
          animate={discordConnected ? { opacity: [0.7, 1, 0.7] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {discordConnected ? "RPC Active" : "RPC Offline"}
        </motion.span>
      </div>

      <div className="p-3 rounded-niri glass-surface flex items-start gap-3">
        {mediaArtUrl || presence.assets?.largeImage ? (
          <div className="relative flex-shrink-0">
            <img
              src={mediaArtUrl || presence.assets?.largeImage}
              alt="Presence Asset"
              className="w-12 h-12 rounded-niri object-cover bg-surface-solid border border-border"
            />
            {presence.assets?.smallImage && (
              <img
                src={presence.assets.smallImage}
                alt="Small Icon"
                className="w-4 h-4 rounded-full absolute -bottom-1 -right-1 border-2 border-background-solid bg-surface-solid"
              />
            )}
          </div>
        ) : (
          <div className="w-12 h-12 rounded-niri bg-scene-discord-from/20 border border-scene-discord-from/30 flex items-center justify-center flex-shrink-0 text-sm font-bold text-scene-discord-from">
            {firstChar}
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-0.5">
          <h3 className="text-xs font-bold text-text-primary tracking-tight truncate">
            {presence.title}
          </h3>
          {presence.details && (
            <p className="text-2xs text-text-secondary truncate">{presence.details}</p>
          )}
          {presence.state && (
            <p className="text-2xs text-text-muted truncate">{presence.state}</p>
          )}
          {(presence.timestamps?.start || presence.timestamps?.end) && (
            <p className="text-2xs text-text-muted font-mono pt-0.5 flex items-center gap-1">
              <Radio className="w-2.5 h-2.5 text-status-connected animate-pulse" />
              <span>{isCountdown ? `${formatDuration(tickerSec)} left` : `${formatDuration(tickerSec)} elapsed`}</span>
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};
