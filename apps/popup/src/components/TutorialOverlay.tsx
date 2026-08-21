/**
 * TutorialOverlay — first-run tutorial with credit.
 * Shows on first launch, can be dismissed.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { springNiri } from "../lib/animations.js";
import { X, Sparkles, Music, MessageSquare, Clock, Shield } from "lucide-react";

const TUTORIAL_KEY = "presenced-tutorial-seen";

export const TutorialOverlay = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(TUTORIAL_KEY);
    if (!seen) setShow(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(TUTORIAL_KEY, "true");
    setShow(false);
  };

  if (!show) return null;

  const features = [
    { icon: Music, label: "Music Player", desc: "Spinning vinyl + waveform" },
    { icon: MessageSquare, label: "Discord RPC", desc: "Live status sync" },
    { icon: Clock, label: "Pomodoro", desc: "Focus timer" },
    { icon: Shield, label: "Privacy", desc: "Mask sensitive data" },
  ];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={dismiss} />

          {/* Card */}
          <motion.div
            className="relative z-10 glass-strong rounded-niri-xl p-6 max-w-sm w-full mx-4 space-y-4"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={springNiri}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={dismiss}
              className="absolute top-3 right-3 p-1 rounded-niri glass-surface text-text-secondary hover:text-text-primary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="text-center space-y-2">
              <motion.div
                className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-accent-primary to-scene-music-from flex items-center justify-center"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <h2 className="text-lg font-bold text-text-primary">Welcome to presenced</h2>
              <p className="text-xs text-text-secondary">
                Niri Wayland × Discord Sync Companion
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-2">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.label} className="p-2.5 rounded-niri glass-surface text-center space-y-1">
                    <Icon className="w-4 h-4 mx-auto text-accent-primary" />
                    <div className="text-2xs font-bold text-text-primary">{f.label}</div>
                    <div className="text-2xs text-text-muted">{f.desc}</div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={dismiss}
              className="w-full py-2 rounded-niri bg-accent-primary hover:bg-accent-glow text-white font-bold text-sm transition-colors"
            >
              Get Started
            </button>

            {/* Credit */}
            <div className="text-center text-2xs text-text-ghost">
              Built by NirussVn0 · presenced v0.5.0
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
