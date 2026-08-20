import { useState, useEffect, type FormEvent } from "react";
import { ActivityCategory } from "@presenced/contracts";
import { X, Sparkles } from "lucide-react";

interface ManualOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    title: string;
    category: ActivityCategory;
    details?: string;
    durationSeconds?: number;
  }) => void;
}

const CATEGORIES: { value: ActivityCategory; label: string }[] = [
  { value: "manual", label: "Manual (General)" },
  { value: "coding", label: "Coding" },
  { value: "gaming", label: "Gaming" },
  { value: "recording", label: "Recording / Streaming" },
  { value: "music", label: "Music Listening" },
  { value: "video", label: "Watching Video" },
  { value: "terminal", label: "Terminal Hacking" },
  { value: "browser", label: "Research / Browsing" },
];

const DURATIONS = [
  { label: "Until cleared", seconds: 0 },
  { label: "15 minutes", seconds: 900 },
  { label: "30 minutes", seconds: 1800 },
  { label: "1 hour", seconds: 3600 },
  { label: "2 hours", seconds: 7200 },
];

export const ManualOverrideModal = ({
  isOpen,
  onClose,
  onSubmit,
}: ManualOverrideModalProps) => {
  const [title, setTitle] = useState("Deep Focus");
  const [category, setCategory] = useState<ActivityCategory>("manual");
  const [details, setDetails] = useState("Do Not Disturb");
  const [durationSeconds, setDurationSeconds] = useState(0);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      category,
      ...(details.trim() ? { details: details.trim() } : {}),
      ...(durationSeconds > 0 ? { durationSeconds } : {}),
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="override-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="bg-surface border border-surface-border rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 id="override-modal-title" className="text-base font-bold text-white">
                Set Manual Override
              </h3>
              <p className="text-xs text-slate-400">Overrides automatic desktop detection</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Activity Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Studying, Gaming, Recording"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ActivityCategory)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:border-indigo-500 focus:outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Details (Optional)
            </label>
            <input
              type="text"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g. Working on presenced"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Duration Expiry
            </label>
            <select
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:border-indigo-500 focus:outline-none"
            >
              {DURATIONS.map((dur) => (
                <option key={dur.seconds} value={dur.seconds}>
                  {dur.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-colors"
            >
              Apply Override
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
